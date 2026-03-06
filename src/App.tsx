import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { People } from './pages/People';
import { Roles } from './pages/Roles';
import { Orixas } from './pages/Orixas';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pessoas" element={<People />} />
            <Route path="/cargos" element={<Roles />} />
            <Route path="/orixas" element={<Orixas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
