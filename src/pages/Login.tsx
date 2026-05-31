import { useState } from 'react';
import { loginWithGoogle, registerUserWithGoogle } from '../firebase';
import { UserPlus, LogIn, ShieldCheck, Users } from 'lucide-react';

export function Login() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setInfo('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.message === 'USER_NOT_REGISTERED') {
        setError('Usuário não cadastrado. Por favor, realize o cadastro primeiro.');
      } else {
        setError('Erro ao fazer login com Google. Tente novamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (role: 'medium' | 'consulente') => {
    setError('');
    setSuccess('');
    setInfo('');
    setLoading(true);
    try {
      await registerUserWithGoogle(role);
      setSuccess('Cadastro realizado com sucesso!');
    } catch (err: any) {
      if (err.message === 'USER_ALREADY_REGISTERED') {
        setShowRegisteredModal(true);
      } else {
        setError('Erro ao realizar cadastro. Tente novamente.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            <span className="text-zinc-900">Terreiro</span>
            <span className="text-amber-600">App</span>
          </h1>
          <p className="text-zinc-500">Sistema de Gestão</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'login' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/30' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <LogIn size={18} />
            <span>Entrar</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'register' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/30' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <UserPlus size={18} />
            <span>Cadastrar</span>
          </button>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium border border-emerald-100">
              {success}
            </div>
          )}
          {info && (
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-sm font-medium border border-blue-100">
              {info}
            </div>
          )}

          {activeTab === 'login' ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 text-center">Acesse sua conta utilizando o Google</p>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                <span>{loading ? 'Conectando...' : 'Entrar com Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Medium Registration */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-zinc-800 font-bold">
                  <ShieldCheck size={20} className="text-amber-600" />
                  <span>Cadastro de Médium</span>
                </div>
                <p className="text-xs text-zinc-500">Para médiuns da casa. Vincule sua conta Google para criar seu acesso.</p>
                <button
                  onClick={() => handleGoogleRegister('medium')}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 brightness-0 invert" referrerPolicy="no-referrer" />
                  <span>Vincular Google (Médium)</span>
                </button>
              </div>

              <div className="border-t border-zinc-100 pt-6 space-y-3">
                <div className="flex items-center space-x-2 text-zinc-800 font-bold">
                  <Users size={20} className="text-blue-600" />
                  <span>Cadastro de Consulente</span>
                </div>
                <p className="text-xs text-zinc-500">Para visitantes e consulentes. Crie seu acesso rápido com o Google.</p>
                <button
                  onClick={() => handleGoogleRegister('consulente')}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                  <span>Cadastrar como Consulente</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pb-8 px-8 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
            Terreiro App &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Already Registered Modal */}
      {showRegisteredModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 text-center mb-2">Já Cadastrado</h3>
            <p className="text-zinc-500 text-center mb-8">
              Você já possui um cadastro no sistema. Por favor, utilize a tela de login para acessar sua conta.
            </p>
            <button
              onClick={() => {
                setShowRegisteredModal(false);
                setActiveTab('login');
              }}
              className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-zinc-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
