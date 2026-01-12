import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { createRecurso } from "../services/api";

const API_URL = 'https://acervomestrebackend.onrender.com';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Tag {
  id: number;
  nome: string;
}

type TabType = "file-upload" | "external-link" | "simple-note";

export function AddResourceModal({ isOpen, onClose, onSuccess }: AddResourceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("file-upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Armazenando IDs como string para a API
  const [dbTags, setDbTags] = useState<Tag[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca as tags do banco de dados quando o modal abre
  useEffect(() => {
    if (isOpen) {
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
            setDbTags(Array.isArray(data) ? data : data.items || []);
          }
        } catch (error) {
          console.error("Erro ao carregar tags:", error);
        }
      };
      fetchTags();
    }
  }, [isOpen]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      let estrutura: 'UPLOAD' | 'URL' | 'NOTA';
      if (activeTab === 'file-upload') estrutura = 'UPLOAD';
      else if (activeTab === 'external-link') estrutura = 'URL';
      else estrutura = 'NOTA';

      if (!title.trim()) {
        setError('Título é obrigatório');
        setIsSubmitting(false);
        return;
      }

      if (estrutura === 'UPLOAD' && !selectedFile) {
        setError('Por favor, selecione um arquivo');
        setIsSubmitting(false);
        return;
      }

      if (estrutura === 'URL' && !url.trim()) {
        setError('URL é obrigatória');
        setIsSubmitting(false);
        return;
      }

      if (estrutura === 'NOTA' && !content.trim()) {
        setError('Conteúdo é obrigatório');
        setIsSubmitting(false);
        return;
      }

      await createRecurso({
        titulo: title,
        descricao: description,
        estrutura,
        visibilidade: isPublic ? 'PUBLICO' : 'PRIVADO',
        is_destaque: false,
        tag_ids: selectedTags,
        file: selectedFile || undefined,
        url_externa: estrutura === 'URL' ? url : undefined,
        conteudo_markdown: estrutura === 'NOTA' ? content : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setUrl('');
      setContent('');
      setSelectedTags([]);
      setIsPublic(true);
      setSelectedFile(null);
      setError(null);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar recurso');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl">Adicionar Recurso</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("file-upload")}
            className={`flex-1 px-6 py-3 text-sm transition-colors ${
              activeTab === "file-upload"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Upload de Arquivo
          </button>
          <button
            onClick={() => setActiveTab("external-link")}
            className={`flex-1 px-6 py-3 text-sm transition-colors ${
              activeTab === "external-link"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Link Externo
          </button>
          <button
            onClick={() => setActiveTab("simple-note")}
            className={`flex-1 px-6 py-3 text-sm transition-colors ${
              activeTab === "simple-note"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Nota Simples
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === "file-upload" && (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? "border-teal-600 bg-teal-50" : "border-gray-300 bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 mb-2">Arraste e solte seu arquivo aqui</p>
                <p className="text-sm text-gray-500 mb-4">ou clique para procurar</p>
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="file-input"
                  className="px-6 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors cursor-pointer inline-block"
                >
                  Procurar Arquivos
                </label>
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>
          )}

          {activeTab === "external-link" && (
            <div>
              <label className="block text-sm mb-2">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com/recurso"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          {activeTab === "simple-note" && (
            <div>
              <label className="block text-sm mb-2">Conteúdo (Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Titulo&#10;&#10;Escreva o conteúdo da nota usando Markdown..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm min-h-[120px]"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do recurso"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Descrição <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma breve descrição do recurso..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
            />
          </div>

          {/* Tags vindas do DB */}
          <div>
            <label className="block text-sm mb-3">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2 max-h-40 overflow-y-auto p-1">
              {dbTags.length > 0 ? (
                dbTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id.toString())}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      selectedTags.includes(tag.id.toString())
                        ? "bg-teal-50 border-teal-600 text-teal-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {tag.nome}
                  </button>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">Carregando tags...</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded">
            <div>
              <div className="text-sm">Privacidade</div>
              <div className="text-sm text-gray-500">Público - Visível para Alunos</div>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Recurso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}