import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Shield, Calendar, X, Save, Loader2 } from 'lucide-react';
import { getUser, updateUser } from '../services/api';

interface EditarUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  onSuccess?: () => void;
}

interface UserFormData {
  nome: string;
  email: string;
  perfil: string;
  dataNascimento: string;
}

const EditarUserModal: React.FC<EditarUserModalProps> = ({ isOpen, onClose, userId, onSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    perfil: '',
    dataNascimento: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGet, setLoadingGet] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !userId) {
      setFormData({ nome: '', email: '', perfil: '', dataNascimento: '' });
      return;
    }

    const carregarUsuario = async () => {
      setLoadingGet(true);
      try {
        const data = await getUser(userId);
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          perfil: data.perfil || '',
          dataNascimento: data.data_nascimento || ''
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        alert("Não foi possível carregar os dados do usuário.");
        onClose();
      } finally {
        setLoadingGet(false);
      }
    };

    carregarUsuario();
  }, [isOpen, userId, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.email.trim() || !formData.perfil) {
      alert("Erro: Nome, E-mail e Perfil são obrigatórios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Erro: O formato do e-mail inserido é inválido.");
      return;
    }

    if (!userId) return;

    try {
      setLoading(true);
      
      const dadosParaEnvio = {
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
        data_nascimento: formData.dataNascimento
      };

      await updateUser(userId, dadosParaEnvio);

      alert("Usuário atualizado com sucesso!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(`Erro na atualização: ${error.message || 'Falha na requisição'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
        {loadingGet ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-6 h-6 text-teal-700" />
                <h2 className="text-lg font-semibold text-gray-900">Editar Usuário</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4" /> Nome Completo
                </label>
                <input 
                  type="text" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4" /> E-mail
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Shield className="w-4 h-4" /> Perfil
                </label>
                <select 
                  name="perfil" 
                  value={formData.perfil} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Selecione um perfil</option>
                  <option value="Gestor">Gestor</option>
                  <option value="Coordenador">Coordenador</option>
                  <option value="Professor">Professor</option>
                  <option value="Aluno">Aluno</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4" /> Data de Nascimento
                </label>
                <input 
                  type="date" 
                  name="dataNascimento" 
                  value={formData.dataNascimento} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditarUserModal;