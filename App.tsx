
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, Zap, Flame, Skull, AlertTriangle, Clock, Calendar
} from 'lucide-react';
import { UserProfile, Quest, Transaction, JournalEntry, Stats, QuestRank, Habit } from './types';
import DashboardBoss from './components/DashboardBoss';
import QuestLog from './components/QuestLog';
import StatusWindow from './components/StatusWindow';
import Vault from './components/Vault';
import Archive from './components/Archive';

const INITIAL_STATS: Stats = {
  strength: 10, vitality: 10, agility: 10, intelligence: 10, unspentPoints: 0
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Hunter Tanpa Nama',
  rank: QuestRank.E,
  level: 1,
  exp: 0,
  maxExp: 100,
  gold: 0,
  coins: 0,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  inventory: [],
  stats: INITIAL_STATS,
  monthlyIncome: 3000000,
  totalSpentThisMonth: 0,
  dailySavingsBalance: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  hasPenalty: false,
  penaltyExpiry: 0,
  lastResetWeek: -1,
  startDate: Date.now(),
  lastActiveDate: new Date().toISOString().split('T')[0],
  missionStreak: 0,
  routineStreak: 0,
  questsCleared: 0,
  habitsCleared: 0,
  mainMissionsCleared: 0,
  bossKills: 0,
  activityHistory: {}
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sovereign_v6_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_PROFILE, ...parsed };
    }
    return INITIAL_PROFILE;
  });
  
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('sovereign_v6_quests');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('sovereign_v6_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sovereign_v6_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('sovereign_v6_journal');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollRefs = {
    boss: useRef<HTMLDivElement>(null),
    missions: useRef<HTMLDivElement>(null),
    vault: useRef<HTMLDivElement>(null),
    status: useRef<HTMLDivElement>(null),
    archive: useRef<HTMLDivElement>(null),
  };

  // Logika Carryover Jatah Harian & Deteksi Hari Baru
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (profile.lastResetDate !== todayStr) {
      const yesterdayStr = profile.lastResetDate;
      const spentYesterday = transactions
        .filter(t => t.dateString === yesterdayStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const standardDaily = Math.floor(profile.monthlyIncome / 30);
      // Saldo baru = Jatah Kemarin (Standard + Simpanan Sebelumnya) - Terpakai Kemarin
      const newSavingsBalance = (standardDaily + profile.dailySavingsBalance) - spentYesterday;

      setProfile(prev => ({ 
        ...prev, 
        lastResetDate: todayStr,
        lastActiveDate: todayStr,
        dailySavingsBalance: newSavingsBalance,
        // Update penalti: jika jatah hari ini (standard + savings) masih negatif, penalti aktif
        hasPenalty: (standardDaily + newSavingsBalance) < 0
      }));
      
      setHabits(prev => prev.map(h => ({ ...h, completedToday: false })));
    }
  }, [profile.lastResetDate, transactions, profile.monthlyIncome]);

  useEffect(() => {
    localStorage.setItem('sovereign_v6_profile', JSON.stringify(profile));
    localStorage.setItem('sovereign_v6_quests', JSON.stringify(quests));
    localStorage.setItem('sovereign_v6_habits', JSON.stringify(habits));
    localStorage.setItem('sovereign_v6_transactions', JSON.stringify(transactions));
    localStorage.setItem('sovereign_v6_journal', JSON.stringify(journal));
  }, [profile, quests, habits, transactions, journal]);

  const recordActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => ({
      ...prev,
      activityHistory: {
        ...prev.activityHistory,
        [today]: (prev.activityHistory[today] || 0) + 1
      }
    }));
  }, []);

  // SISTEM TRANSFER JIWA (EXPORT/IMPORT)
  const handleExportData = () => {
    const data = {
      profile,
      quests,
      habits,
      transactions,
      journal,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereign_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.profile) setProfile(data.profile);
        if (data.quests) setQuests(data.quests);
        if (data.habits) setHabits(data.habits);
        if (data.transactions) setTransactions(data.transactions);
        if (data.journal) setJournal(data.journal);
        alert("Sinkronisasi Jiwa Berhasil! Data telah dipulihkan.");
      } catch (err) {
        alert("Gagal membaca artefak data. File mungkin rusak.");
      }
    };
    reader.readAsText(file);
  };

  const addExp = useCallback((amount: number) => {
    setProfile(prev => {
      const finalAmount = prev.hasPenalty ? Math.floor(amount * 0.7) : amount;
      let newExp = prev.exp + finalAmount;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let newUnspentPoints = prev.stats.unspentPoints;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.floor(newMaxExp * 1.2);
        newUnspentPoints += 5;
      }

      let newRank = prev.rank;
      if (newLevel >= 80) newRank = QuestRank.S;
      else if (newLevel >= 60) newRank = QuestRank.A;
      else if (newLevel >= 40) newRank = QuestRank.B;
      else if (newLevel >= 25) newRank = QuestRank.C;
      else if (newLevel >= 10) newRank = QuestRank.D;

      return { 
        ...prev, 
        level: newLevel, 
        exp: newExp, 
        maxExp: newMaxExp, 
        rank: newRank, 
        stats: { ...prev.stats, unspentPoints: newUnspentPoints } 
      };
    });
  }, []);

  const damageBoss = (rank: QuestRank) => {
    const damageMap: Record<QuestRank, number> = {
      [QuestRank.E]: 20, [QuestRank.D]: 50, [QuestRank.C]: 150,
      [QuestRank.B]: 400, [QuestRank.A]: 1000, [QuestRank.S]: 3000,
    };
    
    setProfile(prev => {
      if (!prev.currentBoss) return prev;
      const penaltyMult = prev.hasPenalty ? 0.5 : 1.0;
      const newHp = Math.max(0, prev.currentBoss.hp - (damageMap[rank] * penaltyMult));
      const newlyDefeated = newHp === 0 && !prev.currentBoss.defeated;
      return {
        ...prev,
        bossKills: newlyDefeated ? prev.bossKills + 1 : prev.bossKills,
        currentBoss: {
          ...prev.currentBoss,
          hp: newHp,
          defeated: newHp === 0
        }
      };
    });
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-['Inter'] selection:bg-sky-500/30">
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-slate-900/90 backdrop-blur-lg border-b border-sky-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold system-font tracking-widest text-sky-400 mana-text-glow flex items-center gap-2">
            <Shield className="w-5 h-5" /> SOVEREIGN
          </h1>
          <div className="hidden lg:flex gap-6 items-center">
            <button onClick={() => scrollTo(scrollRefs.boss)} className="text-[10px] font-black hover:text-sky-400 transition-colors uppercase tracking-widest">DUNIA</button>
            <button onClick={() => scrollTo(scrollRefs.missions)} className="text-[10px] font-black hover:text-sky-400 transition-colors uppercase tracking-widest">MISI</button>
            <button onClick={() => scrollTo(scrollRefs.vault)} className="text-[10px] font-black hover:text-sky-400 transition-colors uppercase tracking-widest">BRANKAS</button>
            <button onClick={() => scrollTo(scrollRefs.status)} className="text-[10px] font-black hover:text-sky-400 transition-colors uppercase tracking-widest">STATUS</button>
            <button onClick={() => scrollTo(scrollRefs.archive)} className="text-[10px] font-black hover:text-sky-400 transition-colors uppercase tracking-widest">ARSIP</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end border-r border-slate-800 pr-6">
            <p className="text-[10px] font-black text-sky-500 uppercase flex items-center gap-2">
               <Clock className="w-3 h-3" /> {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[8px] text-slate-500 font-bold uppercase">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">LVL {profile.level}</span>
              <span className="text-xs font-bold text-sky-400 tracking-tighter">{profile.rank}-RANK</span>
            </div>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div className="h-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]" style={{ width: `${(profile.exp / profile.maxExp) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-20 space-y-32">
        <section ref={scrollRefs.boss} className="scroll-mt-24">
          <DashboardBoss profile={profile} setProfile={setProfile} />
        </section>

        <section ref={scrollRefs.missions} className="scroll-mt-24">
          <QuestLog 
            quests={quests} 
            habits={habits}
            setQuests={setQuests}
            setHabits={setHabits}
            onCompleteQuest={(id) => {
              const q = quests.find(x => x.id === id);
              if (q && !q.completed) {
                setQuests(prev => prev.map(x => x.id === id ? { ...x, completed: true } : x));
                addExp(q.rewardExp);
                damageBoss(q.rank);
                recordActivity();
                setProfile(p => ({ 
                  ...p, 
                  gold: p.gold + q.rewardGold,
                  questsCleared: p.questsCleared + 1,
                  mainMissionsCleared: q.isMain ? p.mainMissionsCleared + 1 : p.mainMissionsCleared
                }));
              }
            }}
            onCompleteHabit={(id) => {
              const h = habits.find(x => x.id === id);
              if (h && !h.completedToday) {
                setHabits(prev => prev.map(x => x.id === id ? { ...x, completedToday: true, streak: x.streak + 1 } : x));
                const habitRank = h.level === 'A' ? QuestRank.B : h.level === 'B' ? QuestRank.D : QuestRank.E;
                damageBoss(habitRank);
                addExp(h.level === 'A' ? 50 : h.level === 'B' ? 20 : 10);
                recordActivity();
                setProfile(p => ({ ...p, habitsCleared: p.habitsCleared + 1 }));
              }
            }}
          />
        </section>

        <section ref={scrollRefs.vault} className="scroll-mt-24">
          <Vault 
            profile={profile}
            setProfile={setProfile}
            transactions={transactions}
            onExport={handleExportData}
            onImport={handleImportData}
            onExpense={(amount, note, category) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const newTx = { 
                id: crypto.randomUUID(), 
                amount, 
                note, 
                category, 
                date: Date.now(),
                dateString: todayStr
              };
              setTransactions(prev => [newTx, ...prev]);
              
              const standardDaily = Math.floor(profile.monthlyIncome / 30);
              const limitToday = standardDaily + profile.dailySavingsBalance;
              
              const totalSpentToday = transactions
                .filter(t => t.dateString === todayStr)
                .reduce((sum, t) => sum + t.amount, 0) + amount;

              const isOver = totalSpentToday > limitToday;
              
              setProfile(prev => ({
                ...prev,
                totalSpentThisMonth: prev.totalSpentThisMonth + amount,
                hasPenalty: isOver,
                hp: isOver ? Math.max(1, prev.hp - 10) : prev.hp
              }));
              return isOver;
            }}
          />
        </section>

        <section ref={scrollRefs.status} className="scroll-mt-24">
          <StatusWindow profile={profile} setProfile={setProfile} />
        </section>

        <section ref={scrollRefs.archive} className="scroll-mt-24">
          <Archive journal={journal} setJournal={setJournal} quests={quests} onEntryReward={() => { addExp(20); recordActivity(); }} />
        </section>
      </div>
    </div>
  );
};

export default App;
