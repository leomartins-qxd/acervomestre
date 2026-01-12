import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, Heart, Plus, Eye, FileText, 
  Video, Link as LinkIcon, StickyNote, File, ExternalLink 
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
  autor_id?: number;
  conteudo_markdown?: string;
  url_externa?: string;
  link_acesso?: string;
}

interface ResourceDetailProps {
  resourceId: string;
  onBack: () => void;
  onAddToPlaylistClick?: (resourceId: number, title: string) => void; // Prop para abrir o modal no pai
}

export function ResourceDetail({ resourceId, onBack, onAddToPlaylistClick }: ResourceDetailProps) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para Like
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  useEffect(() => {
    if (resourceId) {
      fetchResourceData();
    }
  }, [resourceId]);

  const fetchResourceData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const numericId = resourceId.replace(/\D/g, '');
      if (!numericId) throw new Error("ID inválido");

      const response = await fetch(`${API_URL}/recursos/get/${numericId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setResource(data);
        setLocalLikes(data.curtidas);
      }
    } catch (error) {
      console.error("Erro ao buscar recurso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking || hasLiked || !resource) return;

    setIsLiking(true);
    setHasLiked(true);
    setLocalLikes(prev => prev + 1);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/recursos/${resource.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        setHasLiked(false);
        setLocalLikes(prev => prev - 1);
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
      setHasLiked(false);
      setLocalLikes(prev => prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const getResourceIcon = (res: Resource) => {
    if (res.estrutura === 'NOTA') return StickyNote;
    if (res.estrutura === 'URL') return LinkIcon;
    if (res.mime_type?.includes('pdf')) return FileText;
    if (res.mime_type?.includes('video')) return Video;
    return File;
  };

  const getResourceLabel = (res: Resource) => {
    if (res.estrutura === 'NOTA') return 'Anotação';
    if (res.estrutura === 'URL') return 'Link Externo';
    if (res.mime_type?.includes('pdf')) return 'Documento PDF';
    if (res.mime_type?.includes('video')) return 'Vídeo';
    return 'Arquivo';
  };

  const handleMainAction = () => {
    if (!resource?.link_acesso) return;
    window.open(resource.link_acesso, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-8 w-full min-h-screen">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-6">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <div className="text-center text-gray-500">Recurso não encontrado.</div>
      </div>
    );
  }

  const IconComponent = getResourceIcon(resource);
  const typeLabel = getResourceLabel(resource);

  return (
    <div className="p-8 w-full min-h-screen">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {resource.titulo}
        </h1>
        <p className="text-gray-600">
          Por <span className="text-teal-600 font-medium">{resource.autor_nome || `Autor #${resource.autor_id || '?'}`}</span>
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{typeLabel}</p>
              <h3 className="font-medium text-gray-900 mb-1">
                {resource.titulo}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">
                {resource.estrutura === 'UPLOAD' ? 'Clique para baixar o arquivo.' : 
                 resource.estrutura === 'URL' ? 'Link externo para conteúdo.' : 
                 'Conteúdo em texto/markdown.'}
              </p>
            </div>
          </div>
          
          {resource.estrutura !== 'NOTA' && (
            <button 
              onClick={handleMainAction}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {resource.estrutura === 'URL' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {resource.estrutura === 'URL' ? 'Acessar' : 'Download'}
            </button>
          )}
        </div>

        {resource.estrutura === 'NOTA' && resource.conteudo_markdown && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap font-sans">
            {resource.conteudo_markdown}
          </div>
        )}
      </div>

      {/* Actions and Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              disabled={hasLiked || isLiking}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium
                ${hasLiked 
                  ? 'bg-red-50 border-red-200 text-red-600' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-red-600' : ''}`} />
              {hasLiked ? 'Curtido' : 'Curtir'}
            </button>
            <button 
              onClick={() => onAddToPlaylistClick?.(resource.id, resource.titulo)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar à Playlist
            </button>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{resource.visualizacoes}</span>
              </div>
              <span className="text-gray-500">visitas</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-gray-600">
                <Heart className={`w-4 h-4 ${hasLiked ? 'text-red-600 fill-red-600' : ''}`} />
                <span className="font-medium">{localLikes}</span>
              </div>
              <span className="text-gray-500">curtidas</span>
            </div>
            {resource.estrutura === 'UPLOAD' && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-gray-600">
                  <Download className="w-4 h-4" />
                  <span className="font-medium">{resource.downloads}</span>
                </div>
                <span className="text-gray-500">downloads</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {resource.tags.map((tag) => (
              <span key={tag.id} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
                {tag.nome}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição Completa</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {resource.descricao || "Sem descrição disponível."}
        </p>
      </div>
    </div>
  );
}