import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Power, X } from 'lucide-react';
import { Role } from '../types';

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', active: true });
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchRoles = async () => {
    const res = await fetch('/api/roles');
    const data = await res.json();
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const method = editingRole ? 'PUT' : 'POST';
    const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData({ name: '', active: true });
    fetchRoles();
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, active: role.active === 1 });
    setIsModalOpen(true);
  };

  const toggleStatus = async (role: Role) => {
    await fetch(`/api/roles/${role.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: role.name, active: role.active === 1 ? false : true }),
    });
    fetchRoles();
  };

  const handleDelete = (id: number) => {
    setRoleToDelete(id);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      const res = await fetch(`/api/roles/${roleToDelete}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || 'Erro ao excluir.');
        return;
      }
      fetchRoles();
      setRoleToDelete(null);
      setDeleteError('');
    } catch (err) {
      setDeleteError('Erro de conexão ao tentar excluir.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Cargos da Casa</h1>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormData({ name: '', active: true });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          <span>Novo Cargo</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="p-4 font-semibold text-zinc-600">Nome do Cargo</th>
              <th className="p-4 font-semibold text-zinc-600">Status</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="p-4 text-zinc-900 font-medium">{role.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${role.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {role.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-end space-x-2">
                  <button onClick={() => openEdit(role)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors" title="Editar">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => toggleStatus(role)} className="p-2 text-zinc-400 hover:text-amber-600 transition-colors" title={role.active ? "Inativar" : "Ativar"}>
                    <Power size={18} />
                  </button>
                  <button onClick={() => handleDelete(role.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-zinc-500">Nenhum cargo cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl my-8 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900">{editingRole ? 'Editar Cargo' : 'Novo Cargo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Cargo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Pai de Santo"
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
                <label htmlFor="active" className="text-sm font-medium text-zinc-700">Cargo Ativo</label>
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

      {roleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-zinc-600 mb-4">Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita.</p>
            {deleteError && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">{deleteError}</p>}
            <div className="flex justify-end space-x-3">
              <button onClick={() => setRoleToDelete(null)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors font-medium">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
