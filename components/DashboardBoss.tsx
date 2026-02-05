
import React, { useEffect, useState, useCallback } from 'react';
import { UserProfile, QuestRank, CurrentBoss, Stats } from '../types';
import { Skull, Loader2, User, Flame, Zap, ShieldAlert, Activity, Clock, Sword, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardBossProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const DashboardBoss: React.FC<DashboardBossProps> = ({ profile, setProfile }) => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextMonday = new Date();
      nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);
      if (nextMonday <= now) nextMonday.setDate(nextMonday.getDate() + 7);
      
      const diff = nextMonday.getTime() - now.getTime();
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${d}h ${h}j ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateBoss = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Hasilkan JSON nama bos fantasi dan deskripsi singkat menyeramkan untuk Hunter Rank ${profile.rank} (Solo Leveling). Harus dalam Bahasa Indonesia. JSON: {name, description}`;
      
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(res.text);
      
      const imgRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Cinema style dark fantasy boss monster named ${data.name}, Solo Leveling manhwa style, purple shadows, high detail.`,
      });

      let imageUrl = "";
      const parts = imgRes.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      const hpMap: Record<QuestRank, number> = {
        [QuestRank.E]: 1000, [QuestRank.D]: 3000, [QuestRank.C]: 10000,
        [QuestRank.B]: 40000, [QuestRank.A]: 120000, [QuestRank.S]: 500000,
      };

      const newBoss: CurrentBoss = {
        id: crypto.randomUUID(),
        name: data.name,
        image: imageUrl,
        hp: hpMap[profile.rank],
        maxHp: hpMap[profile.rank],
        rank: profile.rank,
        defeated: false,
        createdAt: Date.now()
      };

      setProfile(prev => ({ ...prev, currentBoss: newBoss }));
    } catch (e) {
      console.error("Boss Manifestation Error:", e);
    } finally {
      setLoading(false);
    }
  }, [profile.rank, loading, setProfile]);

  useEffect(() => {
    if (!profile.currentBoss || profile.currentBoss.defeated) {
      const timeout = setTimeout(() => {
        generateBoss();
      }, profile.currentBoss?.defeated ? 5000 : 0);
      return () => clearTimeout(timeout);
    }
  }, [profile.currentBoss, generateBoss]);

  const hpPercent = profile.currentBoss ? (profile.currentBoss.hp / profile.currentBoss.maxHp) * 100 : 0;
  const expPercent = (profile.exp / profile.maxExp) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <aside className="lg:col-span-3">
        <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] p-6 h-full flex flex-col shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 inset-x-0 h-1 shadow-[0_0_10px_#0ea5e9] ${profile.hasPenalty ? 'bg-red-500 shadow-red-500/50' : 'bg-sky-500'}`}></div>
          
          <div className="flex flex-col items-center gap-4 mb-6 pt-4">
             <div className={`w-24 h-24 rounded-full bg-slate-800 border-4 flex items-center justify-center relative ${profile.hasPenalty ? 'border-red-500' : 'border-slate-700'}`}>
                {profile.hasPenalty ? <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" /> : <User className="w-12 h-12 text-slate-500" />}
                <div className={`absolute -bottom-1 -right-1 text-white text-[10px] font-black px-2 py-1 rounded-lg border-2 border-slate-900 ${profile.hasPenalty ? 'bg-red-600' : 'bg-sky-500'}`}>{profile.rank}</div>
             </div>
             <div className="text-center w-full">
                <h3 className="font-black system-font text-white text-xl uppercase tracking-tighter truncate mx-auto max-w-[180px]">{profile.name}</h3>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Lvl {profile.level} Hunter Candidate</p>
                
                <div className="mt-4 w-full">
                   <div className="flex justify-between text-[8px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                      <span>EXP Progress</span>
                      <span>{Math.floor(expPercent)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden">
                      <div className="h-full bg-sky-500 shadow-[0_0_8px_#0ea5e9] transition-all duration-700" style={{ width: `${expPercent}%` }}></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 border-t border-slate-800/50 pt-6">
             <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <StatMini label="STRENGTH" value={profile.stats.strength} color="text-red-500" hasPenalty={profile.hasPenalty} />
                <StatMini label="VITALITY" value={profile.stats.vitality} color="text-emerald-500" hasPenalty={profile.hasPenalty} />
                <StatMini label="AGILITY" value={profile.stats.agility} color="text-amber-500" hasPenalty={profile.hasPenalty} />
                <StatMini label="INTELLIGENCE" value={profile.stats.intelligence} color="text-sky-500" hasPenalty={profile.hasPenalty} />
             </div>
          </div>

          <div className="mt-8 p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
             <div className="flex items-center gap-2 mb-2 text-sky-500">
                <Clock className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Reset Gerbang</span>
             </div>
             <p className="text-base font-black system-font text-white">{countdown}</p>
          </div>
          
          {profile.hasPenalty && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
               <p className="text-[9px] font-black text-red-500 uppercase flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Status: Debt (Hutang)
               </p>
               <p className="text-[8px] text-red-400/80 mt-1 italic">Damage -50%, EXP -30%</p>
            </div>
          )}
        </div>
      </aside>

      <div className="lg:col-span-9 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-sky-600/10 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 md:p-12 overflow-hidden h-full flex flex-col justify-center min-h-[500px]">
          
          {loading && !profile.currentBoss ? (
            <div className="w-full flex flex-col items-center justify-center gap-6">
              <Loader2 className="w-16 h-16 animate-spin text-sky-400" />
              <p className="font-black uppercase tracking-[0.3em] system-font text-sky-400 text-lg animate-pulse">MEMBUKA GERBANG DUNIA...</p>
            </div>
          ) : profile.currentBoss ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-7 space-y-8 z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-1.5 bg-red-500/20 text-red-500 text-[10px] font-black tracking-[0.2em] uppercase border border-red-500/30 rounded-full">
                    BOSS RANK {profile.currentBoss.rank}
                  </span>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-800 px-3 py-1.5 rounded-full">
                    {profile.currentBoss.defeated ? "DEFEATED" : "STATUS: AKTIF"}
                  </span>
                </div>
                
                <h2 className="text-5xl md:text-8xl font-black system-font text-white mb-8 tracking-tighter leading-none uppercase">
                  {profile.currentBoss.defeated ? "CLEARED" : profile.currentBoss.name}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex items-center gap-2">
                        <Skull className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Vitalitas Bos</span>
                      </div>
                      <span className={`text-2xl font-black system-font ${profile.currentBoss.defeated ? 'text-sky-400' : 'text-red-500'}`}>
                        {profile.currentBoss.hp.toLocaleString()} / {profile.currentBoss.maxHp.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-8 bg-slate-950 rounded-full border border-slate-800 p-1.5 shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full relative ${profile.currentBoss.defeated ? 'bg-sky-500 shadow-[0_0_20px_#0ea5e9]' : 'bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_20px_#dc2626]'}`}
                        style={{ width: `${hpPercent}%` }}
                      >
                         <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/50">
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                      "Kalahkan Boss ini dengan menyelesaikan misi-misi nyata Anda! Berhematlah agar damage Anda tidak terpotong karena status boros."
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 relative flex justify-center">
                 <div className="w-full aspect-square max-w-sm relative rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-2xl bg-slate-950 group/img">
                   {profile.currentBoss.image ? (
                     <img src={profile.currentBoss.image} alt="Boss" className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-1000 scale-105 group-hover/img:scale-100" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center"><Skull className="w-16 h-16 opacity-5" /></div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                 </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const StatMini = ({ label, value, color, hasPenalty }: { label: string, value: number, color: string, hasPenalty: boolean }) => (
  <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-1">
      <span className={`text-sm font-black system-font ${hasPenalty ? 'text-red-400' : color}`}>{value}</span>
    </div>
  </div>
);

export default DashboardBoss;
