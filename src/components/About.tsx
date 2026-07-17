import React from 'react';
import { motion } from 'motion/react';
import { EditableText } from './EditableText';

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center w-full">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light">
              <span className="w-8 h-[1px] bg-brand-light" />
              Who We Are
              <span className="w-8 h-[1px] bg-brand-light" />
            </span>
          </motion.div>

          {/* Title with animated border */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative pb-6 mb-12 inline-block"
          >
            <EditableText 
              contentKey="about" 
              field="title" 
              as="h2" 
              className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]" 
            />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-brand to-brand-light origin-center rounded-full"
            />
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <EditableText 
              contentKey="about" 
              field="content" 
              as="div" 
              className="text-xl md:text-2xl lg:text-3xl font-body font-light leading-relaxed whitespace-pre-wrap text-zinc-300 space-y-8" 
              multiline 
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-5 flex items-start"
          >
            <div className="relative pl-6 border-l-2 border-brand/40">
              <div className="absolute left-0 top-0 w-[2px] h-8 bg-brand rounded-full" />
              <p className="text-lg md:text-xl text-zinc-400 font-accent italic leading-relaxed">
                Combining <span className="text-brand-light font-semibold not-italic">Cutting-Edge Visual Technology</span> with <span className="text-brand-light font-semibold not-italic">Compelling Storytelling</span>, we transform complex ideas into stunning, dynamic, and market-relevant <span className="text-brand-light font-semibold not-italic">Visual Masterpieces</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
