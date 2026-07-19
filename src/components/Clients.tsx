import React from 'react';
import { motion } from 'motion/react';
import { useAdmin } from '../lib/AdminContext';
import { Building2 } from 'lucide-react';
import { useIsMobile } from '../lib/useIsMobile';

export function Clients() {
  const { content } = useAdmin();
  const isMobile = useIsMobile();
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

      {/* Marquee Container — uses CSS animation instead of Framer Motion for GPU-accelerated performance */}
      <div className="relative">

        {/* First marquee row — CSS-based animation */}
        <div className="overflow-hidden py-4">
          <div className="marquee-track gap-6">
            {marqueeItems.map((client: { name: string; logoUrl: string }, i: number) => (
              <div 
                key={`row1-${i}`}
                className="group flex items-center gap-4 glass rounded-full px-6 py-4 min-w-[200px] hover:border-[#10b981]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-default shrink-0"
              >
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:ring-2 group-hover:ring-[#10b981] transition-all duration-300 overflow-hidden">
                  {client.logoUrl ? (
                    <img 
                      src={client.logoUrl} 
                      alt={`${client.name} logo`} 
                      className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
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
          </div>
        </div>

        {/* Second marquee row (reverse direction) — hidden on mobile for performance */}
        {clientList.length > 3 && !isMobile && (
          <div className="overflow-hidden py-4">
            <div className="marquee-track-reverse gap-6">
              {[...marqueeItems].reverse().map((client: { name: string; logoUrl: string }, i: number) => (
                <div 
                  key={`row2-${i}`}
                  className="group flex items-center gap-4 glass rounded-full px-6 py-4 min-w-[200px] hover:border-[#10b981]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-default shrink-0"
                >
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:ring-2 group-hover:ring-[#10b981] transition-all duration-300 overflow-hidden">
                    {client.logoUrl ? (
                      <img 
                        src={client.logoUrl} 
                        alt={`${client.name} logo`} 
                        className="w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
