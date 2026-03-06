import { useEffect, useState } from 'react';
import { Users, UserCheck, HeartHandshake } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalPeople: 0,
    activeMediums: 0,
    totalConsulentes: 0,
  });

  useEffect(() => {
    // Fetch stats
    fetch('/api/people')
      .then(res => res.json())
      .then(people => {
        setStats({
          totalPeople: people.length,
          activeMediums: people.filter((p: any) => p.type === 'medium' && p.active === 1).length,
          totalConsulentes: people.filter((p: any) => p.type === 'consulente').length,
        });
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Cadastros</p>
            <p className="text-3xl font-bold text-zinc-900">{stats.totalPeople}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Médiuns Ativos</p>
            <p className="text-3xl font-bold text-zinc-900">{stats.activeMediums}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex items-center space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <HeartHandshake size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Consulentes</p>
            <p className="text-3xl font-bold text-zinc-900">{stats.totalConsulentes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
