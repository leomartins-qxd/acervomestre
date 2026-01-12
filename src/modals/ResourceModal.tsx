import { useState } from "react";
import { X, Upload } from "lucide-react";

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "file-upload" | "external-link" | "simple-note";

export function ResourceModal({ isOpen, onClose }: ResourceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("file-upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const subjectTags = ["Matemática", "Português", "Física", "Química", "História", "Literatura"];
  const typeTags = ["PDF", "Vídeo", "1º Ano", "2º Ano", "3º Ano"];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
    // Handle file drop logic here
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log({ activeTab, title, description, url, content, selectedTags, isPublic });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl">Add/Editar Recurso</h2>
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
          {/* File Upload Tab */}
          {activeTab === "file-upload" && (
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
              <button className="px-6 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                Procurar Arquivos
              </button>
            </div>
          )}

          {/* External Link Tab */}
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

          {/* Simple Note Tab */}
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

          {/* Common Fields */}
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

          {/* Tags */}
          <div>
            <label className="block text-sm mb-3">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {subjectTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-teal-50 border-teal-600 text-teal-700"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {typeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-teal-50 border-teal-600 text-teal-700"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Toggle */}
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
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors"
          >
            Salvar Recurso
          </button>
        </div>
      </div>
    </div>
  );
}