import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Supergraphic } from './Supergraphic';
import { EditableText } from './EditableText';
import { ArrowDown } from 'lucide-react';
import { useIsMobile } from '../lib/useIsMobile';

// FloatingOrb removed as it is handled globally now

export function Hero() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Disable parallax on mobile — scroll transforms cause jank on phones
  const bgY = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '0%'] : ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '0%'] : ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      id="hero" 
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-transparent text-white"
    >
      {/* ── Content ── */}
      <motion.div 
        className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-32 pb-32 md:pt-40 md:pb-40"
        style={{ y: textY, opacity }}
      >
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light">
            <span className="w-8 h-[1px] bg-brand-light" />
            Creative Studio
          </span>
        </motion.div>

        {/* Main Heading — animated line by line */}
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <EditableText 
              contentKey="hero" 
              field="title" 
              as="h1" 
              className="text-[clamp(3rem,8vw,8rem)] font-display font-bold tracking-[-0.04em] leading-[0.9]" 
              multiline 
            />
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="mt-8 max-w-md"
        >
          <EditableText 
            contentKey="hero" 
            field="subtitle" 
            as="p" 
            className="text-sm md:text-base text-zinc-400 font-body font-light leading-relaxed" 
            multiline 
          />
        </motion.div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          className="mt-12 flex items-center gap-6"
        >
          <motion.a 
            href="https://wa.me/6285173339084" 
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-brand rounded-full text-sm font-display font-semibold tracking-wide text-white overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(125,57,235,0.4)]"
          >
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10">
              <EditableText 
                contentKey="hero" 
                field="buttonText" 
                as="span" 
                className="text-sm font-semibold" 
              />
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
          </motion.a>
        </motion.div>
      </motion.div>
      
      {/* ── Scroll Indicator ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-ui text-zinc-500">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} className="text-zinc-500" />
        </motion.div>
      </motion.div>

    </section>
  );
}
