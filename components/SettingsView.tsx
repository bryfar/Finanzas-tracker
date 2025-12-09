import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Volume2, LogOut, ChevronRight, Camera, RefreshCw, Save, X, Edit2, Bot, BrainCircuit, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { AIPersonality, RiskProfile } from '../types';

interface SettingsViewProps {
  userEmail: string;
  userName?: string;
  streak: number;
  onLogout: () => void;
  onToggleSound: () => void;
  onUpdateName: () => void; 
}

const SettingsView: React.FC<SettingsViewProps> = ({ userEmail, userName, streak, onLogout, onToggleSound, onUpdateName }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [personality, setPersonality] = useState<AIPersonality>('MOTIVATOR');
  const [risk, setRisk] = useState<RiskProfile>('MODERATE');
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userName || '');
  const [bio, setBio] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(userEmail);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Save Config [NUEVO 🔥]
  const [quickSaveAmount, setQuickSaveAmount] = useState(5);

  // Function to load metadata
  const loadMetadata = async () => {
      const session = await authService.getSession();
      if (session?.user?.user_metadata) {
          setFullName(session.user.user_metadata.full_name || '');
          setBio(session.user.user_metadata.bio || 'Ahorrador entusiasta');
          if (session.user.user_metadata.avatar_seed) {
              setAvatarSeed(session.user.user_metadata.avatar_seed);
          }
          if (session.user.user_metadata.quick_save_amount) {
              setQuickSaveAmount(session.user.user_metadata.quick_save_amount);
          }
      }
  };

  // Load initial metadata
  useEffect(() => {
      loadMetadata();
  }, []);

  // Sync with prop changes (if parent updates session)
  useEffect(() => {
      if (userName) setFullName(userName);
  }, [userName]);

  const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
          // This calls Supabase Update User
          await authService.updateProfile({ 
              full_name: fullName, 
              bio: bio,
              avatar_seed: avatarSeed,
              quick_save_amount: quickSaveAmount
          });
          
          // Force parent to refresh session
          await onUpdateName();
          
          // Close edit mode
          setIsEditing(false);
          
      } catch (error) {
          console.error("Error updating profile", error);
          alert("No se pudo actualizar el perfil. Intenta de nuevo.");
      } finally {
          setIsSaving(false);
      }
  };

  const getLevel = (streak: number) => {
      if (streak > 30) return { name: 'Maestro del Ahorro', color: 'bg-amber-100 text-amber-600', icon: '👑' };
      if (streak > 10) return { name: 'Ahorrador Constante', color: 'bg-indigo-100 text-indigo-600', icon: '🚀' };
      if (streak > 3) return { name: 'Aprendiz Financiero', color: 'bg-emerald-100 text-emerald-600', icon: '🌱' };
      return { name: 'Novato', color: 'bg-slate-100 text-slate-500', icon: '🥚' };
  };

  const level = getLevel(streak);

  return (
    <div className="h-full flex flex-col animate-fade-in pb-24 lg:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-black text-slate-900">Configuración</h2>
        {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-brand-600 font-bold text-sm hover:underline flex items-center gap-1">
                <Edit2 size={16} /> Editar Perfil
            </button>
        )}
      </div>

      {/* Editable Profile Card */}
      <div className="bg-white rounded-[2rem] shadow-soft border border-slate-100 mb-8 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-500 to-purple-600"></div>
          
          <div className="relative px-6 pt-16 pb-6 flex flex-col items-center">
              <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl bg-slate-50 relative overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover"
                      />
                  </div>
                  {isEditing && (
                      <button 
                        onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                        className="absolute bottom-2 right-2 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 hover:scale-110 transition-all active:scale-95"
                        title="Generar nuevo avatar"
                        type="button"
                      >
                          <RefreshCw size={18} />
                      </button>
                  )}
              </div>
              
              <div className="mt-4 text-center w-full max-w-sm">
                  {isEditing ? (
                      <div className="space-y-4 animate-fade-in mt-2">
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Nombre Completo</label>
                              <input 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)}
                                className="input-base text-center text-lg py-2"
                                placeholder="Tu nombre"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Ocupación / Bio</label>
                              <input 
                                value={bio} 
                                onChange={e => setBio(e.target.value)}
                                className="input-base text-center text-sm py-2 font-normal"
                                placeholder="Ej. Estudiante de Economía"
                              />
                          </div>
                          
                          {/* [NUEVO 🔥] Quick Save Config */}
                          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                              <label className="text-xs font-bold text-indigo-400 uppercase flex items-center justify-center gap-1 mb-2">
                                  <Zap size={12} fill="currentColor"/> Monto de Ahorro Rápido
                              </label>
                              <div className="flex justify-center gap-2">
                                  {[1, 5, 10, 20].map(amt => (
                                      <button 
                                        key={amt} 
                                        onClick={() => setQuickSaveAmount(amt)}
                                        type="button"
                                        className={`w-10 h-10 rounded-full font-black text-sm transition-all ${quickSaveAmount === amt ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-white text-indigo-400 border border-indigo-100'}`}
                                      >
                                          {amt}
                                      </button>
                                  ))}
                              </div>
                              <p className="text-[10px] text-indigo-400 mt-2">Se usará en el modo Finny Snaps</p>
                          </div>

                          <div className="flex gap-3 pt-2">
                              <button onClick={() => { setIsEditing(false); loadMetadata(); }} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200">Cancelar</button>
                              <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 hover:bg-brand-500 flex items-center justify-center gap-2">
                                  {isSaving ? 'Guardando...' : <><Save size={18}/> Guardar</>}
                              </button>
                          </div>
                      </div>
                  ) : (
                      <>
                        <h3 className="text-2xl font-heading font-black text-slate-900">{fullName || 'Usuario'}</h3>
                        <p className="text-slate-500 font-medium">{bio}</p>
                        <p className="text-xs text-slate-300 mt-1 mb-4">{userEmail}</p>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs ${level.color}`}>
                             <span className="text-lg">{level.icon}</span> 
                             {level.name}
                        </div>
                      </>
                  )}
              </div>
          </div>
      </div>

      <div className="space-y-8 max-w-2xl mx-auto w-full">
          {/* Preferences */}
          <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-4">Sistema</h4>
              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <SettingItem 
                    icon={<Bell size={20} />} 
                    color="bg-rose-100 text-rose-500" 
                    label="Notificaciones" 
                    subLabel="Alertas de metas y recordatorios"
                    toggle 
                    checked={notificationsEnabled} 
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                  />
                  <div className="h-px bg-slate-50 mx-6"></div>
                  <SettingItem 
                    icon={<Volume2 size={20} />} 
                    color="bg-blue-100 text-blue-500" 
                    label="Sonidos" 
                    subLabel="Efectos de interacción"
                    toggle 
                    checked={soundEnabled} 
                    onChange={() => { setSoundEnabled(!soundEnabled); onToggleSound(); }} 
                  />
              </div>
          </section>

          {/* AI Config */}
          <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-4">Configuración Finny IA</h4>
              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm p-6 space-y-4">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <Bot className="text-brand-500" size={20} />
                          <span className="font-bold text-slate-800">Personalidad</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          {(['STRICT', 'MOTIVATOR', 'SARCASTIC'] as AIPersonality[]).map(p => (
                              <button key={p} onClick={() => setPersonality(p)} className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${personality === p ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-100 text-slate-400'}`}>
                                  {p === 'STRICT' ? 'Estricto' : p === 'MOTIVATOR' ? 'Motivador' : 'Sarcástico'}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <BrainCircuit className="text-emerald-500" size={20} />
                          <span className="font-bold text-slate-800">Perfil de Riesgo</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          {(['CONSERVATIVE', 'MODERATE', 'RISKY'] as RiskProfile[]).map(r => (
                              <button key={r} onClick={() => setRisk(r)} className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${risk === r ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>
                                  {r === 'CONSERVATIVE' ? 'Conservador' : r === 'MODERATE' ? 'Moderado' : 'Arriesgado'}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </section>

          {/* Session */}
          <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-4">Sesión</h4>
              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                   <button onClick={onLogout} className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-colors group">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <LogOut size={20} />
                          </div>
                          <div className="text-left">
                              <p className="font-heading font-bold text-slate-800 text-base group-hover:text-rose-600 transition-colors">Cerrar Sesión</p>
                              <p className="text-xs text-slate-400">Salir de tu cuenta actual</p>
                          </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-rose-400" />
                   </button>
              </div>
          </section>
      </div>

      <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-xs font-bold text-slate-400">FinanzasAI v3.1</p>
          <p className="text-[10px] text-slate-300 mt-1">Hecho con ❤️ para tus ahorros</p>
      </div>
    </div>
  );
};

interface SettingItemProps {
    icon: React.ReactNode;
    color: string;
    label: string;
    subLabel: string;
    toggle?: boolean;
    checked?: boolean;
    onChange?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, color, label, subLabel, toggle, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-heading font-bold text-slate-800 text-base">{label}</p>
                    <p className="text-xs text-slate-400 font-medium">{subLabel}</p>
                </div>
            </div>
            {toggle && (
                <button 
                    onClick={onChange}
                    className={`w-14 h-8 rounded-full transition-colors relative ${checked ? 'bg-brand-500' : 'bg-slate-200'}`}
                >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
                </button>
            )}
        </div>
    );
};

export default SettingsView;