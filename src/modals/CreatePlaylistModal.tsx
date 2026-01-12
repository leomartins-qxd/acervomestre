import { useState } from 'react';
import { X } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = 'https://acervomestrebackend.onrender.com';

export function CreatePlaylistModal({ isOpen, onClose, onSuccess }: CreatePlaylistModalProps) {
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
        body: JSON.stringify({ titulo, descricao }) // Conforme documentação
      });

      if (response.ok) {
        setTitulo('');
        setDescricao('');
        onSuccess();
        onClose();
      } else {
        alert('Erro ao criar playlist');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Criar Nova Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Ex: Materiais de Redação"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              rows={3}
              placeholder="Dê uma breve descrição para sua coleção"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-700 text-white py-2 rounded-lg font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Criando...' : 'Criar Playlist'}
          </button>
        </form>
      </div>
    </div>
  );
}