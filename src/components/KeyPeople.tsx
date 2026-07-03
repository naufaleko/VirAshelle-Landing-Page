import React from 'react';
import { motion } from 'motion/react';
import { useAdmin } from '../lib/AdminContext';
import { Supergraphic } from './Supergraphic';

export function KeyPeople() {
  const { content } = useAdmin();
  const people = content.keyPeople || [];

  return (
    <section id="team" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
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
          The Team
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-[-0.03em] mb-16"
        >
          Key People
        </motion.h2>
        
        {/* People Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {people.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl overflow-hidden h-[480px] cursor-default"
              style={{ perspective: '800px' }}
            >
              {/* Card with subtle 3D tilt on hover */}
              <div className="relative w-full h-full transition-transform duration-500 group-hover:[transform:rotateY(-2deg)_rotateX(1deg)]">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-surface-card via-surface-card to-brand rounded-2xl" />
                
                {/* Photo Area */}
                <div className="absolute inset-0 flex items-end justify-center pt-8 px-4">
                  {person.imageUrl ? (
                    <img 
                      src={person.imageUrl} 
                      alt={person.name} 
                      className="w-full h-auto object-cover object-bottom relative z-10 transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-brand/30">{person.name.charAt(0)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/80 to-transparent opacity-90 translate-y-[60%] group-hover:translate-y-[50%] transition-transform duration-500 rounded-2xl" />
                
                {/* Text Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 relative z-20">
                  <h3 className="text-xl font-display font-bold mb-1 text-white">{person.name}</h3>
                  <p className="text-white/80 tracking-[0.15em] uppercase text-[10px] mb-3 font-ui font-bold">{person.role}</p>
                  <p className="text-white/70 text-xs leading-relaxed font-body opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {person.desc}
                  </p>
                </div>

                {/* Border glow */}
                <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-brand/30 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
