import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { UserPlus, X, CheckCircle, Calendar, Lock, Mail, User, Loader2 } from 'lucide-react';
import { createUser } from '../services/api';
import './Modal.css';

interface CadastrarUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UserFormData {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  perfil: string;
}

const CadastrarUserModal: React.FC<CadastrarUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    senha: '',
    dataNascimento: '',
    perfil: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.email.trim() || !formData.perfil || !formData.dataNascimento) {
      alert("Erro: Nome, E-mail, Perfil e Data de Nascimento são obrigatórios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Erro: O formato do e-mail inserido é inválido.");
      return;
    }

    setIsLoading(true);

    try {
      const dadosParaEnvio = {
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
        data_nascimento: formData.dataNascimento,
        ...(formData.senha.trim() && { senha: formData.senha }) 
      };

      await createUser(dadosParaEnvio);

      alert("Usuário cadastrado com sucesso!");
      
      setFormData({
        nome: '',
        email: '',
        senha: '',
        dataNascimento: '',
        perfil: ''
      });

      if (onSuccess) onSuccess();
      onClose();

    } catch (error: any) {
      console.error(error);
      alert(`Erro no cadastro: ${error.message || 'Falha na requisição'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={24} color="#0c5a6d" />
            <h2>Cadastrar Usuário</h2>
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
              <User size={16} /> Nome Completo *
            </label>
            <input 
              type="text" 
              name="nome" 
              placeholder="Digite seu nome" 
              value={formData.nome}
              onChange={handleChange} 
              required
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> E-mail *
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder="exemplo@email.com" 
              value={formData.email}
              onChange={handleChange} 
              required
            />
          </div>

          <div className="input-group">
            <label>Perfil *</label>
            <select name="perfil" value={formData.perfil} onChange={handleChange} required>
              <option value="">Selecione um perfil</option>
              <option value="Gestor">Gestor</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Professor">Professor</option>
              <option value="Aluno">Aluno</option>
            </select>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} /> Senha (Opcional)
              </label>
              <input 
                type="password" 
                name="senha" 
                placeholder="********" 
                value={formData.senha}
                onChange={handleChange} 
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> Nascimento *
              </label>
              <input 
                type="date" 
                name="dataNascimento" 
                value={formData.dataNascimento}
                onChange={handleChange} 
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save" 
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={18} />}
              Cadastrar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarUserModal;