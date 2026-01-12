import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { PlaylistCard } from './PlaylistCard';
import { AddResourceModal } from '../modals/AddResourceModal';

interface ApiResourceItem {
  id: string;
  titulo: string;
  autor?: { nome: string };
  tags?: { nome: string }[];
  mime_type?: string;
  visualizacoes: number;
  downloads: number;
  curtidas: number;
  is_destaque: boolean;
  estrutura: 'UPLOAD' | 'URL' | 'NOTA';
}
import { AddToPlaylistModal } from '../modals/AddToPlaylistModal';
import { RemoveResourceModal } from './RemoveResourceModal';
import type { Resource, Playlist } from './types';

const API_URL = 'https://acervomestrebackend.onrender.com';

const ITEMS_PER_PAGE = 4;

interface Tag {
  id: number;
  nome: string;
}

interface HomeProps {
  onPlaylistClick: (playlistId: string) => void;
  onResourceClick: (resourceId: string) => void;
}

export function Home({ onPlaylistClick, onResourceClick }: HomeProps) {
  const [allFilteredResources, setAllFilteredResources] = useState<Resource[]>([]);
  const [highlightedResources, setHighlightedResources] = useState<(Resource | Playlist)[]>([]);
  const [mostSavedResources, setMostSavedResources] = useState<Resource[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Estados dos Modais
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const [indices, setIndices] = useState({
    highlighted: 0,
    mostSaved: 0,
    recent: 0
  });

  useEffect(() => {
    const init = async () => {
      await fetchTags();
      await fetchContent();
    };
    init();
  }, []);

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const response = await fetch(`${API_URL}/tags/get_all`, { headers });
      if (response.ok) {
        const data = await response.json();
        setTags(Array.isArray(data) ? data : data.items || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchContent = async (query: string = '') => {
    setIsLoading(true);
    setIsSearching(!!query);
    setIndices({ highlighted: 0, mostSaved: 0, recent: 0 });
    
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Uso de timestamp (Date.now) para garantir que o navegador busque dados novos do servidor
      const response = await fetch(`${API_URL}/recursos/get_all?page=1&per_page=100&t=${Date.now()}`, { headers });
      
      if (response.ok) {
        const resData = await response.json();
        const rawItems = resData.items || [];

        let mappedResources = rawItems.map((item: ApiResourceItem) => {
          let type = 'Documento';
          let style = { bgColor: 'bg-blue-50', iconColor: 'text-blue-400', icon: 'file' };

          if (item.estrutura === 'NOTA') {
            type = 'NOTA';
            style = { bgColor: 'bg-red-50', iconColor: 'text-red-400', icon: 'document' };
          } else if (item.estrutura === 'URL') {
            type = 'LINK';
            style = { bgColor: 'bg-gray-50', iconColor: 'text-gray-400', icon: 'link' };
          } else if (item.estrutura === 'UPLOAD') {
            if (item.mime_type?.includes('pdf')) {
              type = 'PDF';
              style = { bgColor: 'bg-green-50', iconColor: 'text-green-400', icon: 'download' };
            } else if (item.mime_type?.includes('video')) {
              type = 'Vídeo';
              style = { bgColor: 'bg-purple-50', iconColor: 'text-purple-400', icon: 'video' };
            }
          }

          return {
            id: `res-${item.id}`,
            realId: Number(item.id), // Preservamos o ID numérico para ordenação cronológica
            title: item.titulo,
            author: item.autor?.nome || 'Professor',
            subject: item.tags?.[0]?.nome || 'Geral',
            allTags: item.tags?.map((t: { nome: string }) => t.nome) || [],
            year: 'Ensino Médio',
            type: type,
            icon: style.icon,
            bgColor: style.bgColor,
            iconColor: style.iconColor,
            views: item.visualizacoes,
            downloads: item.downloads,
            likes: item.curtidas,
            isPlaylist: false,
            is_destaque: item.is_destaque
          };
        });

        if (query) {
          const lowerQuery = query.toLowerCase();
          mappedResources = mappedResources.filter((r: any) => 
            r.title.toLowerCase().includes(lowerQuery) || 
            r.allTags.some((tagName: string) => tagName.toLowerCase() === lowerQuery) ||
            r.type.toLowerCase() === lowerQuery
          );
          setAllFilteredResources(mappedResources);
        } else {
          // IMPLEMENTAÇÃO DA ORDENAÇÃO: Maior ID (mais recente) primeiro
          const sortedRecents = [...mappedResources].sort((a, b) => b.realId - a.realId);
          setRecentResources(sortedRecents);
          
          setMostSavedResources([...mappedResources].sort((a, b) => (b.likes || 0) - (a.likes || 0)));
          const highlights = mappedResources.filter((r: any) => r.is_destaque);

          const plResponse = await fetch(`${API_URL}/playlists/get_all?page=1&per_page=20`, { headers });
          if (plResponse.ok) {
            const plData = await plResponse.json();
            const mappedPlaylists = (plData.items || []).map((item: any) => ({
              id: `pl-${item.id}`,
              title: item.titulo,
              isPlaylist: true,
              resources: item.quantidade_recursos,
              bgColor: 'bg-teal-100',
              iconColor: 'text-teal-700',
              visibility: item.visibilidade || 'Público'
            }));
            setHighlightedResources([...mappedPlaylists, ...highlights]);
          } else {
            setHighlightedResources(highlights);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para Playlists
  const handleEditPlaylist = (playlist: Playlist) => {
    console.log("Editar playlist:", playlist.id);
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    const confirmed = window.confirm(`Deseja realmente excluir a playlist "${playlist.title}"?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('accessToken');
      const numericId = playlist.id.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/playlists/delete/${numericId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchContent();
      } else {
        alert("Erro ao excluir playlist.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenPlaylistModal = (resource: Resource) => {
    setSelectedResource(resource);
    setIsAddToPlaylistOpen(true);
  };

  const handleOpenRemoveModal = (resource: Resource) => {
    setSelectedResource(resource);
    setIsRemoveModalOpen(true);
  };

  const handleNext = (section: keyof typeof indices, total: number) => {
    setIndices(prev => ({
      ...prev,
      [section]: Math.min(prev[section] + ITEMS_PER_PAGE, Math.max(0, total - ITEMS_PER_PAGE))
    }));
  };

  const handlePrev = (section: keyof typeof indices) => {
    setIndices(prev => ({
      ...prev,
      [section]: Math.max(prev[section] - ITEMS_PER_PAGE, 0)
    }));
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSelectedFilter(null);
      fetchContent(searchQuery);
    }
  };

  const handleFilterClick = (filterValue: string) => {
    const newValue = selectedFilter === filterValue ? null : filterValue;
    setSelectedFilter(newValue);
    setSearchQuery(newValue || '');
    fetchContent(newValue || '');
  };

  const handleCardClick = (resource: Resource) => {
    const id = resource.id.replace(/\D/g, '');
    resource.isPlaylist ? onPlaylistClick(id) : onResourceClick(id);
  };

  const SectionHeader = ({ title, section, currentIdx, total }: { title: string, section: keyof typeof indices, currentIdx: number, total: number }) => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      <div className="flex gap-2">
        <button 
          onClick={() => handlePrev(section)}
          disabled={currentIdx === 0}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => handleNext(section, total)}
          disabled={currentIdx + ITEMS_PER_PAGE >= total}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
  return (
    <div className="p-8 w-full min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Procurar por conteúdo ou tag..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap items-center">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleFilterClick(tag.nome)}
                className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                  selectedFilter === tag.nome ? 'bg-teal-600 text-white' : 'bg-white text-gray-600'
                }`}
              >
                {tag.nome}
              </button>
            ))}
          </div>
          <button onClick={() => setIsResourceModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors shadow-sm whitespace-nowrap">
            <Plus className="w-5 h-5" /> Adicionar Recurso
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
        </div>
      ) : isSearching ? (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Resultados da busca ({allFilteredResources.length})</h2>
            <button 
              onClick={() => { setSearchQuery(''); setIsSearching(false); setSelectedFilter(null); fetchContent(''); }}
              className="text-teal-600 hover:underline text-sm font-medium"
            >
              Voltar ao início
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {allFilteredResources.map((res) => (
              <div key={res.id} onClick={() => handleCardClick(res)} className="cursor-pointer">
                <ResourceCard 
                    resource={res} 
                    onAddToPlaylistClick={handleOpenPlaylistModal}
                    onRemoveClick={handleOpenRemoveModal}
                />
              </div>
            ))}
          </div>
          {allFilteredResources.length === 0 && (
            <div className="text-center py-10 text-gray-500">Nenhum resultado encontrado.</div>
          )}
        </section>
      ) : (
        <div className="space-y-12">
          {highlightedResources.length > 0 && (
            <section>
              <SectionHeader 
                title="Destaque" 
                section="highlighted" 
                currentIdx={indices.highlighted} 
                total={highlightedResources.length} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-all">
                {highlightedResources.slice(indices.highlighted, indices.highlighted + ITEMS_PER_PAGE).map((item) => (
                  <div key={item.id} onClick={() => handleCardClick(item as Resource)} className="cursor-pointer">
                    {item.isPlaylist ? (
                      <PlaylistCard 
                        playlist={item as Playlist} 
                        onClick={() => onPlaylistClick(item.id.replace(/\D/g, ''))}
                        onEdit={handleEditPlaylist}
                        onDelete={handleDeletePlaylist}
                      />
                    ) : (
                      <ResourceCard 
                        resource={item as Resource} 
                        onAddToPlaylistClick={handleOpenPlaylistModal}
                        onRemoveClick={handleOpenRemoveModal}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader 
              title="Mais Recentes" 
              section="recent" 
              currentIdx={indices.recent} 
              total={recentResources.length} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-all">
              {recentResources.slice(indices.recent, indices.recent + ITEMS_PER_PAGE).map((resource) => (
                <div key={resource.id} onClick={() => handleCardClick(resource)} className="cursor-pointer">
                  <ResourceCard 
                    resource={resource} 
                    onAddToPlaylistClick={handleOpenPlaylistModal}
                    onRemoveClick={handleOpenRemoveModal}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader 
              title="Mais Curtidos" 
              section="mostSaved" 
              currentIdx={indices.mostSaved} 
              total={mostSavedResources.length} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-all">
              {mostSavedResources.slice(indices.mostSaved, indices.mostSaved + ITEMS_PER_PAGE).map((resource) => (
                <div key={resource.id} onClick={() => handleCardClick(resource)} className="cursor-pointer">
                  <ResourceCard 
                    resource={resource} 
                    onAddToPlaylistClick={handleOpenPlaylistModal}
                    onRemoveClick={handleOpenRemoveModal}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Modais */}
      <AddResourceModal 
        isOpen={isResourceModalOpen} 
        onClose={() => setIsResourceModalOpen(false)} 
        onSuccess={() => {
            setIsResourceModalOpen(false);
            setTimeout(() => fetchContent(), 1200);
        }}
      />

      <AddToPlaylistModal 
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        resourceTitle={selectedResource?.title || ''}
        resourceId={selectedResource ? Number(selectedResource.id.replace(/\D/g, '')) : undefined}
      />

      <RemoveResourceModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        resourceTitle={selectedResource?.title || ''}
        resourceAuthor={selectedResource?.author || ''}
        resourceId={selectedResource ? Number(selectedResource.id.replace(/\D/g, '')) : 0}
        onConfirmRemove={() => { fetchContent(); setIsRemoveModalOpen(false); }}
      />
    </div>
  );
}