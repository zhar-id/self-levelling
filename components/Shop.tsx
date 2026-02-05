
import React, { useState } from 'react';
import { UserProfile, Card } from '../types';
import { ShoppingBag, Box, Sparkles, Zap, Flame, Loader2 } from 'lucide-react';

interface ShopProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const Shop: React.FC<ShopProps> = ({ profile, setProfile }) => {
  const [opening, setOpening] = useState(false);
  const [revealedCard, setRevealedCard] = useState<Card | null>(null);

  const CHEST_COST = 50; // 50 coins

  const buyChest = () => {
    if (profile.coins < CHEST_COST) {
      alert("Koin tidak cukup! Hemat uang di Brankas untuk mendapatkan lebih banyak koin.");
      return;
    }

    setOpening(true);
    setProfile(p => ({ ...p, coins: p.coins - CHEST_COST }));

    // Simulate chest opening
    setTimeout(() => {
      const cards: Card[] = [
        { id: crypto.randomUUID(), name: "Shadow Pierce", damage: 120, manaCost: 40, rarity: 'RARE', description: 'Serangan bayangan yang menusuk pertahanan.' },
        { id: crypto.randomUUID(), name: "Igris Call", damage: 300, manaCost: 100, rarity: 'EPIC', description: 'Memanggil ksatria bayangan untuk menyerang.' },
        { id: crypto.randomUUID(), name: "Sovereign Might", damage: 800, manaCost: 250, rarity: 'LEGENDARY', description: 'Kekuatan penuh sang Penguasa.' },
        { id: crypto.randomUUID(), name: "Dark Veil", damage: 45, manaCost: 15, rarity: 'COMMON', description: 'Tabir kegelapan penyesat musuh.' },
      ];

      // Weighted random (mostly common, rarely legendary)
      const rand = Math.random();
      let picked;
      if (rand > 0.98) picked = cards[2];
      else if (rand > 0.85) picked = cards[1];
      else if (rand > 0.5) picked = cards[0];
      else picked = cards[3];

      setRevealedCard(picked);
      setProfile(p => ({ ...p, inventory: [...p.inventory, picked] }));
      setOpening(false);
    }, 1500);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black system-font tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-purple-500 w-10 h-10" /> TOKO SISTEM
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest">Tukarkan koin dari penghematan untuk kartu serangan legendaris.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chest Purchase */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <Box className="w-24 h-24 text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
           <h3 className="text-2xl font-black system-font text-white mb-2">PETI SHADOW MANIFEST</h3>
           <p className="text-xs text-slate-500 mb-8 max-w-xs leading-relaxed">Berisi satu kartu serangan acak. Semakin tinggi kelangkaan, semakin besar MP yang dibutuhkan.</p>
           
           <div className="flex items-center gap-2 mb-8 bg-slate-950 px-6 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Harga:</span>
              <span className="text-amber-500 font-black text-xl">{CHEST_COST} KOIN</span>
           </div>

           <button 
             onClick={buyChest}
             disabled={opening || profile.coins < CHEST_COST}
             className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-900/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
           >
             {opening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
             {opening ? "MEMBUKA PETI..." : "BELI SEKARANG"}
           </button>
        </div>

        {/* Revealed Card / Info */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-[2.5rem] min-h-[300px]">
           {revealedCard ? (
             <div className="animate-in zoom-in duration-500 flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4">ITEM TERDAFTAR!</p>
                <div className="w-48 p-6 rounded-3xl bg-slate-900 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] mb-6">
                   <p className="text-purple-400 text-[8px] font-black uppercase mb-1 tracking-widest">{revealedCard.rarity}</p>
                   <h4 className="text-xl font-black system-font text-white mb-4">{revealedCard.name}</h4>
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col items-center">
                         <Zap className="w-4 h-4 text-sky-400 mb-1" />
                         <span className="text-xs font-bold text-sky-400">{revealedCard.manaCost}</span>
                      </div>
                      <div className="flex flex-col items-center">
                         <Flame className="w-4 h-4 text-red-500 mb-1" />
                         <span className="text-xs font-bold text-red-500">+{revealedCard.damage}</span>
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-500 italic leading-relaxed">"{revealedCard.description}"</p>
                </div>
                <button onClick={() => setRevealedCard(null)} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Tutup Pratinjau</button>
             </div>
           ) : (
             <div className="text-center">
                <Box className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-700 font-black uppercase tracking-widest text-xs">Buka peti untuk melihat konten</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
