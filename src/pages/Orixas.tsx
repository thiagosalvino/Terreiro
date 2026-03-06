import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Orixa } from '../types';

export function Orixas() {
  const [orixas, setOrixas] = useState<Orixa[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrixa, setEditingOrixa] = useState<Orixa | null>(null);
  const [formData, setFormData] = useState({ name: '', active: true });

  const fetchOrixas = async () => {
    const res = await fetch('/api/orixas');
    const data = await res.json();
    setOrixas(data);
  };

  useEffect(() => {
    fetchOrixas();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const method = editingOrixa ? 'PUT' : 'POST';
    const url = editingOrixa ? `/api/orixas/${editingOrixa.id}` : '/api/orixas';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    setIsModalOpen(false);
    setEditingOrixa(null);
    setFormData({ name: '', active: true });
    fetchOrixas();
  };

  const openEdit = (orixa: Orixa) => {
    setEditingOrixa(orixa);
    setFormData({ name: orixa.name, active: orixa.active === 1 });
    setIsModalOpen(true);
  };

  const toggleStatus = async (orixa: Orixa) => {
    await fetch(`/api/orixas/${orixa.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orixa.name, active: orixa.active === 1 ? false : true }),
    });
    fetchOrixas();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Orixás</h1>
        <button
          onClick={() => {
            setEditingOrixa(null);
            setFormData({ name: '', active: true });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          <span>Novo Orixá</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="p-4 font-semibold text-zinc-600">Nome do Orixá</th>
              <th className="p-4 font-semibold text-zinc-600">Status</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orixas.map((orixa) => (
              <tr key={orixa.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="p-4 text-zinc-900 font-medium">{orixa.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${orixa.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {orixa.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-end space-x-2">
                  <button onClick={() => openEdit(orixa)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => toggleStatus(orixa)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title={orixa.active ? "Inativar" : "Ativar"}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {orixas.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-zinc-500">Nenhum orixá cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl my-8 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">{editingOrixa ? 'Editar Orixá' : 'Novo Orixá'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Orixá</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Oxalá"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-zinc-700">Orixá Ativo</label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
