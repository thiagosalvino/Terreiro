import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Sparkles, Megaphone, Briefcase, Wallet, Settings, Menu, X, LogOut, User as UserIcon, Pin, PinOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';
import { logout } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isPinned: boolean;
  onPinToggle: () => void;
}

export function Sidebar({ isPinned, onPinToggle }: SidebarProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const effectiveOpen = isPinned || isOpen;
  const showOverlay = !isPinned && isOpen;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin'] },
    { to: '/mural', icon: Megaphone, label: 'Mural / Painel', roles: ['admin', 'medium', 'consulente'] },
    { to: '/pessoas', icon: Users, label: 'Médiuns/Consulentes', roles: ['admin', 'medium', 'consulente'] },
    { to: '/gestao-servicos', icon: Briefcase, label: 'Gestão de Serviços', roles: ['admin'] },
    { to: '/gestao-financeira', icon: Wallet, label: 'Gestão Financeira', roles: ['admin'] },
    { type: 'separator', roles: ['admin', 'medium'] },
    { type: 'header', label: 'Cadastros Básicos', roles: ['admin', 'medium'] },
    { to: '/cargos', icon: UserCog, label: 'Cargos da Casa', roles: ['admin', 'medium'] },
    { to: '/servicos', icon: Settings, label: 'Serviços', roles: ['admin', 'medium'] },
    { to: '/orixas', icon: Sparkles, label: 'Orixás', roles: ['admin', 'medium'] },
    { to: '/usuarios', icon: UserIcon, label: 'Usuários', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* Overlay for all screen sizes when sidebar is open and not pinned */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating toggle button for all screen sizes */}
      {!isPinned && (
        <button
          className="fixed bottom-6 right-6 z-50 p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-zinc-100 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
          effectiveOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-zinc-800">
          <h1 className="font-bold text-xl tracking-tight transition-opacity">
            Terreiro<span className="text-amber-500">App</span>
          </h1>
          <button 
            onClick={onPinToggle}
            className={cn(
              "p-1.5 rounded-lg transition-colors hover:bg-zinc-800",
              isPinned ? "text-amber-500 bg-amber-500/10" : "text-zinc-500"
            )}
            title={isPinned ? "Desafixar menu" : "Fixar menu"}
          >
            {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="my-4 border-t border-zinc-800" />;
            }
            if (item.type === 'header') {
              return (
                <div key={`header-${index}`} className="px-4 py-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to || ''}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-amber-500/10 text-amber-500"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  )
                }
              >
                {item.icon && <item.icon size={20} className="min-w-[20px]" />}
                <span className="ml-3 font-medium transition-opacity">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-zinc-800 space-y-4">
          {user && (
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-100 truncate">{user.displayName || 'Sem nome'}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors group"
          >
            <LogOut size={20} className="min-w-[20px]" />
            <span className="ml-3 font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
