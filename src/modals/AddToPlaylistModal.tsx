import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { addRecursoToPlaylist, getAllPlaylists } from "../services/api";

interface Playlist {
  id: string;
  titulo: string;
  quantidade_recursos: number;
}

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  resourceId?: number;
  onAddToPlaylist?: (playlistId: string) => void;
  onCreateNewPlaylist?: () => void;
}

export function AddToPlaylistModal({ 
  isOpen, 
  onClose, 
  resourceTitle,
  resourceId,
  onAddToPlaylist,
  onCreateNewPlaylist
}: AddToPlaylistModalProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch playlists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPlaylists();
      setPlaylists(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !resourceId) {
      setError('Por favor, selecione uma playlist');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addRecursoToPlaylist(selectedPlaylist, resourceId);
      
      if (onAddToPlaylist) {
        onAddToPlaylist(selectedPlaylist);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar à playlist');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateNew = () => {
    if (onCreateNewPlaylist) {
      onCreateNewPlaylist();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl">Adicionar à Playlist</h2>
            <p className="text-sm text-gray-600 mt-1">{resourceTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm mb-4">Selecione uma playlist</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Carregando playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma playlist encontrada
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    selectedPlaylist === playlist.id
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{playlist.titulo}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {playlist.quantidade_recursos} recursos
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleAddToPlaylist}
            disabled={!selectedPlaylist || isAdding || isLoading}
            className={`w-full py-3 rounded-lg transition-colors mb-3 ${
              selectedPlaylist && !isAdding && !isLoading
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isAdding ? 'Adicionando...' : 'Adicionar à Playlist Selecionada'}
          </button>

          <button
            onClick={handleCreateNew}
            disabled={isAdding || isLoading}
            className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Playlist
          </button>
        </div>
      </div>
    </div>
  );
}