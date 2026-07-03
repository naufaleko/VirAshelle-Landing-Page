import React from 'react';
import { useAdmin } from '../lib/AdminContext';
import { Supergraphic } from './Supergraphic';

export function KeyPeople() {
  const { content } = useAdmin();
  const people = content.keyPeople || [];

  return (
    <section id="team" className="py-24 bg-zinc-950 text-white relative px-6 overflow-hidden">
      {/* Background abstract supergraphic */}
      <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 z-0 opacity-[0.04] pointer-events-none w-[100vw] h-[100vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-[#7d39eb] animate-spin-slow" />
      </div>
      <div className="absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 z-0 opacity-[0.02] pointer-events-none w-[100vw] h-[100vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-white animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '60s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border-b-[12px] border-[#7d39eb] pb-2 mb-16 relative">
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">Key People</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {people.map((person, i) => (
            <div key={i} className="group relative bg-gradient-to-b from-white/10 to-[#7d39eb] rounded-xl overflow-hidden flex flex-col text-center shadow-lg border-none h-[450px]">
              {/* Photo Area */}
              <div className="flex-1 relative flex items-end justify-center pt-8 px-4">
                {person.imageUrl ? (
                  <img src={person.imageUrl} alt={person.name} className="w-full h-auto object-cover object-bottom" />
                ) : (
                  <div className="w-full h-full bg-white/5 rounded-t-lg flex items-center justify-center">
                    <span className="text-white/30 text-xs font-mono">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Text Area */}
              <div className="p-6 pt-0 flex flex-col relative z-10 bg-gradient-to-t from-[#7d39eb] via-[#7d39eb] to-transparent">
                <h3 className="text-2xl font-display font-bold mb-1 text-white">{person.name}</h3>
                <p className="text-white tracking-widest uppercase text-[10px] mb-4 font-bold">{person.role}</p>
                <p className="text-white/90 text-xs leading-tight mt-auto font-medium">{person.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

