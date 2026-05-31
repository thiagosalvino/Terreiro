import { useState, useEffect } from 'react';
import { User as UserIcon, Shield, ShieldAlert, Trash2, Users as UsersIcon, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('displayName'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (uid: string, newRole: User['role']) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleStatusChange = async (uid: string, newStatus: User['status']) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleDelete = (uid: string) => {
    setUserToDelete(uid);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', userToDelete));
      setUserToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'users');
      setDeleteError('Erro ao excluir usuário.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-amber-500/10 rounded-2xl">
          <UserIcon className="text-amber-500" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Usuários</h1>
          <p className="text-zinc-500">Gerencie os acessos e permissões do sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="p-4 font-semibold text-zinc-600">Usuário</th>
              <th className="p-4 font-semibold text-zinc-600">E-mail</th>
              <th className="p-4 font-semibold text-zinc-600">Nível de Acesso</th>
              <th className="p-4 font-semibold text-zinc-600">Status</th>
              <th className="p-4 font-semibold text-zinc-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-zinc-900">{user.displayName || 'Sem nome'}</div>
                  <div className="text-xs text-zinc-400 font-mono">{user.uid}</div>
                </td>
                <td className="p-4 text-zinc-600">{user.email}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {user.role === 'admin' ? (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <ShieldAlert size={14} />
                        <span>Administrador</span>
                      </span>
                    ) : user.role === 'medium' ? (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-zinc-800 text-white rounded-full text-xs font-medium">
                        <Shield size={14} />
                        <span>Médium</span>
                      </span>
                    ) : user.role === 'consulente' ? (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <UsersIcon size={14} />
                        <span>Consulente</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium">
                        <Shield size={14} />
                        <span>Usuário</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {user.status === 'approved' ? (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle2 size={14} />
                        <span>Ativo</span>
                      </span>
                    ) : user.status === 'denied' ? (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <XCircle size={14} />
                        <span>Negado</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <ShieldAlert size={14} />
                        <span>Pendente</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 flex justify-end items-center space-x-3">
                  <div className="flex items-center space-x-2 mr-2">
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(user.uid, 'approved')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(user.uid, 'denied')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Negar"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    {user.status === 'denied' && (
                      <button
                        onClick={() => handleStatusChange(user.uid, 'approved')}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reativar"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    {user.status === 'approved' && user.role !== 'admin' && (
                      <button
                        onClick={() => handleStatusChange(user.uid, 'denied')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Inativar"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as User['role'])}
                    className="text-xs border border-zinc-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="admin">Admin</option>
                    <option value="medium">Médium</option>
                    <option value="consulente">Consulente</option>
                    <option value="user">Usuário</option>
                  </select>
                  <button
                    onClick={() => handleDelete(user.uid)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Excluir Usuário"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-zinc-600 mb-4">Tem certeza que deseja excluir este usuário? Ele perderá o acesso ao sistema.</p>
            {deleteError && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">{deleteError}</p>}
            <div className="flex justify-end space-x-3">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors font-medium">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
