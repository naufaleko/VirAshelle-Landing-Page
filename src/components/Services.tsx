import React from 'react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';

export function Services() {
  const { content } = useAdmin();
  const servicesData = content.services;

  return (
    <section id="services" className="py-24 bg-zinc-950 text-white relative px-6 overflow-hidden">
      {/* Background abstract supergraphic */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none flex items-center justify-center mix-blend-screen">
        <Supergraphic className="w-[200vw] md:w-[120vw] max-w-none text-[#7d39eb] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border-b-4 border-[#7d39eb] pb-4 mb-16 flex justify-between items-end">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">{servicesData.title}</h2>
          <span className="text-[#7d39eb] font-bold tracking-widest uppercase hidden md:block">{servicesData.description}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {servicesData.items.map((service, index) => (
            <div key={index} className="group relative bg-zinc-900/50 backdrop-blur-md rounded-2xl p-10 border border-white/5 hover:border-[#7d39eb]/50 transition-all duration-500 overflow-hidden cursor-default">
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7d39eb]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold tracking-tight mb-4 uppercase text-white group-hover:text-[#7d39eb] transition-colors duration-300">
                  {service.title} <span className="text-[#7d39eb] group-hover:text-white transition-colors duration-300">:</span>
                </h3>
                <p className="text-zinc-400 leading-relaxed font-light text-lg">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
