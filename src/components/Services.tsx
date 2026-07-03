import React from 'react';
import { motion } from 'motion/react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';

export function Services() {
  const { content } = useAdmin();
  const servicesData = content.services;

  const icons = ['🎬', '✨', '🧊', '🎨'];

  return (
    <section id="services" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6 block"
            >
              <span className="w-8 h-[1px] bg-brand-light" />
              {servicesData.description}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
            >
              {servicesData.title}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:block w-32 h-[2px] bg-gradient-to-r from-brand to-transparent mb-3"
          />
        </div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {servicesData.items.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative glass rounded-2xl p-8 md:p-10 overflow-hidden cursor-default hover:border-brand/30 transition-all duration-500"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand/8 via-transparent to-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Ghost number */}
              <div className="absolute top-4 right-6 text-[120px] font-display font-bold text-white/[0.02] group-hover:text-brand/[0.05] leading-none transition-all duration-700 pointer-events-none select-none">
                0{index + 1}
              </div>
              
              <div className="relative z-10">
                {/* Icon + label row */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-xl group-hover:bg-brand/20 group-hover:border-brand/40 group-hover:shadow-[0_0_20px_rgba(125,57,235,0.2)] transition-all duration-500">
                    {icons[index] || '✦'}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-ui text-zinc-500 group-hover:text-brand-light transition-colors duration-300">
                    Service 0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-display font-bold tracking-tight mb-4 text-white group-hover:text-gradient transition-all duration-300">
                  {service.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed font-body text-[15px]">
                  {service.desc}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
