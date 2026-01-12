import { useState } from 'react';
import { X } from 'lucide-react';
import logo from '../assets/logo.png';

import { API_BASE_URL as API_URL } from '../services/api';

interface ActivateAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ActivateAccount({ isOpen, onClose, onSuccess }: ActivateAccountProps) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/activate_account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          new_password: password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error('Token inválido, expirado ou usuário já ativo.');
        } else if (response.status === 404) {
          throw new Error('Usuário não encontrado.');
        } else {
          throw new Error(errorData.detail || 'Erro ao ativar conta.');
        }
      }

      alert('Conta ativada com sucesso! Você já pode fazer login.');
      
      setToken('');
      setPassword('');
      setConfirmPassword('');
      
      if (onSuccess) onSuccess();
      onClose();

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Acervo Mestre" className="h-14" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Ativar Conta
            </h2>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Ativação (Token)
                </label>
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole o código recebido por e-mail"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Crie sua Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition-colors font-medium disabled:bg-teal-400 flex justify-center"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  'Ativar Conta'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}