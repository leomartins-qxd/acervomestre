import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import './Modal.css';

interface RemoverRecursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | number | null;
  recursoId: string | number | null;
}

interface DadosExibicao {
  titulo: string;
  autor: string;
}

const RemoverRecursoModal: React.FC<RemoverRecursoModalProps> = ({ 
  isOpen, 
  onClose, 
  playlistId, 
  recursoId 
}) => {
  const [dadosExibicao, setDadosExibicao] = useState<DadosExibicao>({ titulo: '', autor: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGet, setLoadingGet] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      setDadosExibicao({ titulo: '', autor: '' });
      return;
    }

    const carregarDadosRemocao = async () => {
      if (!recursoId) return;
      
      setLoadingGet(true);
      const token = localStorage.getItem('accessToken');
      try {
        const resRecurso = await fetch(`https://acervomestrebackend.onrender.com/recursos/get/${recursoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resRecurso.ok) {
          const recurso = await resRecurso.json();
          
          const resAutor = await fetch(`https://acervomestrebackend.onrender.com/users/get/${recurso.autor_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          const nomeAutor = resAutor.ok ? (await resAutor.json()).nome : "Autor desconhecido";

          setDadosExibicao({
            titulo: recurso.titulo || 'Recurso sem título',
            autor: nomeAutor
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados para remoção:", error);
      } finally {
        setLoadingGet(false);
      }
    };

    carregarDadosRemocao();
  }, [isOpen, recursoId]);

  const handleRemover = async () => {
    if (!playlistId || !recursoId) return;

    const token = localStorage.getItem('accessToken');
    try {
      setLoading(true);
      const response = await fetch(`https://acervomestrebackend.onrender.com/playlists/delete_recurso/${playlistId}/${recursoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Recurso removido da playlist com sucesso!");
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.detail || 'Falha ao remover recurso'}`);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
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
                <h2 style={{ color: '#212529', margin: 0 }}>Remover Recurso</h2>
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
                Tem certeza que deseja remover este recurso da playlist?
              </p>

              <div style={{ 
                background: '#F8F9FA', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #E9ECEF'
              }}>
                <p style={{ 
                  margin: '0 0 4px 0', 
                  fontWeight: '700', 
                  fontSize: '16px', 
                  color: '#212529' 
                }}>
                  {dadosExibicao.titulo}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6C757D' }}>
                  Autor: {dadosExibicao.autor}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <AlertTriangle size={16} color="#868E96" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13px', color: '#868E96', fontStyle: 'italic', margin: 0 }}>
                  Esta ação não excluirá o recurso permanentemente, apenas o removerá desta playlist.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-save" 
                onClick={handleRemover} 
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
                {loading ? 'Removendo...' : 'Remover da Playlist'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RemoverRecursoModal;