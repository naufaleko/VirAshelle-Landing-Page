import React from 'react';
import { useAdmin } from '../lib/AdminContext';
import { motion } from 'motion/react';

export function Workflow() {
  const { content } = useAdmin();
  const workflowData = content.workflow;
  const steps = workflowData?.items || [];

  return (
    <section id="workflow" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ── Section Header ── */}
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

        <div className="flex items-end justify-between mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
          >
            {workflowData?.title || 'Our Workflow'}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:block w-32 h-[2px] bg-gradient-to-r from-brand to-transparent origin-left mb-3"
          />
        </div>

        {/* ── Horizontal Timeline ── */}
        <div className="relative">

          {/* Horizontal connector line */}
          <div className="absolute top-[52px] left-0 right-0 h-px hidden md:block overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full bg-gradient-to-r from-transparent via-brand/50 to-transparent origin-left"
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col items-center md:items-start text-center md:text-left"
              >
                {/* Step number node */}
                <div className="relative mb-6 z-10">
                  {/* Outer ring */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.15, type: 'spring', stiffness: 200 }}
                    className="w-[104px] h-[104px] rounded-full border border-brand/20 absolute -top-4 -left-4 group-hover:border-brand/40 transition-colors duration-500"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />

                  {/* Number badge */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="relative w-[72px] h-[72px] rounded-full bg-surface-card border-2 border-brand/30 group-hover:border-brand group-hover:shadow-[0_0_30px_rgba(125,57,235,0.35)] flex items-center justify-center transition-all duration-500 z-10"
                  >
                    <span className="font-display font-bold text-2xl text-white group-hover:text-brand-light transition-colors duration-300">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Glow dot behind badge */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>

                {/* Content card */}
                <div className="glass rounded-2xl p-6 w-full group-hover:border-brand/30 transition-all duration-500 relative overflow-hidden">
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-brand/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                  {/* Ghost number */}
                  <div className="absolute -bottom-2 -right-2 text-[72px] font-display font-bold text-white/[0.025] leading-none pointer-events-none select-none">
                    {step.number}
                  </div>

                  <div className="relative z-10">
                    {/* Step label */}
                    <span className="text-[9px] uppercase tracking-[0.3em] font-ui text-brand-light/70 mb-3 block">
                      Step {step.number}
                    </span>

                    <h3 className="text-base md:text-lg font-display font-bold mb-3 text-white group-hover:text-brand-light transition-colors duration-300 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-zinc-500 font-body text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                </div>

                {/* Arrow connector (between cards, hidden on last) */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
                    className="hidden md:flex absolute top-9 -right-3 z-20 items-center"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <motion.path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="#7d39eb"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 0.6 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 flex items-center gap-4"
          >
            <div className="w-8 h-[1px] bg-brand/40" />
            <p className="text-zinc-600 text-xs font-ui uppercase tracking-widest">
              From brief to delivery — every step, on purpose.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
