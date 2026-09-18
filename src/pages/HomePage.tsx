import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Services } from '../components/Services';
import { WhyUs } from '../components/WhyUs';
import { Workflow } from '../components/Workflow';
import { Milestone } from '../components/Milestone';
import { KeyPeople } from '../components/KeyPeople';
import { Clients } from '../components/Clients';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAdmin } from '../lib/AdminContext';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalBackground } from '../components/GlobalBackground';

function Preloader({ onComplete }: { key?: string; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 850;
    const start = Date.now();
    let lastReported = 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      // Smooth cubic ease
      const eased = 1 - Math.pow(1 - p, 3);
      const currentPct = Math.round(eased * 100);

      // Throttle React renders: update only when changed by >= 3% or finished
      if (currentPct - lastReported >= 3 || currentPct === 100) {
        lastReported = currentPct;
        setProgress(currentPct);
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 160);
      }
    };

    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Logo className="w-16 h-16 text-brand mb-8" />
      </motion.div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="mt-4 text-[11px] font-mono text-zinc-500 tracking-widest">
        {progress}%
      </span>
    </motion.div>
  );
}

export function HomePage() {
  const { user } = useAdmin();
  const [loading, setLoading] = useState(true);

  return (
    <div className="text-white min-h-screen font-body selection:bg-brand selection:text-white">
      <GlobalBackground />

      {/* Preloader overlay */}
      <AnimatePresence>
        {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Main page content is mounted immediately under the preloader, 
          allowing the browser to parse and composite before the preloader fades out.
          This eliminates the sudden freeze / mount storm. */}
      <Header />
      <main>
        <Hero />
        {/* Client logos — social proof */}
        <Clients />
        {/* Services + portfolio examples */}
        <Services />
        {/* Differentiator */}
        <WhyUs />
        {/* Social proof numbers */}
        <Milestone />
        {/* Process */}
        <Workflow />
        {/* Story */}
        <About />
        {/* Team — last section */}
        <KeyPeople />
      </main>
      <Footer />
      
      {/* Floating Login/Admin Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link 
          to="/admin/login"
          className="group relative inline-flex items-center justify-center w-10 h-10 glass rounded-full text-zinc-500 hover:text-brand-light hover:border-brand/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(75,210,0,0.2)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span className="absolute right-full mr-3 px-3 py-1.5 glass rounded-lg text-[10px] font-ui uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Login
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
