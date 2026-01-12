import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Loader2, AlertCircle } from 'lucide-react';
import { MetadataManagement } from './MetadataManagement';
import CadastrarUserModal from '../modals/CadastrarUserModal';
import EditarUserModal from '../modals/EditarUserModal';
import { restoreUser, deleteUser } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Ativo' | 'Inativo' | 'AguardandoAtivacao';
}

const API_URL = 'https://acervomestrebackend.onrender.com';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'metadata'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/users/get_all?page=1&per_page=100&somente_ativos=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao conectar com o servidor.');
      }

      const data = await response.json();
      
      const items = Array.isArray(data.items) ? data.items : [];

      const mappedUsers: User[] = items.map((item: any) => {
        const roleName = item.perfil?.nome || (typeof item.perfil === 'string' ? item.perfil : null) || item.role || 'Indefinido';

        return {
          id: item.id,
          name: item.nome || item.name || 'Sem Nome',
          email: item.email || 'sem@email.com',
          role: roleName,
          status: item.status || 'Inativo'
        };
      });

      setUsers(mappedUsers);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar a lista de usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const isAtivo = user.status === 'Ativo';
    const action = isAtivo ? 'desativar' : 'ativar';
    
    if (!window.confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`)) {
      return;
    }

    setIsProcessing(user.id);
    try {
      if (isAtivo) {
        await deleteUser(user.id);
      } else {
        await restoreUser(user.id);
      }
      
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || `Erro ao ${action} usuário`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleOperationSuccess = () => {
    fetchUsers();
    setIsCreateModalOpen(false);
    setEditingUserId(null);
  };

  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel de Administração</h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-full transition-colors font-medium text-sm ${
            activeTab === 'users'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gestão de Usuários
        </button>
        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-6 py-2.5 rounded-full transition-colors font-medium text-sm ${
            activeTab === 'metadata'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gestão de Tags
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
              />
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Cadastrar Novo Usuário
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full"></span>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">E-mail</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Perfil</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{user.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === 'Ativo'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={isProcessing === user.id}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                                user.status === 'Ativo'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-700 hover:bg-green-50'
                              } disabled:opacity-50`}
                            >
                              {isProcessing === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                user.status === 'Ativo' ? 'Desativar' : 'Ativar'
                              )}
                            </button>
                            <button 
                              onClick={() => setEditingUserId(user.id)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'metadata' && (
        <MetadataManagement />
      )}

      <CadastrarUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleOperationSuccess}
      />

      <EditarUserModal
        isOpen={!!editingUserId}
        onClose={() => setEditingUserId(null)}
        userId={editingUserId}
        onSuccess={handleOperationSuccess}
      />
    </div>
  );
}