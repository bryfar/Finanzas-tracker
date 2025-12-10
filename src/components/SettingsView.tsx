
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

  // Quick Save Config
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

  useEffect(() => {
      loadMetadata();
  }, []);

  useEffect(() => {
      if (userName) setFullName(userName);
  }, [userName]);

  const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
          await authService.updateProfile({ 
              full_name: fullName, 
              bio: bio,
              avatar_seed: avatarSeed,
              quick_save_amount: quickSaveAmount
          });
          
          await onUpdateName();
          setIsEditing(false);
          
      } catch (error) {
          console.error("Error updating profile", error);
      } finally {
          setIsSaving(false);
      }
  };

  const getLevel = (streak: number) => {
      if (streak > 30) return { name: 'Maestro', color: 'bg-amber-100 text-amber-600', icon: '👑' };
      if (streak > 10) return { name: 'Constante', color: 'bg-indigo-100 text-indigo-600', icon: '🚀' };
      if (streak > 3) return { name: 'Aprendiz', color: 'bg-emerald-100 text-emerald-600', icon: '🌱' };
      return { name: 'Novato', color: 'bg-slate-100 text-slate-500', icon: '🥚' };
  };

  const level = getLevel(streak);

  return (
    <div className="h-full flex flex-col animate-fade-in pb-24 lg:pb-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-black text-slate-900">Configuración</h2>
        {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-xl font-bold text-xs hover:bg-brand-100 transition-colors flex items-center gap-2">
                <Edit2 size={14} /> Editar
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Profile Card (Full Width, Compact) */}
          <div className="md:col-span-2 bg-white rounded-[2rem] shadow-soft border border-slate-100 relative overflow-hidden transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-brand-500 to-purple-600 group-hover:h-24 transition-all duration-500"></div>
              
              <div className="relative px-6 pt-10 pb-6 flex flex-col md:flex-row items-center md:items-end gap-5">
                  <div className="relative group/avatar shrink-0">
                      <div className="w-24 h-24 rounded-full border-[5px] border-white shadow-lg bg-slate-50 relative overflow-hidden">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                          />
                      </div>
                      {isEditing && (
                          <button 
                            onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                            className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 hover:scale-110 transition-all active:scale-95 z-10"
                            title="Generar nuevo avatar"
                            type="button"
                          >
                              <RefreshCw size={14} />
                          </button>
                      )}
                  </div>
                  
                  <div className="flex-1 w-full text-center md:text-left">
                      {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in mt-2">
                              <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Nombre</label>
                                  <input 
                                    value={fullName} 
                                    onChange={e => setFullName(e.target.value)}
                                    className="input-base py-2 px-3 text-sm"
                                    placeholder="Tu nombre"
                                  />
                              </div>
                              <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Bio</label>
                                  <input 
                                    value={bio} 
                                    onChange={e => setBio(e.target.value)}
                                    className="input-base py-2 px-3 text-sm font-normal"
                                    placeholder="Ej. Estudiante"
                                  />
                              </div>
                              
                              {/* Quick Save Config */}
                              <div className="md:col-span-2 bg-indigo-50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                  <div>
                                      <label className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1 mb-0.5">
                                          <Zap size={12} fill="currentColor"/> Monto de Ahorro Rápido
                                      </label>
                                      <p className="text-[9px] text-indigo-400 opacity-80">Para el modo Finny Snaps</p>
                                  </div>
                                  <div className="flex gap-1.5">
                                      {[1, 5, 10, 20].map(amt => (
                                          <button 
                                            key={amt} 
                                            onClick={() => setQuickSaveAmount(amt)}
                                            type="button"
                                            className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${quickSaveAmount === amt ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-white text-indigo-400 border border-indigo-100'}`}
                                          >
                                              {amt}
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              <div className="md:col-span-2 flex justify-end gap-2 pt-1">
                                  <button onClick={() => { setIsEditing(false); loadMetadata(); }} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-xs">Cancelar</button>
                                  <button onClick={handleSaveProfile} disabled={isSaving} className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 hover:bg-brand-500 flex items-center gap-2 text-xs">
                                      {isSaving ? 'Guardando...' : <><Save size={14}/> Guardar</>}
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                              <div>
                                <h3 className="text-2xl font-heading font-black text-slate-900 leading-tight">{fullName || 'Usuario'}</h3>
                                <p className="text-slate-500 font-medium text-sm mb-0.5">{bio}</p>
                                <p className="text-xs text-slate-300 font-medium">{userEmail}</p>
                              </div>
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs ${level.color}`}>
                                   <span className="text-base">{level.icon}</span> 
                                   {level.name}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Preferences */}
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-5 h-full flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield size={14} /> Sistema
              </h4>
              <div className="space-y-1">
                  <SettingItem 
                    icon={<Bell size={18} />} 
                    color="bg-rose-100 text-rose-500" 
                    label="Notificaciones" 
                    subLabel="Alertas"
                    toggle 
                    checked={notificationsEnabled} 
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                  />
                  <div className="h-px bg-slate-50 mx-4"></div>
                  <SettingItem 
                    icon={<Volume2 size={18} />} 
                    color="bg-blue-100 text-blue-500" 
                    label="Sonidos" 
                    subLabel="Efectos"
                    toggle 
                    checked={soundEnabled} 
                    onChange={() => { setSoundEnabled(!soundEnabled); onToggleSound(); }} 
                  />
              </div>
          </section>

          {/* AI Config */}
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-5 h-full flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Bot size={14} /> Inteligencia Artificial
              </h4>
              <div className="space-y-4">
                  <div>
                      <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800 text-xs">Personalidad</span>
                          <span className="text-[9px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md font-bold uppercase">{personality}</span>
                      </div>
                      <div className="flex p-1 bg-slate-50 rounded-xl">
                          {(['STRICT', 'MOTIVATOR', 'SARCASTIC'] as AIPersonality[]).map(p => (
                              <button key={p} onClick={() => setPersonality(p)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${personality === p ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                  {p === 'STRICT' ? 'Estricto' : p === 'MOTIVATOR' ? 'Amigo' : 'Sarcástico'}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800 text-xs">Riesgo</span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold uppercase">{risk}</span>
                      </div>
                      <div className="flex p-1 bg-slate-50 rounded-xl">
                          {(['CONSERVATIVE', 'MODERATE', 'RISKY'] as RiskProfile[]).map(r => (
                              <button key={r} onClick={() => setRisk(r)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${risk === r ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                  {r === 'CONSERVATIVE' ? 'Bajo' : r === 'MODERATE' ? 'Medio' : 'Alto'}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </section>

          {/* Session */}
          <section className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-soft overflow-hidden">
               <button onClick={onLogout} className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-colors group">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogOut size={18} />
                      </div>
                      <div className="text-left">
                          <p className="font-heading font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">Cerrar Sesión</p>
                          <p className="text-xs text-slate-400">Salir de tu cuenta actual</p>
                      </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-400" />
               </button>
          </section>
      </div>

      <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-bold text-slate-400">FinanzasAI v3.2 Desktop</p>
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
        <div className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer" onClick={toggle ? onChange : undefined}>
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-heading font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{subLabel}</p>
                </div>
            </div>
            {toggle && (
                <div className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-brand-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${checked ? 'left-5' : 'left-0.5'}`}></div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;