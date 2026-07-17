import React from 'react';
import { motion } from 'motion/react';
import { useAdmin } from '../lib/AdminContext';
import { Building2 } from 'lucide-react';

export function Clients() {
  const { content } = useAdmin();
  const clientsData = content.clients;
  const clientList = (clientsData?.items || []).map((item: any) =>
    typeof item === 'string' ? { name: item, logoUrl: '' } : item
  );

  // Duplicate the list for seamless marquee loop
  const marqueeItems = [...clientList, ...clientList];

  return (
    <section id="clients" className="relative py-20 md:py-28 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-12 flex flex-col items-center text-center">
        {/* Section header */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6 block"
        >
          <span className="w-8 h-[1px] bg-brand-light" />
          Trusted By
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em] mb-4"
        >
          {clientsData?.title || "Our Clients"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 font-body text-sm max-w-lg"
        >
          {clientsData?.subtitle || clientsData?.description || "These are the brands that have been collaborated with our company!"}
        </motion.p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-raised to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-raised to-transparent z-10 pointer-events-none" />

        {/* First marquee row */}
        <div className="overflow-hidden py-4">
          <motion.div 
            className="flex gap-6 w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeItems.map((client: { name: string; logoUrl: string }, i: number) => (
              <div 
                key={`row1-${i}`}
                className="group flex items-center gap-4 glass rounded-full px-6 py-4 min-w-[200px] hover:border-[#10b981]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-default"
              >
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:ring-2 group-hover:ring-[#10b981] transition-all duration-300 overflow-hidden">
                  {client.logoUrl ? (
                    <img 
                      src={client.logoUrl} 
                      alt={`${client.name} logo`} 
                      className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110" 
                    />
                  ) : (
                    <Building2 size={16} className="text-brand-light/50 group-hover:text-brand-light transition-colors duration-300" />
                  )}
                </div>
                <span className="text-sm font-display font-semibold text-zinc-400 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                  {client.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Second marquee row (reverse direction) */}
        {clientList.length > 3 && (
          <div className="overflow-hidden py-4">
            <motion.div 
              className="flex gap-6 w-max"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              {[...marqueeItems].reverse().map((client: { name: string; logoUrl: string }, i: number) => (
                <div 
                  key={`row2-${i}`}
                  className="group flex items-center gap-4 glass rounded-full px-6 py-4 min-w-[200px] hover:border-[#10b981]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-default"
                >
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:ring-2 group-hover:ring-[#10b981] transition-all duration-300 overflow-hidden">
                    {client.logoUrl ? (
                      <img 
                        src={client.logoUrl} 
                        alt={`${client.name} logo`} 
                        className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110" 
                      />
                    ) : (
                      <Building2 size={16} className="text-brand-light/50 group-hover:text-brand-light transition-colors duration-300" />
                    )}
                  </div>
                  <span className="text-sm font-display font-semibold text-zinc-400 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                    {client.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
