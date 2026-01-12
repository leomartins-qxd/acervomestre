import { Home, User, Settings, LogOut } from 'lucide-react';
import type { View } from '../App';
import logo from '../assets/logo.png';

interface User {
  id: number;
  nome?: string;
  name?: string;
  email: string;
  perfil: string;
  role?: string;
  url_perfil?: string;
}

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ currentView, onNavigate, user, onLogout }: SidebarProps) {
  const getUserName = () => user?.nome || user?.name || 'Usuário';
  const getUserProfile = () => user?.perfil || user?.role || 'Visitante';

  return (

    <aside className="w-[240px] h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0">
      
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <img src={logo} alt="Acervo Mestre" className="h-10 object-contain" />
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
            currentView === 'home' 
              ? 'bg-cyan-50 text-cyan-900' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium truncate">Início</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
            currentView === 'profile' 
              ? 'bg-cyan-50 text-cyan-900' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium truncate">Meu Perfil</span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            currentView === 'admin' 
              ? 'bg-cyan-50 text-cyan-900' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium truncate">Administração</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <div className="mb-3">
          <div className="font-medium text-gray-900 truncate" title={getUserName()}>
            {getUserName()}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {getUserProfile()}
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}