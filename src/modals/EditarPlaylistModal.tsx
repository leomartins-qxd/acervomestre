import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { ListMusic, Type, AlignLeft, X, Save } from 'lucide-react';
import './Modal.css';

interface EditarPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | number | null;
}

interface PlaylistFormData {
  titulo: string;
  descricao: string;
}

const EditarPlaylistModal: React.FC<EditarPlaylistModalProps> = ({ isOpen, onClose, playlistId }) => {
  const [formData, setFormData] = useState<PlaylistFormData>({
    titulo: '',
    descricao: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGet, setLoadingGet] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && playlistId) {
      const carregarPlaylist = async () => {
        setLoadingGet(true);
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`https://acervomestrebackend.onrender.com/playlists/get/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setFormData({
              titulo: data.titulo || '',
              descricao: data.descricao || ''
            });
          }
        } catch (error) {
          console.error("Erro ao carregar playlist:", error);
        } finally {
          setLoadingGet(false);
        }
      };
      carregarPlaylist();
    }
  }, [isOpen, playlistId]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      alert("Erro: O Título da playlist é obrigatório.");
      return;
    }

    const token = localStorage.getItem('accessToken');
    const dadosParaAtualizar = {
      titulo: formData.titulo,
      descricao: formData.descricao 
    };

    try {
      setLoading(true);
      const response = await fetch(`https://acervomestrebackend.onrender.com/playlists/update/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosParaAtualizar)
      });

      if (response.ok) {
        alert("Playlist atualizada com sucesso!");
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.detail || 'Falha ao atualizar playlist'}`);
      }
    } catch (error) {
      console.error("Erro na requisição PUT:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {loadingGet ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ListMusic size={24} color="#0c5a6d" />
                <h2>Editar Playlist</h2>
              </div>
              <button 
                className="close-modal-btn" 
                onClick={onClose} 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#6c757d" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Type size={16} /> Título
                </label>
                <input 
                  type="text" 
                  name="titulo" 
                  placeholder="Nome da sua playlist"
                  value={formData.titulo} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlignLeft size={16} /> Descrição (Opcional)
                </label>
                <textarea 
                  name="descricao" 
                  placeholder="Sobre o que é esta playlist?"
                  value={formData.descricao} 
                  onChange={handleChange}
                  rows={5} 
                  style={{ 
                    resize: 'none', 
                    padding: '10px', 
                    borderRadius: '6px', 
                    border: '0.8px solid #DEE2E6',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-save" 
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                  <Save size={18} />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditarPlaylistModal;