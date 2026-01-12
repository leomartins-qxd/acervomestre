import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

import { API_BASE_URL as API_URL } from '../services/api';

interface Tag {
  id: number;
  nome: string;
}

export function MetadataManagement() {
  // Alterado para armazenar objetos Tag para termos acesso ao ID
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await fetch(`${API_URL}/tags/get_all`, { headers });
      if (response.ok) {
        const data = await response.json();
        // Ajuste para lidar com respostas paginadas ou listas simples
        const tagsList = Array.isArray(data) ? data : data.items;
        if (tagsList) {
          setTags(tagsList);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async () => {
    const term = newTagName.trim();
    // Evita duplicados no estado local antes de enviar
    if (term && !tags.some(t => t.nome.toLowerCase() === term.toLowerCase())) {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch(`${API_URL}/tags/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ nome: term })
        });

        if (response.ok) {
          const createdTag = await response.json();
          setTags([...tags, createdTag]);
          setNewTagName('');
        } else {
          console.error('Erro ao criar tag');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta tag?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/tags/delete/${tagId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        // Remove do estado local apenas após confirmação do banco
        setTags(tags.filter((t) => t.id !== tagId));
      } else {
        const errorData = await response.json();
        alert(`Erro ao deletar: ${errorData.detail || 'A tag pode estar em uso.'}`);
      }
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Tags</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova tag..."
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleAddTag}
            className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <span className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full"></span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <span className="text-gray-500 text-sm italic">Nenhuma tag cadastrada.</span>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm text-gray-700">{tag.nome}</span>
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-300 rounded-full"
                    title="Excluir tag do banco"
                  >
                    <X className="w-3.5 h-3.5 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}