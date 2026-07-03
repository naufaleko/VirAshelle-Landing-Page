import React from 'react';
import { motion } from 'motion/react';
import { Supergraphic } from './Supergraphic';
import { EditableText } from './EditableText';

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-transparent text-white">
      {/* Background abstract supergraphic */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none flex items-center justify-center">
        <Supergraphic className="w-[150vw] md:w-[120vw] max-w-none text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-val-pan" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid md:grid-cols-12 gap-8 items-center h-full">
        <div className="md:col-span-12 mt-auto pb-32">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <EditableText 
              contentKey="hero" 
              field="title" 
              as="h1" 
              className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter leading-[0.9]" 
              multiline 
            />
            
            <EditableText 
              contentKey="hero" 
              field="subtitle" 
              as="p" 
              className="mt-6 text-sm text-gray-400 max-w-sm font-light leading-relaxed" 
              multiline 
            />
            
            <div className="flex items-center space-x-4 pt-8">
              <a 
                href="#work" 
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:bg-[#7d39eb] hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </a>
              <EditableText 
                contentKey="hero" 
                field="buttonText" 
                as="span" 
                className="text-[11px] uppercase tracking-[0.3em] font-bold" 
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500"
      >
        <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
        <div className="w-[1px] h-12 bg-zinc-800 overflow-hidden relative">
          <motion.div 
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-zinc-300 absolute top-0 left-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
