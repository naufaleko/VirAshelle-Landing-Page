import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu } from 'lucide-react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';

export function Header() {
  const [activeSection, setActiveSection] = useState<string>('');
  const { content } = useAdmin();


  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'services', 'workflow', 'work', 'team'];
      let current = '';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            current = section;
          }
        }
      }
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLinkClass = (section: string) => {
    return activeSection === section 
      ? 'border-b border-[#7d39eb] opacity-100 transition-opacity' 
      : 'opacity-50 hover:opacity-100 transition-opacity border-b border-transparent';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-white/5 overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center mix-blend-screen overflow-hidden">
        <Supergraphic className="w-[100vw] text-[#7d39eb] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white relative z-10">
        <a href="#" className="flex items-center gap-2 group w-10 h-10 md:w-12 md:h-12">
          <Logo className="w-full text-[#7d39eb] transition-transform duration-500 group-hover:scale-110" />
        </a>
        
        <nav className="hidden md:flex space-x-12 text-[10px] uppercase tracking-widest font-semibold">
          <a href="#about" className={getLinkClass('about')}>About</a>
          <a href="#services" className={getLinkClass('services')}>Services</a>
          <a href="#workflow" className={getLinkClass('workflow')}>Workflow</a>
          <a href="#work" className={getLinkClass('work')}>Portfolio</a>
          <a href="#team" className={getLinkClass('team')}>Team</a>
        </nav>

        <div className="hidden md:block px-4 py-1.5 border border-white/20 rounded-full text-[10px] tracking-tighter">
          {content.header?.established || "EST. 2024"}
        </div>
        
        <button className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
