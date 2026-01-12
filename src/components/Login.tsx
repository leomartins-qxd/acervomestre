import { useState } from 'react';
import logo from '../assets/logo.png';
import { API_BASE_URL as API_URL } from '../services/api';

interface LoginProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onActivateAccount: () => void;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function Login({ onLogin, onForgotPassword, onActivateAccount }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('E-mail ou senha incorretos.');
        } else if (response.status === 403) {
          throw new Error('Usuário inativo ou pendente de ativação.');
        } else if (response.status === 422) {
          throw new Error('Dados inválidos. Verifique os campos.');
        } else {
          throw new Error('Erro de conexão com o servidor.');
        }
      }

      const data: TokenResponse = await response.json();

      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);

      onLogin();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Acervo Mestre" className="h-16" />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail Institucional
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@escola.edu"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={onActivateAccount}
                className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Ativar conta
              </button>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition-colors font-medium disabled:bg-teal-400 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}