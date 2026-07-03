import React from 'react';
import { Supergraphic } from './Supergraphic';
import { Logo } from './Logo';
import { useAdmin } from '../lib/AdminContext';
import { motion } from 'motion/react';

export function Workflow() {
  const { content } = useAdmin();
  const workflowData = content.workflow;

  return (
    <section id="workflow" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6 block"
        >
          <span className="w-8 h-[1px] bg-brand-light" />
          Process
        </motion.span>

        <div className="flex items-end justify-between mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
          >
            {workflowData?.title || "Our Workflow"}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:block w-32 h-[2px] bg-gradient-to-r from-brand to-transparent origin-left mb-3"
          />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 lg:gap-24">
          {/* Timeline Steps */}
          <div className="relative">
            {/* Animated vertical connector line */}
            <div className="absolute left-[31px] top-10 bottom-10 w-px bg-white/5 hidden sm:block">
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full bg-gradient-to-b from-brand via-brand-light/50 to-transparent origin-top"
              />
            </div>

            <div className="space-y-4">
              {workflowData?.items?.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex gap-6 sm:gap-8 items-start glass rounded-2xl p-6 md:p-8 hover:border-brand/30 transition-all duration-500"
                >
                  {/* Step number */}
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: -3 }}
                    className="relative shrink-0 z-10"
                  >
                    <div className="bg-surface-raised border-2 border-brand/30 group-hover:border-brand text-white font-display font-bold text-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(125,57,235,0.3)]">
                      {step.number}
                    </div>
                  </motion.div>

                  <div className="pt-1 sm:pt-2 flex-1">
                    <h3 className="text-lg sm:text-xl font-display font-bold mb-2 text-white group-hover:text-brand-light transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-zinc-400 font-body font-light leading-relaxed text-sm sm:text-[15px]">
                      {step.desc}
                    </p>
                  </div>

                  {/* Hover accent */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Visual side panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden xl:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-square">
              {/* Breathing gradient glow */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-brand/15 to-transparent rounded-full blur-3xl"
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Logo breathing */}
              <motion.div
                className="w-full h-full flex items-center justify-center"
                animate={{ scale: [1, 1.04, 0.98, 1.02, 1], opacity: [0.04, 0.07, 0.03, 0.06, 0.04] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Logo className="w-3/4 text-white" />
              </motion.div>
              
              {/* Concentric rings */}
              {[10, 20, 32].map((inset, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-brand/10"
                  style={{ inset: `${inset * 4}px` }}
                  animate={{ 
                    scale: [1, 1 + (i * 0.02 + 0.03), 1 - (i * 0.01 + 0.02), 1],
                    opacity: [0.1, 0.25, 0.08, 0.1],
                  }}
                  transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                />
              ))}
              
              {/* Center pulse dot */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand rounded-full"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(125,57,235,0.4), 0 0 60px rgba(125,57,235,0.1)',
                    '0 0 40px rgba(125,57,235,0.8), 0 0 80px rgba(125,57,235,0.3)',
                    '0 0 20px rgba(125,57,235,0.4), 0 0 60px rgba(125,57,235,0.1)',
                  ],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
