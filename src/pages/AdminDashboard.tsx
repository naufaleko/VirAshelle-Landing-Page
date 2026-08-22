import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const financeUrl = import.meta.env.VITE_FINANCE_APP_URL || 'http://localhost:3000';

  useEffect(() => {
    // 1-Pintu Redirect: Langsung redirect di tab yang sama ke halaman login portal
    window.location.href = `${financeUrl}/login?callbackUrl=%2Fcms`;
  }, [financeUrl]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border-[1px] border-[#7d39eb]/30 blur-3xl animate-spin-slow" style={{ animationDuration: '40s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md relative z-10 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-[#7d39eb]/20 rounded-2xl mx-auto flex items-center justify-center border border-[#7d39eb]/50 shadow-[0_0_20px_rgba(125,57,235,0.3)]">
          <LayoutDashboard className="text-[#7d39eb]" size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">VirAshelle Portal</h2>
          <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
            Mengarahkan ke Portal Terpadu 1 Pintu (WebAcc & CMS)...
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#7d39eb] font-mono">
          <div className="w-4 h-4 border-2 border-[#7d39eb]/30 border-t-[#7d39eb] rounded-full animate-spin" />
          <span>Membuka {financeUrl}/cms</span>
        </div>

        <div className="pt-2 space-y-3">
          <a
            href={`${financeUrl}/cms`}
            className="inline-flex items-center justify-center gap-2 w-full bg-[#7d39eb] hover:bg-[#6c2bd9] text-white px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(125,57,235,0.4)] transition-all hover:scale-[1.02] active:scale-95"
          >
            Buka Sekarang <ArrowUpRight size={16} />
          </a>

          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors pt-2"
          >
            <ArrowLeft size={14} /> Kembali ke Website
          </button>
        </div>
      </motion.div>
    </div>
  );
}
