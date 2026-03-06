import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, X, MessageCircle, Search, Filter } from 'lucide-react';
import { Person, Role, Orixa } from '../types';

const initialFormData: Omit<Person, 'id'> = {
  type: 'consulente',
  full_name: '',
  social_name: '',
  birth_date: '',
  cpf: '',
  phone: '',
  email: '',
  zip_code: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  entry_date: '',
  role_id: null,
  orixa1_id: null,
  orixa2_id: null,
  orixa3_id: null,
  participation: null,
  active: 1,
  inactive_date: '',
};

export function People() {
  const [people, setPeople] = useState<Person[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [orixas, setOrixas] = useState<Orixa[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState<Omit<Person, 'id'>>(initialFormData);
  const [cpfError, setCpfError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [noNumber, setNoNumber] = useState(false);

  // New states for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'medium' | 'consulente'>('all');

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
  };

  const formatCPF = (val: string) => {
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return v;
  };

  const formatPhone = (val: string) => {
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    return v;
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleCEPChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.slice(0, 8);
    
    let formattedCEP = cep;
    if (cep.length > 5) {
      formattedCEP = `${cep.slice(0, 5)}-${cep.slice(5)}`;
    }
    
    setFormData(prev => ({ ...prev, zip_code: formattedCEP }));

    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            zip_code: formattedCEP,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const fetchData = async () => {
    const [pRes, rRes, oRes] = await Promise.all([
      fetch('/api/people'),
      fetch('/api/roles'),
      fetch('/api/orixas')
    ]);
    setPeople(await pRes.json());
    setRoles(await rRes.json());
    setOrixas(await oRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    if (formData.cpf && !validateCPF(formData.cpf)) {
      setCpfError('CPF inválido');
      hasError = true;
    } else {
      setCpfError('');
    }

    if (formData.email && !validateEmail(formData.email)) {
      setEmailError('E-mail inválido');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) return;

    const method = editingPerson ? 'PUT' : 'POST';
    const url = editingPerson ? `/api/people/${editingPerson.id}` : '/api/people';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error && data.error.includes('CPF')) {
          setCpfError(data.error);
          return; // Stop execution if there's a CPF error from backend
        }
        throw new Error(data.error || 'Erro ao salvar cadastro');
      }
      
      setIsModalOpen(false);
      setEditingPerson(null);
      setFormData(initialFormData);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao salvar o cadastro. Tente novamente.');
    }
  };

  const openEdit = async (person: Person) => {
    await fetchData();
    setCpfError('');
    setEmailError('');
    setEditingPerson(person);
    setNoNumber(person.number === 'SN' || person.number === 'S/N');
    setFormData({
      type: person.type,
      full_name: person.full_name,
      social_name: person.social_name || '',
      birth_date: person.birth_date || '',
      cpf: person.cpf || '',
      phone: person.phone || '',
      email: person.email || '',
      zip_code: person.zip_code || '',
      address: person.address || '',
      number: person.number || '',
      complement: person.complement || '',
      neighborhood: person.neighborhood || '',
      city: person.city || '',
      state: person.state || '',
      entry_date: person.entry_date || '',
      role_id: person.role_id,
      orixa1_id: person.orixa1_id,
      orixa2_id: person.orixa2_id,
      orixa3_id: person.orixa3_id,
      participation: person.participation,
      active: person.active,
      inactive_date: person.inactive_date || '',
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (person: Person) => {
    const updatedPerson = { ...person, active: person.active === 1 ? 0 : 1 };
    if (updatedPerson.active === 0) {
      updatedPerson.inactive_date = new Date().toISOString().split('T')[0];
    } else {
      updatedPerson.inactive_date = null;
    }
    
    await fetch(`/api/people/${person.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPerson),
    });
    fetchData();
  };

  // Derived state for filtered people
  const filteredPeople = people.filter(person => {
    const matchesType = filterType === 'all' || person.type === filterType;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      person.full_name.toLowerCase().includes(searchLower) || 
      (person.social_name && person.social_name.toLowerCase().includes(searchLower)) ||
      (person.cpf && person.cpf.includes(searchQuery));
    
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-zinc-900">Médiuns e Consulentes</h1>
        <button
          onClick={() => {
            setCpfError('');
            setEmailError('');
            setEditingPerson(null);
            setFormData(initialFormData);
            setNoNumber(false);
            fetchData();
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Nova Pessoa</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-zinc-50 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex bg-zinc-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('medium')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'medium' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Médiuns
          </button>
          <button
            onClick={() => setFilterType('consulente')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'consulente' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Consulentes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="p-4 font-semibold text-zinc-600">Nome</th>
                <th className="p-4 font-semibold text-zinc-600">Vínculo</th>
                <th className="p-4 font-semibold text-zinc-600">Telefone</th>
                <th className="p-4 font-semibold text-zinc-600">Status</th>
                <th className="p-4 font-semibold text-zinc-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((person) => (
                <tr key={person.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-zinc-900">{person.full_name}</div>
                    {person.social_name && <div className="text-sm text-zinc-500">{person.social_name}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.type === 'medium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {person.type === 'medium' ? 'Médium da Casa' : 'Consulente'}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-600">
                    {person.phone ? (
                      <a 
                        href={`https://wa.me/55${person.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                        title="Enviar mensagem no WhatsApp"
                      >
                        <MessageCircle size={16} />
                        <span>{person.phone}</span>
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${person.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {person.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end space-x-2">
                    <button onClick={() => openEdit(person)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => toggleStatus(person)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title={person.active ? "Inativar" : "Ativar"}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPeople.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    {people.length === 0 ? 'Nenhuma pessoa cadastrada.' : 'Nenhum resultado encontrado para o filtro atual.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl my-8 relative">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
              <h2 className="text-xl font-bold text-zinc-900">{editingPerson ? 'Editar Cadastro' : 'Novo Cadastro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Vínculo */}
              <section>
                <h3 className="text-lg font-semibold text-zinc-800 mb-4">Vínculo com a Casa</h3>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="consulente"
                      checked={formData.type === 'consulente'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'consulente' | 'medium' })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-zinc-700">Consulente</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="medium"
                      checked={formData.type === 'medium'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'consulente' | 'medium' })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-zinc-700">Médium da Casa</span>
                  </label>
                </div>
              </section>

              {/* Dados Pessoais */}
              <section>
                <h3 className="text-lg font-semibold text-zinc-800 mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nome Completo *</label>
                    <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nome Social/Afetivo</label>
                    <input type="text" value={formData.social_name || ''} onChange={(e) => setFormData({ ...formData, social_name: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Nascimento *</label>
                    <input type="date" required value={formData.birth_date || ''} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">CPF *</label>
                    <input type="text" required value={formData.cpf || ''} onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })} placeholder="000.000.000-00" className={`w-full px-4 py-2 border ${cpfError ? 'border-red-500 focus:ring-red-500' : 'border-zinc-200 focus:ring-amber-500'} rounded-xl focus:ring-2 outline-none`} />
                    {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Celular *</label>
                    <input type="text" required value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} placeholder="(00) 00000-0000" className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail *</label>
                    <input type="email" required value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-2 border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-zinc-200 focus:ring-amber-500'} rounded-xl focus:ring-2 outline-none`} />
                    {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                  </div>
                </div>
              </section>

              {/* Endereço */}
              <section>
                <h3 className="text-lg font-semibold text-zinc-800 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">CEP</label>
                    <input type="text" value={formData.zip_code || ''} onChange={handleCEPChange} placeholder="00000-000" className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Endereço</label>
                    <input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-zinc-700">Número</label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noNumber}
                          onChange={(e) => {
                            setNoNumber(e.target.checked);
                            if (e.target.checked) {
                              setFormData({ ...formData, number: 'SN' });
                            } else {
                              setFormData({ ...formData, number: '' });
                            }
                          }}
                          className="w-3 h-3 text-amber-600 focus:ring-amber-500 rounded"
                        />
                        <span className="text-xs text-zinc-500">Sem número</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={noNumber ? '' : (formData.number || '')} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                        setFormData({ ...formData, number: val });
                      }} 
                      disabled={noNumber}
                      placeholder={noNumber ? "S/N" : ""}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-zinc-100 disabled:text-zinc-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Complemento</label>
                    <input type="text" value={formData.complement || ''} onChange={(e) => setFormData({ ...formData, complement: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Bairro</label>
                    <input type="text" value={formData.neighborhood || ''} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Município</label>
                    <input type="text" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Estado</label>
                    <input type="text" value={formData.state || ''} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>
              </section>

              {/* Dados do Médium */}
              {formData.type === 'medium' && (
                <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-4">Dados do Médium</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Entrada na Casa *</label>
                      <input type="date" required value={formData.entry_date || ''} onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Cargo na Casa</label>
                      <select value={formData.role_id || ''} onChange={(e) => setFormData({ ...formData, role_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                        <option value="">Selecione um cargo</option>
                        {roles.filter(r => r.active !== 0).map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Orixá 1</label>
                      <select value={formData.orixa1_id || ''} onChange={(e) => setFormData({ ...formData, orixa1_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                        <option value="">Selecione um orixá</option>
                        {orixas.filter(o => o.active !== 0).map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Orixá 2</label>
                      <select value={formData.orixa2_id || ''} onChange={(e) => setFormData({ ...formData, orixa2_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                        <option value="">Selecione um orixá</option>
                        {orixas.filter(o => o.active !== 0).map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Orixá 3</label>
                      <select value={formData.orixa3_id || ''} onChange={(e) => setFormData({ ...formData, orixa3_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                        <option value="">Selecione um orixá</option>
                        {orixas.filter(o => o.active !== 0).map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Participação *</label>
                      <select required value={formData.participation || ''} onChange={(e) => setFormData({ ...formData, participation: e.target.value as any })} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                        <option value="">Selecione</option>
                        <option value="umbanda">Umbanda</option>
                        <option value="candomble">Candomblé</option>
                        <option value="umbanda/candomble">Umbanda/Candomblé</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-amber-200/50">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.active === 1}
                          onChange={(e) => {
                            const isActive = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              active: isActive ? 1 : 0,
                              inactive_date: isActive ? '' : new Date().toISOString().split('T')[0]
                            });
                          }}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-zinc-700">Médium Ativo</span>
                      </label>

                      {formData.active === 0 && (
                        <div className="flex-1 max-w-xs">
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Inativação</label>
                          <input 
                            type="date" 
                            value={formData.inactive_date || ''} 
                            onChange={(e) => setFormData({ ...formData, inactive_date: e.target.value })} 
                            className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <div className="pt-6 border-t border-zinc-100 flex justify-between items-center">
                <div className="text-xs text-zinc-400">
                  {editingPerson && (
                    <div className="flex flex-col space-y-1">
                      {editingPerson.created_at && (
                        <p>Registrado em: {new Date(editingPerson.created_at).toLocaleString('pt-BR')} por {editingPerson.created_by}</p>
                      )}
                      {editingPerson.updated_at && (
                        <p>Última alteração: {new Date(editingPerson.updated_at).toLocaleString('pt-BR')} por {editingPerson.updated_by}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors font-medium shadow-sm"
                  >
                    Salvar Cadastro
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
