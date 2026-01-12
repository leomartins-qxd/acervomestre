import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Profile } from './components/Profile';
import { Sidebar } from './components/Sidebar';
import { PlaylistDetail } from './components/PlaylistDetail';
import { AdminPanel } from './components/AdminPanel';
import { ResourceDetail } from './components/ResourceDetail';
import { Login } from './components/Login';
import { ActivateAccount } from './components/ActivateAccount';
import { PasswordModal } from './modals/PasswordModal';

export type View = 'home' | 'profile' | 'admin' | 'playlist' | 'resource';

const API_URL = 'https://acervomestrebackend.onrender.com';

export interface User {
  id: number;
  nome?: string;
  name?: string;
  email: string;
  perfil: string;
  role?: string;
  url_perfil?: string;
  data_nascimento?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('accessToken'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showActivateAccount, setShowActivateAccount] = useState(false);
  
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('accessToken');
    if (token) fetchCurrentUser(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleForgotPassword = () => {
    setShowPasswordModal(true);
  };

  const handleActivateAccount = () => {
    setShowActivateAccount(true);
  };

  const handleActivateSubmit = () => {
    setShowActivateAccount(false);
    alert('Conta ativada com sucesso! Faça login para continuar.');
  };

  const handlePasswordSubmit = (password: string) => {
    console.log(password);
    setShowPasswordModal(false);
    alert('Senha alterada com sucesso! Faça login com a nova senha.');
  };

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setCurrentView('playlist');
  };

  const handleResourceClick = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setCurrentView('resource');
  };

  const handleUserUpdate = () => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchCurrentUser(token);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login 
          onLogin={handleLogin} 
          onForgotPassword={handleForgotPassword}
          onActivateAccount={handleActivateAccount}
        />
        <ActivateAccount
          isOpen={showActivateAccount}
          onClose={() => setShowActivateAccount(false)}
          onSuccess={handleActivateSubmit}
        />
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          mode="change"
          onSubmit={handlePasswordSubmit}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {currentView === 'home' && (
          <Home 
            onPlaylistClick={handlePlaylistClick}
            onResourceClick={handleResourceClick}
          />
        )}
        
        {currentView === 'profile' && (
          <Profile 
            onPlaylistClick={handlePlaylistClick} 
            onResourceClick={handleResourceClick}
            onUserUpdate={handleUserUpdate}
            user={currentUser}
          />
        )}
        
        {currentView === 'admin' && <AdminPanel />}
        
        {currentView === 'playlist' && (
          <PlaylistDetail
            playlistId={selectedPlaylistId}
            onBack={() => setCurrentView('profile')}
            onResourceClick={handleResourceClick}
          />
        )}
        
        {currentView === 'resource' && (
          <ResourceDetail 
            resourceId={selectedResourceId}
            onBack={() => setCurrentView('home')} 
          />
        )}
      </main>
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        mode="change"
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}