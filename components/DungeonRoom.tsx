
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Enemy } from '../types';
import { Sword, Shield, Zap, Flame, Skull, Trophy, Play, RotateCcw } from 'lucide-react';

interface DungeonRoomProps {
  profile: UserProfile;
  onVictory: (exp: number, gold: number) => void;
}

const ENEMIES: Enemy[] = [
  { name: 'Goblin Scout', hp: 80, maxHp: 80, damage: 5, rewardExp: 40, rewardGold: 20, image: 'https://picsum.photos/id/1012/200/200' },
  { name: 'Orc Warrior', hp: 200, maxHp: 200, damage: 12, rewardExp: 100, rewardGold: 50, image: 'https://picsum.photos/id/1025/200/200' },
  { name: 'Dark Wraith', hp: 450, maxHp: 450, damage: 25, rewardExp: 350, rewardGold: 150, image: 'https://picsum.photos/id/1033/200/200' },
  { name: 'Ancient Dragon', hp: 1500, maxHp: 1500, damage: 60, rewardExp: 2000, rewardGold: 1000, image: 'https://picsum.photos/id/1020/200/200' }
];

const DungeonRoom: React.FC<DungeonRoomProps> = ({ profile, onVictory }) => {
  const [battleState, setBattleState] = useState<'IDLE' | 'FIGHTING' | 'VICTORY' | 'DEFEAT'>('IDLE');
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [playerHp, setPlayerHp] = useState(profile.hp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const startDungeon = (eIdx: number) => {
    const selected = { ...ENEMIES[eIdx] };
    setEnemy(selected);
    setEnemyHp(selected.maxHp);
    setPlayerHp(profile.maxHp);
    setBattleState('FIGHTING');
    setLogs(['A wild monster appears! The gate has opened.']);
    setTurn('PLAYER');
  };

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const playerAttack = () => {
    if (turn !== 'PLAYER' || !enemy) return;

    // Calc damage
    const baseDmg = 10 + profile.stats.strength * 2;
    const isCrit = Math.random() < (Math.min(50, 5 + profile.stats.agility * 0.5) / 100);
    const finalDmg = isCrit ? Math.floor(baseDmg * 2) : baseDmg;

    setEnemyHp(prev => {
      const newHp = Math.max(0, prev - finalDmg);
      addLog(`${profile.name} attacks for ${finalDmg} damage! ${isCrit ? 'CRITICAL!' : ''}`);
      
      if (newHp === 0) {
        setBattleState('VICTORY');
        addLog(`Victory! Cleared the Dungeon. Earned ${enemy.rewardExp} EXP and ${enemy.rewardGold} GOLD.`);
        onVictory(enemy.rewardExp, enemy.rewardGold);
      } else {
        setTurn('ENEMY');
        setTimeout(enemyTurn, 800);
      }
      return newHp;
    });
  };

  const enemyTurn = () => {
    setTurn('ENEMY');
    if (!enemy) return;

    const dmg = enemy.damage;
    setPlayerHp(prev => {
      const newHp = Math.max(0, prev - dmg);
      addLog(`${enemy.name} attacks back! Dealt ${dmg} damage.`);
      
      if (newHp === 0) {
        setBattleState('DEFEAT');
        addLog('System Failure: Hunter has been neutralized.');
      } else {
        setTurn('PLAYER');
      }
      return newHp;
    });
  };

  if (battleState === 'IDLE') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black system-font tracking-tight text-white flex items-center justify-center gap-3">
            <Skull className="w-10 h-10 text-slate-500" /> INSTANCED DUNGEONS
          </h1>
          <p className="text-slate-500">Select a gate to enter. Rewards scale with difficulty.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENEMIES.map((e, idx) => (
            <div key={e.name} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-sky-500/50 transition-all">
              <div className="h-40 overflow-hidden relative">
                <img src={e.image} alt={e.name} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold system-font text-white">{e.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Difficulty: {idx === 3 ? 'S-Rank' : idx === 2 ? 'A-Rank' : 'C-Rank'}</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex gap-4">
                   <div className="text-center">
                     <p className="text-[10px] text-slate-500 font-bold">EXP</p>
                     <p className="text-sky-400 font-bold">+{e.rewardExp}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[10px] text-slate-500 font-bold">GOLD</p>
                     <p className="text-amber-400 font-bold">+{e.rewardGold}</p>
                   </div>
                </div>
                <button 
                  onClick={() => startDungeon(idx)}
                  className="bg-sky-500/10 border border-sky-500/30 text-sky-400 px-6 py-2 rounded-xl font-bold hover:bg-sky-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> ENTER GATE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
         <h2 className="text-xl font-black system-font text-white">{enemy?.name} - Boss Room</h2>
         <button 
            onClick={() => setBattleState('IDLE')}
            className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold"
          >
            <RotateCcw className="w-4 h-4" /> ABANDON DUNGEON
         </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Battle Arena */}
        <div className="flex flex-col gap-6">
          {/* Enemy Display */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center">
            <img src={enemy?.image} className="w-40 h-40 rounded-full border-4 border-slate-800 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
            <div className="w-full space-y-1 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase">{enemy?.name}</p>
              <div className="h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" 
                  style={{ width: `${(enemyHp / (enemy?.maxHp || 1)) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{enemyHp} / {enemy?.maxHp}</span>
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center">
            <div className="w-full space-y-1 mb-8 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase">Hunter {profile.name}</p>
              <div className="h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300" 
                  style={{ width: `${(playerHp / profile.maxHp) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{playerHp} / {profile.maxHp}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
               <button 
                  disabled={turn !== 'PLAYER' || battleState !== 'FIGHTING'}
                  onClick={playerAttack}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-sky-500 rounded-2xl transition-all group disabled:opacity-50 disabled:hover:bg-slate-800"
               >
                 <Sword className="w-8 h-8 group-hover:scale-110 transition-transform" />
                 <span className="text-xs font-bold uppercase">Attack</span>
               </button>
               <button 
                  disabled={true} // Implementation detail
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800/50 cursor-not-allowed rounded-2xl opacity-50"
               >
                 <Shield className="w-8 h-8" />
                 <span className="text-xs font-bold uppercase">Skills (Lvl 10)</span>
               </button>
            </div>
          </div>
        </div>

        {/* Combat Logs */}
        <div className="flex flex-col h-full bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Combat Logs</span>
          </div>
          <div 
            ref={logRef}
            className="flex-1 p-6 overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed"
          >
            {logs.map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-600">[{i+1}]</span>
                <span className={l.includes('attacks') ? 'text-slate-200' : l.includes('Victory') ? 'text-emerald-400 font-bold' : 'text-slate-400 italic'}>
                  {l}
                </span>
              </div>
            ))}
            {battleState === 'VICTORY' && (
              <div className="mt-8 text-center animate-bounce">
                <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-2" />
                <button 
                  onClick={() => setBattleState('IDLE')}
                  className="bg-sky-500 text-white px-8 py-2 rounded-xl font-bold"
                >
                  RETURN
                </button>
              </div>
            )}
            {battleState === 'DEFEAT' && (
              <div className="mt-8 text-center">
                <Skull className="w-16 h-16 text-red-500 mx-auto mb-2" />
                <button 
                  onClick={() => setBattleState('IDLE')}
                  className="bg-slate-700 text-white px-8 py-2 rounded-xl font-bold"
                >
                  RECOVER
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Activity: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default DungeonRoom;
