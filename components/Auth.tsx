import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Check, User } from 'lucide-react';
import { authService } from '../services/authService';
import Mascot from './Mascot';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction State for Mascot
  const [focusField, setFocusField] = useState<'name' | 'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await authService.signIn(email, password);
      } else {
        if (!name.trim()) throw new Error("Por favor ingresa tu nombre");
        await authService.signUp(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 lg:p-0 relative overflow-hidden">
      
      <div className="w-full max-w-6xl mx-auto flex h-auto lg:h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100">
        
        {/* Left Side - Visual (Desktop) */}
        <div className="hidden lg:flex w-1/2 bg-brand-600 relative items-center justify-center overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-900/50 to-transparent"></div>
            
            <div className="relative z-10 text-center text-white p-12">
                <div className="mb-8 animate-float">
                    <Mascot variant={focusField === 'password' ? 'thinking' : 'celebrating'} size={280} />
                </div>
                <h2 className="text-4xl font-heading font-black mb-4 tracking-tight">Tu dinero, <br/>más inteligente.</h2>
                <p className="text-brand-100 text-lg max-w-md mx-auto leading-relaxed">
                    Únete a FinanzasAI y toma el control de tu futuro con la ayuda de Finny, tu asesor personal.
                </p>

                {/* Badges */}
                <div className="flex gap-3 justify-center mt-8">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
                        ✨ IA Avanzada
                    </div>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
                        🔒 100% Seguro
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative">
             {/* Mobile Mascot Header */}
            <div className="lg:hidden flex flex-col items-center mb-6">
                 <Mascot variant={focusField === 'password' ? 'thinking' : 'happy'} size={120} />
                 <h1 className="text-2xl font-black text-slate-900 mt-2">Bienvenido</h1>
            </div>

            <div className="max-w-md mx-auto w-full">
                <div className="mb-8 hidden lg:block">
                     <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">
                        {isLogin ? 'Hola de nuevo 👋' : 'Crea tu cuenta 🚀'}
                     </h1>
                     <p className="text-slate-500 font-medium">
                        {isLogin ? 'Ingresa tus datos para continuar.' : 'Empieza a ahorrar en minutos.'}
                     </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                    <div className="p-1 bg-white rounded-full shrink-0"><Check size={12} className="text-rose-500"/></div>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {!isLogin && (
                        <div className="space-y-1.5 animate-slide-up">
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
                        className="w-full btn-primary mt-4 text-lg"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : (
                            <>
                                {isLogin ? 'Entrar' : 'Registrarme'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 font-medium">
                        {isLogin ? '¿Nuevo aquí?' : '¿Ya tienes cuenta?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
                        >
                            {isLogin ? 'Crear Cuenta' : 'Iniciar Sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;