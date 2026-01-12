import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

import { API_BASE_URL as API_URL } from '../services/api';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'activate' | 'change' | 'forgot' | 'reset';
  onSubmit?: (data: any) => void;
}

export function PasswordModal({ isOpen, onClose, mode: initialMode, onSubmit }: PasswordModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setToken('');
      setError('');
      setSuccessMessage('');
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (['activate', 'change', 'reset'].includes(mode)) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem!');
        return;
      }
      if (password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        const response = await fetch(`${API_URL}/auth/forgot_password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) throw new Error('Erro ao solicitar recuperação. Verifique o e-mail.');
        
        setSuccessMessage(`E-mail enviado para ${email}. Verifique sua caixa de entrada.`);

      } else if (mode === 'reset') {
        const response = await fetch(`${API_URL}/auth/reset_password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token: token,
            new_password: password 
          }),
        });

        if (!response.ok) {
           const errData = await response.json();
           throw new Error(errData.detail || 'Token inválido ou expirado.');
        }

        alert('Senha redefinida com sucesso! Faça login com a nova senha.');
        onClose();

      } else if (mode === 'activate') {
        if (onSubmit) onSubmit(password);
        
      } else if (mode === 'change') {
        if (onSubmit) onSubmit(password);
      }

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'activate': return 'Ativar Conta';
      case 'change': return 'Mudar Senha';
      case 'forgot': return 'Recuperar Senha';
      case 'reset': return 'Redefinir Senha';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Acervo Mestre" className="h-14" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-2 mb-6">
              {mode === 'reset' && initialMode === 'forgot' && (
                 <button onClick={() => setMode('forgot')} className="p-1 hover:bg-gray-100 rounded">
                   <ArrowLeft className="w-4 h-4 text-gray-500" />
                 </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 flex-1 text-center">
                {getTitle()}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                  {successMessage}
                </div>
              )}

              {mode === 'forgot' && (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail Cadastrado
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              )}

              {mode === 'change' && (
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              )}

              {mode === 'reset' && (
                <div className="mb-4">
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Verificação (Token)
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Cole o código recebido no e-mail"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {mode === 'change' ? 'Nova Senha' : 'Crie sua Senha'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition-colors font-medium disabled:opacity-50 flex justify-center"
              >
                {isLoading ? (
                   <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                   mode === 'forgot' ? 'Enviar Link' : 'Confirmar'
                )}
              </button>

              {mode === 'forgot' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Já tenho um código de verificação
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}