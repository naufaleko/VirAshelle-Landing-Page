import React from 'react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';
import { Building2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Clients() {
  const { content } = useAdmin();
  const clientsData = content.clients;
  // Support both old string[] format and new {name, logoUrl}[] format
  const clientList = (clientsData?.items || []).map((item: any) =>
    typeof item === 'string' ? { name: item, logoUrl: '' } : item
  );

  return (
    <section id="clients" className="py-24 bg-transparent text-white relative px-6 overflow-hidden">
      {/* Background abstract supergraphic */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.03] pointer-events-none w-[200vw] h-[200vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-white animate-val-pan" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border-b-4 border-[#7d39eb] pb-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">{clientsData?.title || "Our Clients"}</h2>
        </div>
        <div className="bg-[#7d39eb] text-white text-center py-2 px-4 mb-12 font-medium tracking-wide">
          {clientsData?.subtitle || clientsData?.description || "These are the brands that have been collaborated with our company!"}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8">
          {clientList.map((client: { name: string; logoUrl: string }, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group flex flex-col items-center gap-4 cursor-default"
            >
              {/* Logo container */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-white/10 bg-white/[0.03] group-hover:border-[#7d39eb]/40 group-hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center overflow-hidden backdrop-blur-sm group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(125,57,235,0.15)]">
                {client.logoUrl ? (
                  <img 
                    src={client.logoUrl} 
                    alt={`${client.name} logo`} 
                    className="w-14 h-14 md:w-16 md:h-16 object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0" 
                  />
                ) : (
                  <Building2 size={32} className="text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300" />
                )}
              </div>
              {/* Client name */}
              <span className="text-xs md:text-sm font-semibold text-zinc-500 group-hover:text-white transition-colors duration-300 text-center leading-tight tracking-tight">
                {client.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
