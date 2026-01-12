import { useState, useEffect } from 'react';
import { Edit, Plus, X } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { PlaylistCard } from './PlaylistCard';
import { ResourceModal } from '../modals/ResourceModal';
import { AddResourceModal } from '../modals/AddResourceModal';
import { RemoveResourceModal } from './RemoveResourceModal';
import { AddToPlaylistModal } from '../modals/AddToPlaylistModal';
import { EditProfileModal } from '../modals/EditProfileModal';
import type { Resource, Playlist } from './types';

const profileImage = "https://ui-avatars.com/api/?name=Carlos+Santos&background=0f766e&color=fff";
const API_URL = 'https://acervomestrebackend.onrender.com';

// --- COMPONENTE INTERNO PARA EVITAR ERRO DE IMPORTAÇÃO ---
function CreatePlaylistModal({ isOpen, onClose, onSuccess }: any) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/playlists/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descricao })
      });
      if (response.ok) {
        setTitulo('');
        setDescricao('');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Criar Nova Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text" required value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Ex: Materiais de Redação"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              rows={3} placeholder="Dê uma breve descrição..."
            />
          </div>
          <button
            type="submit" disabled={isLoading}
            className="w-full bg-teal-700 text-white py-2 rounded-lg font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Criar Playlist'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE PROFILE ---
interface User {
  id: number;
  nome?: string;
  name?: string;
  email: string;
  perfil: string;
  role?: string;
  url_perfil?: string;
  data_nascimento?: string;
}

interface ProfileProps {
  onPlaylistClick: (playlistId: string) => void;
  onResourceClick: (resourceId: string) => void;
  onUserUpdate?: () => void;
  user: User | null;
}

export function Profile({ onPlaylistClick, onResourceClick, onUserUpdate, user }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'resources' | 'playlists'>('resources');
  
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false); 
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const getUserName = () => user?.nome || user?.name || 'Usuário';
  const getUserProfile = () => user?.perfil || user?.role || 'Visitante';
  const getUserEmail = () => user?.email || 'email@exemplo.com';

  useEffect(() => {
    fetchUserContent();
  }, [user]);

  const fetchUserContent = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) throw new Error("Sem usuário");

      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const [resResponse, plResponse] = await Promise.all([
        fetch(`${API_URL}/recursos/get_all?page=1&per_page=100`, { headers }),
        fetch(`${API_URL}/playlists/get_all?page=1&per_page=100&autor_id=${user.id}`, { headers })
      ]);

      if (resResponse.ok) {
        const resData = await resResponse.json();
        const userResourcesList = (resData.items || [])
          .filter((item: any) => item.autor_id === user.id)
          .map((item: any) => {
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
              title: item.titulo,
              author: getUserName(),
              subject: item.tags?.[0]?.nome || 'Geral',
              year: '',
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
          setMyResources(userResourcesList);
      }

      if (plResponse.ok) {
        const plData = await plResponse.json();
        const userPlaylistsList = (plData.items || []).map((item: any) => ({
          id: `pl-${item.id}`,
          title: item.titulo,
          resources: item.quantidade_recursos,
          visibility: item.visibilidade || 'Público',
          isPlaylist: true
        }));
        setMyPlaylists(userPlaylistsList);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para os botões do Card de Playlist
  const handleEditPlaylist = (playlist: Playlist) => {
    console.log("Editar playlist:", playlist.id);
    // Aqui você abriria o modal de edição de playlist futuramente
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (!window.confirm(`Tem certeza que deseja excluir a playlist "${playlist.title}"?`)) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const numericId = playlist.id.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/playlists/delete/${numericId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUserContent();
      } else {
        alert("Erro ao excluir playlist.");
      }
    } catch (error) {
      console.error("Erro ao deletar playlist:", error);
    }
  };

  const handleRemoveClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsRemoveModalOpen(true);
  };

  const handleAddToPlaylistClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsAddToPlaylistModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (user?.id) fetchUserContent();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    console.log('Adicionando recurso à playlist:', selectedResource, playlistId);
  };

  const handleEditProfileSuccess = () => {
    if (onUserUpdate) {
      onUserUpdate();
    }
  };

  const getNumericId = (id: string | undefined) => {
    if (!id) return undefined;
    const numericPart = id.replace(/\D/g, '');
    return numericPart ? parseInt(numericPart) : undefined;
  };

  const handleResourceCardClick = (id: string) => {
    const numericId = id.replace(/\D/g, '');
    onResourceClick(numericId);
  };

  return (
    <div className="p-8 w-full min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user?.url_perfil || profileImage}
              alt={getUserName()}
              className="w-24 h-24 rounded-full object-cover border border-gray-100"
            />
            <div className="text-left">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{getUserName()}</h1>
              <p className="text-gray-600 mb-1">{getUserEmail()}</p>
              <p className="text-sm text-gray-500">{getUserProfile()}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditProfileModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar Perfil
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-5 py-2.5 rounded-lg transition-colors font-medium ${
            activeTab === 'resources'
              ? 'bg-teal-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Meus Recursos
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-5 py-2.5 rounded-lg transition-colors font-medium ${
            activeTab === 'playlists'
              ? 'bg-teal-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Minhas Playlists
        </button>
      </div>

      <div className="flex justify-end mb-6">
        {activeTab === 'resources' ? (
          <button 
            onClick={() => setIsResourceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Recurso
          </button>
        ) : (
          <button 
            onClick={() => setIsCreatePlaylistModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Playlist
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {activeTab === 'resources' ? (
            myResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myResources.map((resource) => (
                  <div key={resource.id} onClick={() => handleResourceCardClick(resource.id)} className="cursor-pointer">
                    <ResourceCard 
                      resource={resource} 
                      onRemoveClick={handleRemoveClick}
                      onAddToPlaylistClick={handleAddToPlaylistClick}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                Você ainda não criou nenhum recurso.
              </div>
            )
          ) : (
            myPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPlaylists.map((playlist) => (
                  <PlaylistCard 
                    key={playlist.id} 
                    playlist={playlist} 
                    onClick={() => onPlaylistClick(playlist.id.replace(/\D/g, ''))} 
                    onEdit={handleEditPlaylist}
                    onDelete={handleDeletePlaylist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                Você ainda não criou nenhuma playlist.
              </div>
            )
          )}
        </>
      )}

      {/* MODAIS */}
      <ResourceModal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} />
      <AddResourceModal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} />
      
      <CreatePlaylistModal 
        isOpen={isCreatePlaylistModalOpen} 
        onClose={() => setIsCreatePlaylistModalOpen(false)} 
        onSuccess={fetchUserContent} 
      />

      <RemoveResourceModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        resourceTitle={selectedResource?.title || ''}
        resourceAuthor={selectedResource?.author || ''}
        resourceId={getNumericId(selectedResource?.id)}
        onConfirmRemove={handleConfirmRemove}
      />
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        resourceTitle={selectedResource?.title || ''}
        resourceId={getNumericId(selectedResource?.id)}
        onAddToPlaylist={handleAddToPlaylist}
      />
      
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={user}
        onSuccess={handleEditProfileSuccess}
      />
    </div>
  );
}