
import React, { useState } from 'react';
import { JournalEntry, Quest } from '../types';
import { BookOpen, PenTool, Hash, Calendar, Zap, ChevronDown, ChevronUp, History, CheckCircle2, Star, Repeat, Sword } from 'lucide-react';

interface ArchiveProps {
  journal: JournalEntry[];
  setJournal: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  quests: Quest[]; // Ditambahkan untuk menampilkan riwayat misi
  onEntryReward: () => void;
}

const Archive: React.FC<ArchiveProps> = ({ journal, setJournal, quests, onEntryReward }) => {
  const [tab, setTab] = useState<'JOURNAL' | 'QUESTS'>('JOURNAL');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const saveEntry = () => {
    if (!content.trim()) return;
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      date: Date.now(),
      tags: tags.split(',').map(t => t.trim()).filter(t => t)
    };
    setJournal(prev => [newEntry, ...prev]);
    setContent(''); setTags(''); onEntryReward();
  };

  const completedQuests = quests.filter(q => q.completed).sort((a,b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      <div className="border-b border-slate-800 pb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <h1 className="text-5xl font-black system-font tracking-tight text-white uppercase leading-none">Arsip Abadi</h1>
           <p className="text-slate-500 text-[10px] mt-4 font-bold tracking-[0.3em] uppercase italic">Database Evolusi Sang Sovereign</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
           <button onClick={() => setTab('JOURNAL')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'JOURNAL' ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/40' : 'text-slate-500 hover:text-white'}`}>Jurnal</button>
           <button onClick={() => setTab('QUESTS')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'QUESTS' ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/40' : 'text-slate-500 hover:text-white'}`}>Riwayat Misi</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <section className="lg:col-span-2 space-y-12">
          {tab === 'JOURNAL' ? (
            <>
              <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                <h2 className="text-xl font-black system-font flex items-center gap-3 text-white uppercase"><PenTool className="w-6 h-6 text-sky-400" /> Masukkan Rekaman</h2>
                <textarea className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 min-h-[200px] outline-none focus:border-sky-500 transition-all text-slate-300 leading-relaxed text-lg" placeholder="Apa yang Anda pelajari hari ini, Hunter?" value={content} onChange={e => setContent(e.target.value)} />
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Hash className="absolute left-5 top-4 w-4 h-4 text-slate-600" />
                    <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-sky-500 text-sm text-white" placeholder="Tag (misal: Gym, Coding)" value={tags} onChange={e => setTags(e.target.value)} />
                  </div>
                  <button onClick={saveEntry} disabled={!content.trim()} className="bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs flex items-center gap-2"><Zap className="w-4 h-4" /> REKAM</button>
                </div>
              </div>

              <div className="space-y-6">
                {journal.map(entry => {
                  const isExpanded = expandedId === entry.id;
                  const preview = entry.content.length > 120 ? entry.content.slice(0, 120) + '...' : entry.content;
                  
                  return (
                    <div key={entry.id} className="bg-[#0f172a]/40 border border-slate-800 rounded-[2.5rem] p-8 hover:border-sky-500/30 transition-all shadow-xl">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} className="bg-slate-900 p-2 rounded-xl text-slate-500 hover:text-white transition-all shadow-inner border border-slate-800">
                           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className={`text-slate-300 leading-relaxed italic text-lg whitespace-pre-wrap transition-all duration-300`}>
                        "{isExpanded ? entry.content : preview}"
                      </p>
                      {isExpanded && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-slate-800/50">
                          {entry.tags.map(tag => (
                            <span key={tag} className="text-[8px] font-black px-4 py-1.5 bg-slate-950 text-sky-400 rounded-xl uppercase tracking-widest border border-sky-500/10">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-6">
               <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 flex items-center gap-6 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400"><History className="w-8 h-8"/></div>
                  <div>
                     <h2 className="text-2xl font-black system-font text-white uppercase tracking-tight">Riwayat Misi</h2>
                     <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Total {completedQuests.length} misi diselesaikan</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {completedQuests.map(q => (
                    <div key={q.id} className="bg-[#0f172a]/30 border border-slate-800 rounded-2xl p-6 flex items-center justify-between group hover:bg-slate-900/50 transition-all">
                       <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-5 h-5 text-sky-500" />
                          <div>
                             <h4 className="font-black system-font text-slate-200 uppercase text-lg leading-none mb-1">{q.title}</h4>
                             <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{new Date(q.createdAt).toLocaleDateString('id-ID')}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                <span className="text-[8px] font-black uppercase text-sky-400 tracking-widest">RANK {q.rank}</span>
                                {q.isMain && <Star className="w-2.5 h-2.5 text-amber-500" />}
                                {q.isRoutine && <Repeat className="w-2.5 h-2.5 text-purple-500" />}
                             </div>
                          </div>
                       </div>
                       <span className="text-xs font-black text-slate-700 uppercase group-hover:text-slate-500 transition-colors">CLEARED</span>
                    </div>
                  ))}
                  {completedQuests.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-[2.5rem]">
                       <Sword className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                       <p className="text-slate-700 font-black uppercase tracking-[0.2em] text-xs">Belum ada rekam jejak misi</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </section>

        <section className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 h-fit sticky top-24 shadow-2xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Statistik Sovereign</h3>
          <div className="space-y-8">
             <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-xs uppercase">Catatan</span><span className="text-white font-black text-4xl system-font">{journal.length}</span></div>
             <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-xs uppercase">Misi Tuntas</span><span className="text-white font-black text-4xl system-font">{completedQuests.length}</span></div>
             <div className="p-6 bg-slate-950/50 rounded-3xl border border-sky-500/10 italic text-[11px] text-slate-400 leading-loose">
                "Setiap misi yang Anda catat di sini adalah bukti bahwa Anda bukan lagi Hunter Rank E yang lemah. Evolusi tidak pernah berbohong."
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Archive;
