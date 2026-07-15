import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Supergraphic } from './Supergraphic';
import { Menu, X } from 'lucide-react';
import { useAdmin } from '../lib/AdminContext';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Milestones', href: '#milestones' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Team', href: '#key-people' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'About', href: '#about' },
];



export function Header() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { content } = useAdmin();
  useEffect(() => {
    const THRESHOLD = 120; // px from top of viewport (accounts for navbar height)
    const sectionIds = ['services', 'milestones', 'why-us', 'key-people', 'workflow', 'about'];

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      // Find the last section whose top edge has passed the threshold
      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const { top } = el.getBoundingClientRect();
          if (top <= THRESHOLD) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/5 overflow-hidden ${
          scrolled 
            ? 'py-2 bg-[#0a0a0f]/50 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]' 
            : 'py-4 bg-transparent'
        }`}
      >

        <div className="w-full px-8 md:px-12 flex justify-between items-center text-white relative z-10">
          
          {/* Left Side: Logo + Nav */}
          <div className="flex items-center gap-8 md:gap-12">
            {/* Logo */}
            <a href="#" className="group relative flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 md:w-10 md:h-10 relative"
              >
                <Logo className="w-full h-full text-brand transition-all duration-500 group-hover:drop-shadow-[0_0_15px_var(--color-brand)]" />
              </motion.div>
              {/* Optional text or vertical divider to mimic Riot|Valorant */}
              <div className="w-[1px] h-6 bg-white/20 hidden md:block" />
              <span className="font-display font-bold tracking-[0.2em] uppercase text-sm hidden md:block text-brand transition-colors duration-300">
                VIRASHELLE
              </span>
            </a>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 relative py-2 text-[11px] uppercase tracking-[0.15em] font-display font-bold transition-all duration-300 group ${
                    activeSection === item.href.slice(1) 
                      ? 'text-brand' 
                      : 'text-zinc-400 hover:text-brand'
                  }`}
                >
                  {item.label}
                  <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                  
                  {/* Underline on hover/active */}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-brand transition-all duration-300 ${
                    activeSection === item.href.slice(1) 
                      ? 'w-full' 
                      : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              ))}
            </nav>
          </div>

          {/* Right Side: Colors / CTA */}
          <div className="hidden md:flex items-center gap-6">
            {/* Contact CTA */}
            <a 
              href="https://wa.me/6285173339084" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2 bg-brand hover:brightness-110 text-white font-display font-bold text-[11px] tracking-[0.1em] uppercase rounded-sm transition-all duration-300 shadow-[0_0_15px_var(--color-brand)] opacity-90 hover:opacity-100"
            >
              Contact Us
            </a>
          </div>
          
          {/* Mobile Menu Toggle */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden text-white relative z-50 w-10 h-10 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-2">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl font-display font-bold tracking-tight text-white hover:text-brand transition-colors py-3"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
            
            <motion.a
              href="https://wa.me/6285173339084"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: navItems.length * 0.08 + 0.1 }}
              className="mt-8 px-8 py-3 bg-brand hover:brightness-110 text-white font-display font-bold text-sm tracking-[0.1em] uppercase rounded-sm shadow-[0_0_20px_var(--color-brand)]"
            >
              Contact Us
            </motion.a>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-zinc-500 text-xs tracking-widest uppercase font-ui"
            >
              {content.header?.established || "EST. 2024"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
