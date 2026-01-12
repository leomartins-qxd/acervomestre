import { Folder, Edit, Trash2 } from 'lucide-react';
import type { Playlist } from './types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
  onEdit?: (playlist: Playlist) => void;   // Adicionado
  onDelete?: (playlist: Playlist) => void; // Adicionado
}

export function PlaylistCard({ playlist, onClick, onEdit, onDelete }: PlaylistCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="bg-teal-100 h-32 flex items-center justify-center">
        <Folder className="w-12 h-12 text-teal-700" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2">{playlist.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>{playlist.resources} recursos</span>
          <span className="capitalize">{playlist.visibility || 'Público'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClick}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Visualizar
          </button>
          <button 
            onClick={(e) => {
                e.stopPropagation(); // Impede de disparar o clique do card pai
                onEdit?.(playlist);
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
                e.stopPropagation(); // Impede de disparar o clique do card pai
                onDelete?.(playlist);
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}