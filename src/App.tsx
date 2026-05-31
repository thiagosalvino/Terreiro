import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { People } from './pages/People';
import { Roles } from './pages/Roles';
import { Orixas } from './pages/Orixas';
import { Mural } from './pages/Mural';
import { GestaoServicos } from './pages/GestaoServicos';
import { GestaoFinanceira } from './pages/GestaoFinanceira';
import { Servicos } from './pages/Servicos';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { cn } from './lib/utils';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('sidebarPinned') === 'true';
  });
  const { user, loading } = useAuth();

  const togglePin = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    localStorage.setItem('sidebarPinned', String(newState));
  };

  useEffect(() => {
    document.title = 'TerreiroApp';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  if (user.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Cadastro Pendente</h2>
          <p className="text-zinc-600 mb-6">Seu cadastro está pendente de aprovação pelo administrador do sistema. Por favor, aguarde.</p>
          <button 
            onClick={() => auth.signOut()}
            className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (user.status === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Acesso Negado</h2>
          <p className="text-zinc-600 mb-6">Seu acesso foi negado pelo administrador. Entre em contato para mais informações.</p>
          <button 
            onClick={() => auth.signOut()}
            className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
        <Sidebar isPinned={isPinned} onPinToggle={togglePin} />
        <main className={cn(
          "flex-1 overflow-y-auto w-full transition-all duration-300 ease-in-out",
          isPinned ? "lg:pl-64" : "pl-0"
        )}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mural" element={<Mural />} />
            <Route path="/pessoas" element={<People />} />
            <Route path="/gestao-servicos" element={<GestaoServicos />} />
            <Route path="/gestao-financeira" element={<GestaoFinanceira />} />
            <Route path="/cargos" element={<Roles />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/orixas" element={<Orixas />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
