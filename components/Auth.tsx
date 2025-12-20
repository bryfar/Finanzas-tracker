
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, User, AlertCircle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';
import Mascot from './Mascot';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [focusField, setFocusField] = useState<'name' | 'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const result = await authService.signIn(email, password);
        if (!result.session && result.user) {
          setSuccessMsg("Iniciado, pero verifica tu correo.");
        }
      } else {
        if (!name.trim()) throw new Error("Por favor ingresa tu nombre");
        const result = await authService.signUp(email, password, name);
        
        if (result.user && !result.session) {
          setSuccessMsg("¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta.");
          setIsLogin(true);
        } else {
          setSuccessMsg("¡Cuenta creada exitosamente!");
        }
      }
    } catch (err: any) {
      console.error("Detailed Auth error:", err);
      // 'Failed to fetch' is almost always an adblocker blocking supabase.co or a paused project
      if (err.message?.includes('Failed to fetch') || err.message?.includes('Network Error')) {
          setError("Error de conexión: No se pudo contactar con el servidor. Por favor, DESACTIVA TU ADBLOCKER y verifica tu conexión a internet.");
      } else if (err.status === 400 || err.status === 422 || err.message?.includes('Invalid login')) {
          setError("Credenciales inválidas. Verifica tu email y contraseña.");
      } else {
          setError(err.message || 'Error al autenticar. El proyecto de base de datos podría estar pausado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 lg:p-0 relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex h-auto lg:h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100">
        
        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-1/2 bg-brand-600 relative items-center justify-center overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse"></div>
            <div className="relative z-10 text-center text-white p-12">
                <div className="mb-8 animate-float">
                    <Mascot variant={focusField === 'password' ? 'thinking' : 'celebrating'} size={280} />
                </div>
                <h2 className="text-4xl font-heading font-black mb-4 tracking-tight">Tu dinero, <br/>más inteligente.</h2>
                <p className="text-brand-100 text-lg max-w-md mx-auto leading-relaxed">
                    Únete a FinanzasAI y toma el control de tu futuro con la ayuda de Finny, tu asesor personal.
                </p>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-white">
            <div className="lg:hidden flex flex-col items-center mb-6">
                 <Mascot variant={focusField === 'password' ? 'thinking' : 'happy'} size={120} />
                 <h1 className="text-2xl font-black text-slate-900 mt-2">FinanzasAI</h1>
            </div>

            <div className="max-w-md mx-auto w-full">
                <div className="mb-8 hidden lg:block">
                     <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">
                        {isLogin ? 'Hola de nuevo 👋' : 'Crea tu cuenta 🚀'}
                     </h1>
                     <p className="text-slate-500 font-medium">
                        {isLogin ? 'Ingresa tus datos para continuar.' : 'Empieza a gestionar tus ahorros hoy.'}
                     </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex flex-col gap-2 animate-shake">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={20} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-3 animate-bounce">
                    <CheckCircle size={20} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => setFocusField('name')}
                                    onBlur={() => setFocusField(null)}
                                    className="input-base pl-12"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusField('email')}
                                onBlur={() => setFocusField(null)}
                                className="input-base pl-12"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusField('password')}
                                onBlur={() => setFocusField(null)}
                                className="input-base pl-12"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 text-white font-heading font-black rounded-2xl py-4 shadow-xl shadow-brand-600/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : (
                            <>
                                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 font-medium">
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya eres miembro?'}
                        <button
                            onClick={() => {
                              setIsLogin(!isLogin);
                              setError(null);
                              setSuccessMsg(null);
                            }}
                            className="ml-2 font-bold text-brand-600 hover:text-brand-700 transition-all underline"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                   <ShieldAlert size={12} className="text-emerald-500" />
                   <span>Conexión Segura con Supabase</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
