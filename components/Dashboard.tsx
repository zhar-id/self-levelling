
import React from 'react';
import { UserProfile, Quest, QuestType } from '../types';
import { Zap, Flame, Trophy, Coins, CheckCircle2, Circle } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  quests: Quest[];
  onCompleteQuest: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, quests, onCompleteQuest }) => {
  const activeQuests = quests.filter(q => !q.completed).slice(0, 4);
  const completedCount = quests.filter(q => q.completed).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-slate-400 text-sm font-medium">Level {profile.level} Hunter</h2>
                <h1 className="text-3xl font-black text-white system-font tracking-tighter">{profile.name}</h1>
              </div>
              <div className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-xs font-bold border border-sky-500/30">
                {profile.rank}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-bold">EXP PROGRESS</span>
                  <span className="text-sky-400">{profile.exp} / {profile.maxExp}</span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-700 ease-out mana-glow" 
                    style={{ width: `${(profile.exp / profile.maxExp) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Flame className="w-5 h-5"/></div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Health</p>
                    <p className="text-lg font-bold system-font">{profile.hp}/{profile.maxHp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Zap className="w-5 h-5"/></div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Mana</p>
                    <p className="text-lg font-bold system-font">{profile.mana}/{profile.maxMana}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase">Gold Coins</span>
          </div>
          <h3 className="text-4xl font-black text-amber-400 system-font tracking-tight">
            {profile.gold.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">Earned from quests and dungeons</p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase">Quests Cleared</span>
          </div>
          <h3 className="text-4xl font-black text-emerald-400 system-font tracking-tight">
            {completedCount}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">Active rank progress tracked</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Quests */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold system-font flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" /> ACTIVE MISSIONS
            </h2>
            <span className="text-xs text-slate-500">Only showing latest 4</span>
          </div>

          <div className="space-y-3">
            {activeQuests.length > 0 ? activeQuests.map(quest => (
              <div 
                key={quest.id} 
                className="group bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-sky-500/30 transition-all cursor-pointer"
                onClick={() => onCompleteQuest(quest.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-slate-600 group-hover:text-sky-400 transition-colors">
                    <Circle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{quest.title}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-sky-400/80 font-bold uppercase tracking-widest">{quest.type}</span>
                      <span className="text-[10px] text-slate-500 font-bold">EXP +{quest.rewardExp}</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 text-xs font-bold hover:bg-sky-500 hover:text-white transition-all">
                  CLEAR
                </button>
              </div>
            )) : (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-600">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>All missions cleared. Rest up, Hunter.</p>
              </div>
            )}
          </div>
        </section>

        {/* System Logs */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold system-font flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> RECENT LOGS
          </h2>
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/60">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Latest System Notifications</p>
            </div>
            <div className="divide-y divide-slate-800">
              {quests.filter(q => q.completed).slice(0, 5).map(log => (
                <div key={log.id} className="p-3 flex gap-3 items-start">
                  <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-500"><CheckCircle2 className="w-3 h-3"/></div>
                  <div>
                    <p className="text-xs text-slate-300"><span className="text-emerald-400 font-bold">Clear!</span> {log.title}</p>
                    <p className="text-[10px] text-slate-600">{new Date(log.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {quests.filter(q => q.completed).length === 0 && (
                <div className="p-8 text-center text-slate-600 italic text-xs">
                  No system logs available.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
