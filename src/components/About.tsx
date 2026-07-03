import React from 'react';
import { EditableText } from './EditableText';
import { Supergraphic } from './Supergraphic';

export function About() {
  return (
    <section id="about" className="py-24 bg-transparent text-white relative px-6 overflow-hidden">
      {/* Background abstract supergraphic */}
      <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 z-0 opacity-[0.06] pointer-events-none w-[80vw] h-[80vw]">
        <Supergraphic className="w-full h-full text-[#7d39eb] animate-spin-slow" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border-b-4 border-[#7d39eb] pb-4 mb-12 inline-block">
          <EditableText 
            contentKey="about" 
            field="title" 
            as="h2" 
            className="text-4xl md:text-5xl font-display font-bold tracking-tighter" 
          />
        </div>
        
        <div className="max-w-4xl space-y-8">
          <EditableText 
            contentKey="about" 
            field="content" 
            as="div" 
            className="text-2xl md:text-3xl font-light leading-relaxed whitespace-pre-wrap space-y-8" 
            multiline 
          />
          <p className="text-lg md:text-xl text-zinc-500 font-light italic mt-12 border-l-2 border-[#7d39eb] pl-6">
            Combining <span className="text-[#7d39eb] font-medium not-italic">Cutting-Edge Visual Technology</span> with <span className="text-[#7d39eb] font-medium not-italic">Compelling Storytelling</span>, we transform complex ideas into stunning, dynamic, and market-relevant <span className="text-[#7d39eb] font-medium not-italic">Visual Masterpieces</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
