import { useState } from 'react';
import { Eye, Download, Heart, MessageSquare, Bookmark, Trash2, FileText, Link, Folder, Pin } from 'lucide-react';
import type { Resource } from './types';

const API_URL = 'https://acervomestrebackend.onrender.com';

interface ResourceCardProps {
  resource: Resource;
  onRemoveClick?: (resource: Resource) => void;
  onAddToPlaylistClick?: (resource: Resource) => void;
}

export function ResourceCard({ resource, onRemoveClick, onAddToPlaylistClick }: ResourceCardProps) {
  // Estados para curtida
  const [likesCount, setLikesCount] = useState(resource.likes || 0);
  const [hasLiked, setHasLiked] = useState(false); // Controla se o coração fica vermelho
  const [isLiking, setIsLiking] = useState(false); // Evita cliques múltiplos simultâneos

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Bloqueia se já estiver processando ou se já tiver curtido nesta sessão
    if (isLiking || hasLiked) return;

    setIsLiking(true);
    setHasLiked(true); // Deixa o coração vermelho imediatamente
    setLikesCount(prev => prev + 1); // Aumenta o contador visual

    try {
      const token = localStorage.getItem('accessToken');
      const id = resource.id.replace(/\D/g, '');
      
      const response = await fetch(`${API_URL}/recursos/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        // Reverte estados em caso de erro
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const getIcon = () => {
    switch (resource.icon) {
      case 'download': return <Download className="w-16 h-16" />;
      case 'document': return <FileText className="w-16 h-16" />;
      case 'link': return <Link className="w-16 h-16" />;
      case 'folder': return <Folder className="w-16 h-16" />;
      default: return <FileText className="w-16 h-16" />;
    }
  };

  if (resource.isPlaylist) {
    return (
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className={`${resource.bgColor} h-32 flex items-center justify-center relative ${resource.iconColor}`}>
          {getIcon()}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{resource.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span>{resource.resources} recursos</span>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Visualizar
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAddToPlaylistClick?.(resource); }} className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Bookmark className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRemoveClick?.(resource); }} className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative">
        <div className={`${resource.bgColor} h-32 flex items-center justify-center ${resource.iconColor}`}>
          {getIcon()}
        </div>
        {resource.is_destaque && (
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm rounded p-1.5 shadow-sm border border-orange-100">
              <Pin className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">{resource.title}</h3>
        {resource.author && <p className="text-sm text-gray-500 mb-3">{resource.author}</p>}

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {resource.subject && <span className="px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-700">{resource.subject}</span>}
          {resource.year && <span className="px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-700">{resource.year}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title="Visualizações">
              <Eye className="w-4 h-4" />
              <span>{resource.views}</span>
            </div>
            <div className="flex items-center gap-1" title="Downloads">
              <Download className="w-4 h-4" />
              <span>{resource.downloads}</span>
            </div>
            
            {/* Botão de Curtida Melhorado */}
            <button 
              onClick={handleLike}
              disabled={hasLiked || isLiking}
              className={`flex items-center gap-1 transition-all outline-none
                ${hasLiked ? 'text-red-500 cursor-default' : 'hover:text-red-500 group'}
                ${isLiking ? 'opacity-70' : ''}
              `} 
              title={hasLiked ? "Você curtiu" : "Curtir"}
            >
              <Heart 
                className={`w-4 h-4 transition-transform active:scale-125 
                  ${hasLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-500'}
                `} 
              />
              <span className="font-medium">{likesCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="hover:bg-gray-100 rounded p-1 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAddToPlaylistClick?.(resource); }} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Bookmark className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRemoveClick?.(resource); }} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}