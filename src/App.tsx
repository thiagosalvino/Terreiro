import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { People } from './pages/People';
import { Roles } from './pages/Roles';
import { Orixas } from './pages/Orixas';
import { Login } from './pages/Login';
import { cn } from './lib/utils';

export default function App() {
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('sidebarPinned') === 'true';
  });

  const togglePin = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    localStorage.setItem('sidebarPinned', String(newState));
  };

  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
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
            <Route path="/pessoas" element={<People />} />
            <Route path="/cargos" element={<Roles />} />
            <Route path="/orixas" element={<Orixas />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
