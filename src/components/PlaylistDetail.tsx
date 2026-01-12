import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Play, 
  GripVertical, 
  Eye, 
  Heart, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  StickyNote, 
  File, 
  ArrowUpDown 
} from 'lucide-react';

const API_URL = 'https://acervomestrebackend.onrender.com';

interface Resource {
  id: number;
  titulo: string;
  descricao: string;
  estrutura: 'UPLOAD' | 'URL' | 'NOTA';
  mime_type?: string;
  tags?: { id: number; nome: string }[];
  visualizacoes: number;
  curtidas: number;
  downloads: number;
  autor_nome?: string;
}

interface PlaylistResourceItem {
  ordem: number;
  recurso: Resource;
}

interface PlaylistResponse {
  id: number;
  titulo: string;
  descricao: string;
  autor_id: number;
  recursos: PlaylistResourceItem[];
  visibilidade?: string;
  autor_nome?: string;
}

interface PlaylistDetailProps {
  playlistId: string;
  onBack: () => void;
  onResourceClick: (resourceId: string) => void;
}

export function PlaylistDetail({ playlistId, onBack, onResourceClick }: PlaylistDetailProps) {
  const [playlist, setPlaylist] = useState<PlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPlaylistData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const numericId = playlistId.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/playlists/get/${numericId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        // Ordena os recursos localmente com base no campo 'ordem' retornado pela API
        if (data.recursos) {
          data.recursos.sort((a: PlaylistResourceItem, b: PlaylistResourceItem) => a.ordem - b.ordem);
        }
        setPlaylist(data);
      } else if (response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
      }
    } catch (error) {
      console.error("Erro ao buscar playlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData();
    }
  }, [playlistId, fetchPlaylistData]);

  const handleSaveOrder = async () => {
    if (!playlist) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const numericId = playlistId.replace(/\D/g, '');
      
      // AJUSTE: Formato exigido pela documentação: { "recurso_ids_ordem": [...] }
      const requestBody = {
        recurso_ids_ordem: playlist.recursos.map(item => item.recurso.id)
      };

      const response = await fetch(`${API_URL}/playlists/update/${numericId}/reordenar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody) // Enviando o objeto com a chave correta
      });

      if (response.ok) {
        alert("Nova ordem salva com sucesso!");
        fetchPlaylistData(); // Recarrega para confirmar a nova ordem do servidor
      } else {
        const err = await response.json();
        alert(err.detail || "Erro ao salvar ordem");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('draggedIndex', index.toString());
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('draggedIndex'));
    if (dragIndex === dropIndex || !playlist) return;

    const newRecursos = [...playlist.recursos];
    const [removed] = newRecursos.splice(dragIndex, 1);
    newRecursos.splice(dropIndex, 0, removed);

    setPlaylist({ ...playlist, recursos: newRecursos });
  };

  const getResourceStyle = (resource: Resource) => {
    if (resource.estrutura === 'NOTA') return { icon: StickyNote, bg: 'bg-red-50', text: 'text-red-400', label: 'Nota' };
    if (resource.estrutura === 'URL') return { icon: LinkIcon, bg: 'bg-gray-50', text: 'text-gray-400', label: 'Link' };
    if (resource.mime_type?.includes('pdf')) return { icon: FileText, bg: 'bg-green-50', text: 'text-green-400', label: 'PDF' };
    if (resource.mime_type?.includes('video')) return { icon: Video, bg: 'bg-purple-50', text: 'text-purple-400', label: 'Vídeo' };
    return { icon: File, bg: 'bg-blue-50', text: 'text-blue-400', label: 'Arquivo' };
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!playlist) return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft /> Voltar</button>
      <div className="text-center text-gray-500">Playlist não encontrada.</div>
    </div>
  );

  return (
    <div className="p-8 w-full min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-5 h-5" /> Voltar para Perfil
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{playlist.titulo}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full uppercase text-xs font-bold border border-teal-100">
                {playlist.visibilidade || 'Público'}
              </span>
              <span>• {playlist.recursos.length} recursos selecionados</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{playlist.descricao || 'Nenhuma descrição fornecida.'}</p>
          </div>
          <button 
            onClick={handleSaveOrder}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md disabled:opacity-50 font-medium"
          >
            <ArrowUpDown className="w-4 h-4" /> {isUpdating ? 'Salvando...' : 'Salvar Ordem'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {playlist.recursos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-gray-400 font-medium">Esta playlist está vazia.</div>
          </div>
        ) : (
          playlist.recursos.map((item, index) => {
            const resource = item.recurso; 
            const style = getResourceStyle(resource);
            const IconComponent = style.icon;
            
            return (
              <div
                key={resource.id}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, index)}
                className="bg-white rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-5 p-5">
                  <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-50 rounded-lg">
                    <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-teal-500" />
                  </div>

                  <div 
                    className="flex flex-1 items-center gap-5 cursor-pointer"
                    onClick={() => onResourceClick(String(resource.id))}
                  >
                    <div className={`w-16 h-16 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                      <IconComponent className={`w-8 h-8 ${style.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                        {resource.titulo}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
                          {style.label}
                        </span>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5" title="Visualizações">
                            <Eye className="w-4 h-4"/> {resource.visualizacoes || 0}
                          </span>
                          <span className="flex items-center gap-1.5" title="Curtidas">
                            <Heart className="w-4 h-4"/> {resource.curtidas || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}