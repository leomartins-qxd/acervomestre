import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import './Modal.css';

interface ExcluirPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | number | null;
}

interface PlaylistData {
  titulo: string;
  descricao: string;
}

const ExcluirPlaylistModal: React.FC<ExcluirPlaylistModalProps> = ({ isOpen, onClose, playlistId }) => {
  const [playlistData, setPlaylistData] = useState<PlaylistData>({ titulo: '', descricao: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGet, setLoadingGet] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      setPlaylistData({ titulo: '', descricao: '' });
      return;
    }

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
            setPlaylistData({
              titulo: data.titulo || '',
              descricao: data.descricao || ''
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        } finally {
          setLoadingGet(false);
        }
      };
      carregarPlaylist();
    }
  }, [isOpen, playlistId]);

  const handleExcluir = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      setLoading(true);
      const response = await fetch(`https://acervomestrebackend.onrender.com/playlists/delete/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Playlist removida com sucesso!");
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.detail || 'Falha ao excluir playlist'}`);
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
                <Trash2 size={24} color="#DC3545" />
                <h2 style={{ color: '#212529', margin: 0 }}>Excluir Playlist</h2>
              </div>
              <button 
                onClick={onClose} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={24} color="#6C757D" />
              </button>
            </header>

            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', padding: '0 24px' }}>
              <p style={{ fontWeight: '700', fontSize: '15px', color: '#495057', margin: 0 }}>
                Tem certeza que deseja excluir essa playlist?
              </p>

              <div style={{ 
                background: '#F8F9FA', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #E9ECEF',
              }}>
                <p style={{ 
                  margin: '0 0 4px 0', 
                  fontWeight: '700', 
                  fontSize: '16px', 
                  color: '#212529' 
                }}>
                  {playlistData.titulo}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: '#6C757D',
                  lineHeight: '1.4'
                }}>
                  {playlistData.descricao || "Sem descrição informada."}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <AlertTriangle size={16} color="#868E96" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#868E96', fontStyle: 'italic', margin: 0 }}>
                  Esta ação não excluirá os recursos contidos na playlist, apenas a playlist que organiza eles.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-save btn-delete" 
                onClick={handleExcluir} 
                disabled={loading}
                style={{ 
                  backgroundColor: '#DC3545', 
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={18} />
                {loading ? 'Excluindo...' : 'Excluir Playlist'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExcluirPlaylistModal;