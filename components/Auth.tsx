
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, User, AlertCircle, Info, CheckCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import Mascot from './Mascot';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
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
      if (mode === 'login') {
        const result = await authService.signIn(email, password);
        if (!result.session && result.user) {
          setSuccessMsg("Iniciado, pero verifica tu correo.");
        }
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error("Por favor ingresa tu nombre");
        const result = await authService.signUp(email, password, name);
        if (result.user && !result.session) {
          setSuccessMsg("¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta.");
          setMode('login');
        }
      } else if (mode === 'forgot') {
        await authService.resetPassword(email);
        setSuccessMsg("Se ha enviado un correo para restablecer tu contraseña.");
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      console.error("Detailed Auth error:", err);
      if (err.message?.includes('Failed to fetch')) {
          setError("Error crítico de conexión: No se pudo contactar con Supabase. Esto sucede si:\n1. Tienes un AdBlocker activo (desactívalo).\n2. El proyecto de base de datos está PAUSADO en el panel de Supabase.");
      } else {
          setError(err.message || 'Error inesperado al intentar autenticar.');
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
                    Únete a FinanzasAI y toma el control de tu futuro con la ayuda de Finny.
                </p>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center relative bg-white">
            <div className="max-w-md mx-auto w-full">
                <div className="mb-8">
                     <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">
                        {mode === 'login' ? 'Hola de nuevo 👋' : mode === 'signup' ? 'Crea tu cuenta 🚀' : 'Recuperar acceso 🔑'}
                     </h1>
                     <p className="text-slate-500 font-medium">
                        {mode === 'login' ? 'Ingresa tus datos para continuar.' : mode === 'signup' ? 'Empieza a gestionar tus ahorros hoy.' : 'Enviaremos un enlace a tu correo.'}
                     </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{error}</span>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-3">
                    <CheckCircle size={20} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'signup' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" size={20} />
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)} className="input-base pl-12" placeholder="Ej. Juan Pérez" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" size={20} />
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} className="input-base pl-12" placeholder="tu@email.com" />
                        </div>
                    </div>

                    {mode !== 'forgot' && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center pr-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
                                {mode === 'login' && (
                                    <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black text-brand-500 uppercase hover:underline">¿La olvidaste?</button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" size={20} />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusField('password')} onBlur={() => setFocusField(null)} className="input-base pl-12" placeholder="••••••••" />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white font-heading font-black rounded-2xl py-4 shadow-xl shadow-brand-600/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 size={24} className="animate-spin" /> : (
                            <>
                                {mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : 'Enviar Enlace'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 font-medium">
                        {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya eres miembro?'}
                        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="ml-2 font-bold text-brand-600 hover:text-brand-700 underline">
                            {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
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
