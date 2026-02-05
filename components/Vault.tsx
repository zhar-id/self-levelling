
import React, { useState } from 'react';
import { Transaction, UserProfile } from '../types';
import { Wallet, TrendingDown, ArrowDownCircle, Settings, Tag, CalendarDays, ChevronLeft, ChevronRight, AlertCircle, Download, Upload } from 'lucide-react';

interface VaultProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  transactions: Transaction[];
  onExpense: (amount: number, note: string, category: string) => boolean;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CATEGORIES = ["Makanan", "Transportasi", "Kesehatan", "Hobi/Hiburan", "Pendidikan", "Kebutuhan Pokok", "Lainnya"];

const Vault: React.FC<VaultProps> = ({ profile, setProfile, transactions, onExpense, onExport, onImport }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const viewDateStr = viewDate.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const isViewingToday = viewDateStr === todayStr;

  const standardDaily = Math.floor(profile.monthlyIncome / 30);
  const limitToday = standardDaily + profile.dailySavingsBalance;
  
  const spentOnViewDate = transactions
    .filter(t => t.dateString === viewDateStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingToday = limitToday - spentOnViewDate;
  
  // Perhitungan Sisa Uang Total Bulan Ini
  const remainingMonthTotal = profile.monthlyIncome - profile.totalSpentThisMonth;

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!amount || isNaN(val) || val <= 0) return;

    onExpense(val, note, category);
    setAmount(''); setNote('');
  };

  const changeDate = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + offset);
    setViewDate(newDate);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black system-font tracking-tight flex items-center gap-3 uppercase">
            <Wallet className="text-amber-500 w-10 h-10" /> Brankas Sovereign
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-[0.2em] italic">Manajemen Sumber Daya Hunter</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all shadow-lg"><Settings className="w-6 h-6" /></button>
      </div>

      {showSettings && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 space-y-8">
          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Atur Anggaran Bulanan (IDR)</label>
             <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-bold">Rp</span>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-sky-500 text-white font-black text-xl shadow-inner" value={profile.monthlyIncome} onChange={e => setProfile(p => ({ ...p, monthlyIncome: Number(e.target.value) }))} />
               </div>
               <button onClick={() => setShowSettings(false)} className="bg-sky-500 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">SIMPAN</button>
             </div>
          </div>

          <div className="pt-8 border-t border-slate-800">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transfer Jiwa (Backup & Restore)</label>
             <div className="flex gap-4">
                <button onClick={onExport} className="flex-1 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all">
                   <Download className="w-4 h-4" /> Ekspor Data
                </button>
                <label className="flex-1 bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:text-sky-400 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all">
                   <Upload className="w-4 h-4" /> Impor Data
                   <input type="file" className="hidden" accept=".json" onChange={onImport} />
                </label>
             </div>
             <p className="text-[10px] text-slate-600 mt-3 italic">Gunakan fitur ini untuk memindahkan data dari Laptop ke HP atau sebaliknya (karena Vercel tidak menyimpan data antar perangkat).</p>
          </div>
        </div>
      )}

      {/* Navigasi Tanggal HUD */}
      <div className="flex items-center justify-center gap-6 py-4 bg-slate-900/30 rounded-3xl border border-slate-800">
         <button onClick={() => changeDate(-1)} className="p-2 text-slate-500 hover:text-sky-400 transition-colors"><ChevronLeft className="w-8 h-8"/></button>
         <div className="text-center min-w-[200px]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{viewDate.toLocaleDateString('id-ID', { weekday: 'long' })}</p>
            <h3 className="text-xl font-black system-font text-white">{viewDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
         </div>
         <button onClick={() => changeDate(1)} className={`p-2 transition-colors ${isViewingToday ? 'opacity-0 cursor-default' : 'text-slate-500 hover:text-sky-400'}`} disabled={isViewingToday}><ChevronRight className="w-8 h-8"/></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet className="w-48 h-48 text-emerald-500" /></div>
            
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <CalendarDays className="w-3 h-3"/> {isViewingToday ? 'Sisa Jatah Hari Ini' : 'Sisa Jatah Tanggal Ini'}
                </p>
                <h3 className={`text-4xl md:text-5xl font-black system-font tracking-tighter ${remainingToday < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                  Rp {remainingToday.toLocaleString('id-ID')}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-800/50">
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Sisa Uang (Bulan)</p>
                  <p className={`text-lg font-black ${remainingMonthTotal < 0 ? 'text-red-500' : 'text-white'}`}>
                    Rp {remainingMonthTotal.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Terpakai (Hari Ini)</p>
                  <p className="text-lg font-black text-slate-400">Rp {spentOnViewDate.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {isViewingToday && profile.dailySavingsBalance !== 0 && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${profile.dailySavingsBalance > 0 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                   {profile.dailySavingsBalance > 0 ? <TrendingDown className="w-4 h-4 rotate-180" /> : <AlertCircle className="w-4 h-4" />}
                   <span>Carryover: {profile.dailySavingsBalance > 0 ? '+' : ''}Rp {profile.dailySavingsBalance.toLocaleString('id-ID')} dari hari sebelumnya.</span>
                </div>
              )}
            </div>
          </div>

          {isViewingToday && (
            <div className="bg-[#0f172a]/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Input Pengeluaran Hari Ini</h4>
              <form onSubmit={handleLog} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-5 top-4 text-slate-500 font-bold">Rp</span>
                  <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-red-500 text-white font-black text-xl shadow-inner" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                   <select className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-400 outline-none shadow-inner appearance-none" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <input className="flex-[2] bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3.5 text-xs text-slate-300 outline-none shadow-inner" placeholder="Catatan/Keterangan..." value={note} onChange={e => setNote(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                  <ArrowDownCircle className="w-5 h-5" /> CATAT PENGELUARAN
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-[#0f172a]/30 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-8 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aliran Dana Tanggal Terpilih</h4>
             <Tag className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30 max-h-[500px]">
            {transactions.filter(t => t.dateString === viewDateStr).length > 0 ? (
              transactions.filter(t => t.dateString === viewDateStr).map(t => (
                <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-800/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/10"><TrendingDown className="w-5 h-5"/></div>
                    <div>
                      <p className="text-lg font-black text-white system-font truncate max-w-[200px]">{t.note || 'Pengeluaran'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] text-slate-500 font-black uppercase">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[8px] bg-slate-800 px-2 py-0.5 rounded text-sky-400 font-bold uppercase tracking-tighter border border-sky-500/10">{t.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xl font-black system-font text-red-400">-Rp {t.amount.toLocaleString('id-ID')}</span>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em]">Tidak ada transaksi pada tanggal ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
