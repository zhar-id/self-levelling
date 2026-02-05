
import React from 'react';
import { UserProfile, Stats } from '../types';
import { Shield, Zap, Flame, Brain, PlusCircle, Star, Repeat, Sword, Clock, Activity, CheckCircle, Skull, ChevronLeft, ChevronRight } from 'lucide-react';

interface StatusWindowProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const StatusWindow: React.FC<StatusWindowProps> = ({ profile, setProfile }) => {
  const upgradeStat = (statName: keyof Stats) => {
    if (profile.stats.unspentPoints > 0) {
      setProfile(prev => {
        const newStats = { ...prev.stats };
        (newStats[statName] as number) += 1;
        newStats.unspentPoints -= 1;
        let newMaxHp = 100 + (newStats.vitality - 10) * 15;
        return { ...prev, stats: newStats, maxHp: newMaxHp, hp: prev.hp === prev.maxHp ? newMaxHp : prev.hp };
      });
    }
  };

  const activeDays = Math.max(1, Math.ceil((Date.now() - profile.startDate) / 86400000));

  // Heatmap Logic - Monthly Grid (GitHub Style)
  const getHeatmapGrid = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = [];
    // Padding for empty days at start
    for (let i = 0; i < firstDay; i++) { grid.push(null); }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = profile.activityHistory[dateStr] || 0;
      grid.push({ day: d, count, date: dateStr });
    }
    return grid;
  };

  const heatmapGrid = getHeatmapGrid();
  const monthName = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-16 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-12">
        <div>
          <h1 className="text-6xl font-black system-font tracking-tighter text-white uppercase leading-none">Jendela Status</h1>
          <p className="text-slate-500 text-[10px] mt-4 font-black tracking-[0.3em] uppercase italic">Pusat Evolusi Sovereign</p>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/30 px-10 py-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
          <p className="text-[10px] text-sky-400 font-black uppercase mb-1 tracking-widest">Ability Points</p>
          <p className="text-4xl font-black system-font text-white">{profile.stats.unspentPoints} AP</p>
        </div>
      </div>

      {/* SHADOW ACTIVITY (MONTHLY GITHUB STYLE) */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
               <Activity className="w-3 h-3 text-sky-500" /> Peta Aktivitas Shadow Hunter
            </h3>
            <div className="flex items-center gap-4">
               <button className="text-slate-600 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
               <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{monthName}</span>
               <button className="text-slate-600 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-3 max-w-2xl">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-[8px] font-black text-slate-600 uppercase text-center">{d}</div>
            ))}
            {heatmapGrid.map((item, i) => (
              <div 
                key={i} 
                title={item ? `${item.date}: ${item.count} Aktivitas` : ''}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all group ${
                  !item ? 'opacity-0' :
                  item.count === 0 ? 'bg-slate-900 border border-slate-800/50' :
                  item.count < 3 ? 'bg-sky-900/50 border border-sky-500/20' :
                  item.count < 6 ? 'bg-sky-700 border border-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]' :
                  'bg-sky-500 border border-sky-200/40 shadow-[0_0_15px_#38bdf8] scale-105'
                }`}
              >
                {item && (
                  <span className={`text-[10px] font-black ${item.count > 5 ? 'text-white' : item.count > 0 ? 'text-sky-100' : 'text-slate-700'}`}>
                    {item.day}
                  </span>
                )}
                {item && item.count > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 scale-0 group-hover:scale-100 transition-transform"></div>
                )}
              </div>
            ))}
         </div>

         <div className="flex items-center gap-4 mt-10">
            <span className="text-[8px] font-bold text-slate-600 uppercase">Intensitas:</span>
            <div className="flex gap-1">
               <div className="w-3 h-3 rounded-sm bg-slate-900"></div>
               <div className="w-3 h-3 rounded-sm bg-sky-900"></div>
               <div className="w-3 h-3 rounded-sm bg-sky-700"></div>
               <div className="w-3 h-3 rounded-sm bg-sky-500 shadow-[0_0_5px_#38bdf8]"></div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <section className="space-y-12">
           <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col items-center gap-12">
              <div className="w-full space-y-4">
                 <StatRowUpgrade label="STRENGTH" value={profile.stats.strength} icon={<Flame className="w-4 h-4 text-red-500" />} onUpgrade={() => upgradeStat('strength')} canUpgrade={profile.stats.unspentPoints > 0} />
                 <StatRowUpgrade label="VITALITY" value={profile.stats.vitality} icon={<Shield className="w-4 h-4 text-emerald-500" />} onUpgrade={() => upgradeStat('vitality')} canUpgrade={profile.stats.unspentPoints > 0} />
                 <StatRowUpgrade label="AGILITY" value={profile.stats.agility} icon={<Zap className="w-4 h-4 text-amber-500" />} onUpgrade={() => upgradeStat('agility')} canUpgrade={profile.stats.unspentPoints > 0} />
                 <StatRowUpgrade label="INTELLIGENCE" value={profile.stats.intelligence} icon={<Brain className="w-4 h-4 text-sky-500" />} onUpgrade={() => upgradeStat('intelligence')} canUpgrade={profile.stats.unspentPoints > 0} />
              </div>
           </div>
        </section>

        <section className="space-y-8">
           <div className="grid grid-cols-2 gap-4">
              <StreakCard label="Mission Streak" value={profile.missionStreak} icon={<Sword className="w-5 h-5 text-sky-500" />} />
              <StreakCard label="Routine Streak" value={profile.routineStreak} icon={<Clock className="w-5 h-5 text-purple-500" />} />
           </div>
           
           <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 space-y-6 shadow-2xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Statistik Kumulatif</h3>
              <StatLabelRow label="Misi Hunter Tuntas" value={profile.questsCleared} icon={<CheckCircle className="w-3.5 h-3.5" />} />
              <StatLabelRow label="Misi Utama Tuntas" value={profile.mainMissionsCleared} icon={<Star className="w-3.5 h-3.5 text-amber-500" />} />
              <StatLabelRow label="Ritual Terlaksana" value={profile.habitsCleared} icon={<Repeat className="w-3.5 h-3.5 text-emerald-500" />} />
              <StatLabelRow label="Bos Dimusnahkan" value={profile.bossKills} color="text-red-500" icon={<Skull className="w-3.5 h-3.5" />} />
              <StatLabelRow label="Hari Operasi" value={activeDays} color="text-sky-400" />
           </div>
        </section>
      </div>
    </div>
  );
};

const StatRowUpgrade = ({ label, value, icon, onUpgrade, canUpgrade }: any) => (
  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-inner group">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
      <span className="font-black system-font text-slate-300 uppercase text-xs tracking-widest">{label}</span>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-2xl font-black system-font text-white">{value}</span>
      {canUpgrade && <button onClick={onUpgrade} className="text-sky-500 hover:scale-110 transition-transform"><PlusCircle className="w-6 h-6"/></button>}
    </div>
  </div>
);

const StreakCard = ({ label, value, icon }: any) => (
  <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2rem] flex flex-col items-center gap-3 shadow-xl">
     {icon}
     <div className="text-center">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black system-font text-white">{value} HARI</p>
     </div>
  </div>
);

const StatLabelRow = ({ label, value, color = "text-white", icon }: any) => (
  <div className="flex justify-between items-center border-b border-slate-800/50 pb-5">
     <div className="flex items-center gap-3">
        {icon}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     </div>
     <span className={`text-2xl font-black system-font ${color}`}>{value}</span>
  </div>
);

export default StatusWindow;
