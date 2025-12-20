
import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Volume2, LogOut, ChevronRight, Camera, RefreshCw, Save, X, Edit2, Bot, BrainCircuit, Zap, Sparkles } from 'lucide-react';
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
  const [avatarSeed, setAvatarSeed] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Save Config
  const [quickSaveAmount, setQuickSaveAmount] = useState(5);

  // Function to load metadata
  const loadMetadata = async () => {
      const session = await authService.getSession();
      if (session?.user?.user_metadata) {
          setFullName(session.user.user_metadata.full_name || '');
          setBio(session.user.user_metadata.bio || 'Ahorrador entusiasta');
          setAvatarSeed(session.user.user_metadata.avatar_seed || session.user.email || 'seed');
          if (session.user.user_metadata.quick_save_amount) {
              setQuickSaveAmount(session.user.user_metadata.quick_save_amount);
          }
      }
  };

  useEffect(() => {
      loadMetadata();
  }, []);

  const handleRandomizeAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
  };

  const handleSaveProfile = async () => {
      setIsSaving(true);
      try {
          await authService.updateProfile({ 
              full_name: fullName, 
              bio: bio,
              avatar_seed: avatarSeed,
              quick_save_amount: quickSaveAmount
          });
          
          onUpdateName();
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
    <div className="h-full flex flex-col animate-fade-in pb-32">
      <div className="flex justify-between items-center mb-8 px-1">
        <div>
            <h2 className="text-3xl font-heading font-black text-slate-900">Ajustes</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Tu Espacio Personal</p>
        </div>
        {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-3 bg-white border border-slate-100 text-brand-600 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">
                <Edit2 size={20} />
            </button>
        )}
      </div>

      <div className="space-y-6">
          
          {/* Profile Card Optimized */}
          <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 relative overflow-hidden transition-all duration-300">
              <div className="h-24 bg-gradient-to-r from-brand-600 to-indigo-800"></div>
              
              <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
                  <div className="relative group/avatar mb-4">
                      <div className="w-28 h-28 rounded-[2rem] border-[6px] border-white shadow-2xl bg-white relative overflow-hidden transition-transform duration-500 group-hover/avatar:scale-105">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=f8fafc`} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                          />
                      </div>
                      {isEditing && (
                          <button 
                            onClick={handleRandomizeAvatar}
                            className="absolute -bottom-2 -right-2 p-3 bg-brand-600 text-white rounded-2xl shadow-xl hover:bg-brand-700 active:scale-90 transition-all z-10 border-4 border-white animate-bounce-subtle"
                            title="Cambiar Avatar"
                          >
                              <RefreshCw size={18} />
                          </button>
                      )}
                  </div>
                  
                  {isEditing ? (
                      <div className="w-full space-y-4 animate-fade-in">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                              <input 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:ring-4 focus:ring-brand-500/10 text-center"
                                placeholder="Escribe tu nombre..."
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Bio</label>
                              <input 
                                value={bio} 
                                onChange={e => setBio(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-sm outline-none focus:ring-4 focus:ring-brand-500/10 text-center"
                                placeholder="¿Cómo te defines ahorrando?"
                              />
                          </div>

                          <div className="flex gap-2 pt-2">
                              <button onClick={() => { setIsEditing(false); loadMetadata(); }} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all">Cancelar</button>
                              <button onClick={handleSaveProfile} disabled={isSaving} className="flex-[2] py-4 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 transition-all">
                                  {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={16}/> Guardar Cambios</>}
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="animate-pop-in">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-3 ${level.color}`}>
                             <span className="text-sm">{level.icon}</span> 
                             {level.name}
                        </div>
                        <h3 className="text-2xl font-heading font-black text-slate-900 leading-tight">{fullName || 'Ahorrador'}</h3>
                        <p className="text-slate-500 font-bold text-sm mt-1">{bio || 'Gestionando mi futuro'}</p>
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-3">{userEmail}</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-500" /> Preferencias de la App
                  </h4>
                  <div className="space-y-4">
                      <SettingItem 
                        icon={<Bell size={20} />} 
                        color="bg-rose-50 text-rose-500" 
                        label="Notificaciones" 
                        subLabel="Alertas inteligentes"
                        toggle 
                        checked={notificationsEnabled} 
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                      />
                      <SettingItem 
                        icon={<Volume2 size={20} />} 
                        color="bg-blue-50 text-blue-500" 
                        label="Efectos de Sonido" 
                        subLabel="Feedback auditivo"
                        toggle 
                        checked={soundEnabled} 
                        onChange={() => { setSoundEnabled(!soundEnabled); onToggleSound(); }} 
                      />
                  </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Bot size={14} className="text-brand-500" /> Inteligencia Artificial
                  </h4>
                  <div className="space-y-5">
                      <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 text-xs uppercase tracking-wider">Tono de Finny</span>
                          <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-1 rounded-lg font-black uppercase">{personality}</span>
                      </div>
                      <div className="flex p-1.5 bg-slate-50 rounded-2xl gap-1">
                          {(['STRICT', 'MOTIVATOR', 'SARCASTIC'] as AIPersonality[]).map(p => (
                              <button key={p} onClick={() => setPersonality(p)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${personality === p ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400'}`}>
                                  {p === 'STRICT' ? 'Frío' : p === 'MOTIVATOR' ? 'Fan' : 'Loco'}
                              </button>
                          ))}
                      </div>
                  </div>
              </section>
          </div>

          <button onClick={onLogout} className="w-full flex items-center justify-between p-6 bg-rose-50 rounded-[2.5rem] border border-rose-100 text-rose-600 active:scale-95 transition-all group mt-4">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <LogOut size={20} />
                  </div>
                  <div className="text-left">
                      <p className="font-heading font-black text-sm uppercase tracking-widest">Cerrar Sesión</p>
                      <p className="text-[10px] font-bold opacity-60">Guardaremos tu progreso</p>
                  </div>
              </div>
              <ChevronRight size={20} />
          </button>
      </div>

      <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">FinanzasAI v4.0 Mobile Edition</p>
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
        <div className="flex items-center justify-between p-2 rounded-2xl cursor-pointer" onClick={toggle ? onChange : undefined}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-heading font-black text-slate-800 text-sm leading-none">{label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subLabel}</p>
                </div>
            </div>
            {toggle && (
                <div className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-action shadow-lg shadow-action/20' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
