
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Check, X, Repeat, Activity, Sword, Star, Clock, CheckCircle2 } from 'lucide-react';
import { Quest, QuestType, QuestRank, Habit, HabitLevel } from '../types';

interface QuestLogProps {
  quests: Quest[];
  habits: Habit[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  onCompleteQuest: (id: string) => void;
  onCompleteHabit: (id: string) => void;
}

const QuestLog: React.FC<QuestLogProps> = ({ quests, habits, setQuests, setHabits, onCompleteQuest, onCompleteHabit }) => {
  const [modalType, setModalType] = useState<QuestType | 'HABIT' | null>(null);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [scheduledDays, setScheduledDays] = useState<number[]>([1,2,3,4,5]); 
  const [rank, setRank] = useState<QuestRank>(QuestRank.E);
  const [habitLevel, setHabitLevel] = useState<HabitLevel>(HabitLevel.C);
  const [dayCountdown, setDayCountdown] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDayCountdown(`${h}j ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setTitle(''); setDesc(''); setScheduledDays([1,2,3,4,5]); 
    setRank(QuestRank.E); setEditingQuestId(null);
    setModalType(null);
  };

  const toggleDay = (day: number) => {
    setScheduledDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !modalType) return;

    if (modalType === 'HABIT') {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        title, level: habitLevel, completedToday: false, streak: 0
      };
      setHabits(prev => [newHabit, ...prev]);
    } else {
      const rewardMap: Record<QuestRank, { exp: number, gold: number }> = {
        [QuestRank.E]: { exp: 20, gold: 10 }, [QuestRank.D]: { exp: 60, gold: 40 },
        [QuestRank.C]: { exp: 180, gold: 120 }, [QuestRank.B]: { exp: 500, gold: 350 },
        [QuestRank.A]: { exp: 1200, gold: 1000 }, [QuestRank.S]: { exp: 5000, gold: 4000 },
      };

      if (editingQuestId) {
        setQuests(prev => prev.map(q => q.id === editingQuestId ? {
          ...q, title, description: desc, scheduledDays, rank,
          rewardExp: rewardMap[rank].exp, rewardGold: rewardMap[rank].gold
        } : q));
      } else {
        const newQuest: Quest = {
          id: crypto.randomUUID(),
          title, description: desc,
          type: modalType as QuestType,
          rank, rewardExp: rewardMap[rank].exp, rewardGold: rewardMap[rank].gold,
          completed: false, createdAt: Date.now(),
          targetDate: new Date().toISOString().split('T')[0],
          isRoutine: modalType === QuestType.ROUTINE,
          isMain: modalType === QuestType.MAIN,
          scheduledDays
        };
        setQuests(prev => [newQuest, ...prev]);
      }
    }
    resetForm();
  };

  const openEdit = (q: Quest) => {
    setTitle(q.title); setDesc(q.description); setRank(q.rank);
    setScheduledDays(q.scheduledDays || []); setEditingQuestId(q.id);
    setModalType(q.type);
  };

  const rankColors: Record<QuestRank, string> = {
    [QuestRank.E]: 'border-slate-500 text-slate-400',
    [QuestRank.D]: 'border-emerald-500 text-emerald-400',
    [QuestRank.C]: 'border-sky-500 text-sky-400',
    [QuestRank.B]: 'border-purple-500 text-purple-400',
    [QuestRank.A]: 'border-orange-500 text-orange-400',
    [QuestRank.S]: 'border-red-500 text-red-400',
  };

  const today = new Date().getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const filterCurrentQuests = (type: QuestType) => {
    return quests.filter(q => {
      if (q.type !== type) return false;
      if (q.completed) return q.targetDate === todayStr;
      if (type === QuestType.ROUTINE) return q.scheduledDays?.includes(today);
      return true;
    });
  };

  const hunterMissions = filterCurrentQuests(QuestType.DAILY);
  const routines = filterCurrentQuests(QuestType.ROUTINE);
  const mainMissions = filterCurrentQuests(QuestType.MAIN);

  return (
    <div className="space-y-24">
      {/* 1. SKILL PASIF (HABIT) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black system-font tracking-tight flex items-center gap-3 uppercase">
              <Activity className="text-emerald-400 w-8 h-8" /> Skill Pasif (Habit)
            </h2>
            <p className="text-slate-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase italic">Ritual Pelatihan Hunter Harian</p>
          </div>
          <button onClick={() => setModalType('HABIT')} className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(h => (
            <div key={h.id} className={`p-6 rounded-[1.5rem] border transition-all flex items-center justify-between group ${h.completedToday ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50 shadow-xl'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-lg ${h.completedToday ? 'bg-emerald-500 border-emerald-400 text-white' : h.level === 'A' ? 'border-orange-500 text-orange-400' : h.level === 'B' ? 'border-sky-500 text-sky-400' : 'border-slate-500 text-slate-400'}`}>
                  {h.completedToday ? <Check className="w-6 h-6" /> : h.level}
                </div>
                <div>
                   <p className={`font-black uppercase tracking-tight ${h.completedToday ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{h.title}</p>
                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Streak: {h.streak} Hari</p>
                </div>
              </div>
              {!h.completedToday && (
                <button onClick={() => onCompleteHabit(h.id)} className="p-3 rounded-xl bg-slate-800 text-slate-500 hover:text-emerald-400 border border-slate-700 transition-all shadow-md">
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. MISI HUNTER */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-3xl font-black system-font tracking-tight flex items-center gap-3 uppercase">
                <Sword className="text-sky-400 w-8 h-8" /> Misi Hunter
              </h2>
              <p className="text-slate-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase italic">Pembersihan Dungeon Harian</p>
            </div>
            <div className="bg-sky-500/5 border border-sky-500/10 px-4 py-2 rounded-xl flex items-center gap-2">
               <Clock className="w-3 h-3 text-sky-500" />
               <span className="text-xs font-black system-font text-sky-400 uppercase tracking-tighter">{dayCountdown}</span>
            </div>
          </div>
          <button onClick={() => setModalType(QuestType.DAILY)} className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl hover:bg-sky-500 hover:text-white transition-all shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hunterMissions.map(q => (
            <div key={q.id} className={`bg-[#0f172a] border-l-8 ${rankColors[q.rank]} rounded-2xl p-6 transition-all group flex justify-between items-center shadow-xl ${q.completed ? 'opacity-40 grayscale border-slate-700' : 'hover:bg-slate-900'}`}>
              <div className="flex items-center gap-4">
                {q.completed && <CheckCircle2 className="w-6 h-6 text-sky-500" />}
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900 border mb-2 inline-block ${q.completed ? 'border-slate-800 text-slate-600' : rankColors[q.rank].split(' ')[0]}`}>RANK {q.rank}</span>
                  <h3 className={`text-xl font-black system-font uppercase tracking-tight ${q.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{q.title}</h3>
                </div>
              </div>
              {!q.completed && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(q)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all shadow-inner"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onCompleteQuest(q.id)} className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl">CLEAR</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. OPERASI RUTIN */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black system-font tracking-tight flex items-center gap-3 uppercase">
              <Repeat className="text-purple-400 w-8 h-8" /> Operasi Rutin
            </h2>
            <p className="text-slate-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase italic">Pola Pelatihan Konstan</p>
          </div>
          <button onClick={() => setModalType(QuestType.ROUTINE)} className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map(q => (
            <div key={q.id} className={`bg-[#0f172a] border-l-8 ${rankColors[q.rank]} rounded-2xl p-6 transition-all group flex justify-between items-center shadow-xl ${q.completed ? 'opacity-40 grayscale' : 'hover:bg-slate-900'}`}>
              <div className="flex items-center gap-4">
                 {q.completed && <CheckCircle2 className="w-6 h-6 text-purple-500" />}
                 <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 block">RUTINITAS AKTIF</span>
                    <h3 className={`text-xl font-black system-font uppercase tracking-tight ${q.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{q.title}</h3>
                 </div>
              </div>
              {!q.completed && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(q)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all shadow-inner"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onCompleteQuest(q.id)} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl">SETOR</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. MISI UTAMA */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black system-font tracking-tight flex items-center gap-3 uppercase">
              <Star className="text-amber-400 w-8 h-8" /> Misi Utama
            </h2>
            <p className="text-slate-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase italic">Target Jangka Panjang</p>
          </div>
          <button onClick={() => setModalType(QuestType.MAIN)} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-lg">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {mainMissions.map(q => (
             <div key={q.id} className={`bg-[#0f172a] border-2 ${rankColors[q.rank]} rounded-3xl p-8 shadow-2xl relative overflow-hidden group transition-all ${q.completed ? 'opacity-40 grayscale' : 'hover:scale-[1.01]'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-5"><Star className="w-24 h-24 text-amber-500" /></div>
                <div className="flex justify-between items-start mb-6">
                   <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full bg-slate-900 border ${q.completed ? 'border-slate-800 text-slate-600' : rankColors[q.rank].split(' ')[0]}`}>RANK {q.rank} MAIN</span>
                   {!q.completed && <button onClick={() => openEdit(q)} className="p-2 text-slate-600 hover:text-white transition-colors"><Edit2 className="w-4 h-4"/></button>}
                </div>
                <h3 className={`text-2xl font-black system-font uppercase tracking-tight mb-2 ${q.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{q.title}</h3>
                <p className="text-sm text-slate-400 italic mb-8">"{q.description || 'Tidak ada detail misi.'}"</p>
                {!q.completed && (
                  <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                    <div className="flex gap-4">
                        <div className="text-center"><p className="text-[8px] font-black text-slate-600 uppercase">EXP</p><p className="text-sky-400 font-black">+{q.rewardExp}</p></div>
                        <div className="text-center"><p className="text-[8px] font-black text-slate-600 uppercase">GOLD</p><p className="text-amber-500 font-black">+{q.rewardGold}</p></div>
                    </div>
                    <button onClick={() => onCompleteQuest(q.id)} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl text-xs uppercase tracking-widest shadow-xl">COMPLETE</button>
                  </div>
                )}
             </div>
           ))}
        </div>
      </section>

      {/* MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-xl rounded-[2.5rem] p-10 shadow-3xl">
             <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black system-font text-sky-400 uppercase tracking-tighter flex items-center gap-3">
                 {editingQuestId ? <Edit2 className="w-8 h-8" /> : <Plus className="w-8 h-8" />} 
                 {editingQuestId ? 'Ubah' : 'Daftar'} {modalType === 'HABIT' ? 'Ritual' : modalType}
               </h2>
               <button onClick={resetForm} className="p-2 text-slate-500 hover:text-white"><X /></button>
             </div>
             
             <form onSubmit={handleSaveQuest} className="space-y-8">
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Judul Objektif</label>
                   <input required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 text-white font-bold text-lg" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                
                {modalType !== 'HABIT' && (
                  <>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Keterangan Opsional</label>
                      <textarea className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 text-white text-sm" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Tingkat Kesulitan (Rank)</label>
                      <div className="flex gap-2">
                          {Object.values(QuestRank).map(r => (
                            <button key={r} type="button" onClick={() => setRank(r)} className={`flex-1 py-3 rounded-xl font-black border transition-all ${rank === r ? 'bg-sky-500 border-sky-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>{r}</button>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'HABIT' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Level Skill</label>
                    <div className="flex gap-2">
                        {['A','B','C'].map(lv => (
                            <button key={lv} type="button" onClick={() => setHabitLevel(lv as HabitLevel)} className={`flex-1 py-3 rounded-xl font-black border ${habitLevel === lv ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>{lv}</button>
                        ))}
                    </div>
                  </div>
                )}

                {modalType === QuestType.ROUTINE && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Penjadwalan Hari</label>
                    <div className="flex justify-between gap-1">
                      {[0,1,2,3,4,5,6].map(d => (
                          <button key={d} type="button" onClick={() => toggleDay(d)} className={`w-10 h-10 rounded-xl text-[10px] font-black border transition-all ${scheduledDays.includes(d) ? 'bg-purple-500 border-purple-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                              {['M','S','S','R','K','J','S'][d]}
                          </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-5 rounded-[1.5rem] uppercase tracking-widest shadow-2xl transition-all">KONFIRMASI PENDAFTARAN</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestLog;
