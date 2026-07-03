import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';

const data = [
  { subject: 'Integrity', A: 100, fullMark: 100 },
  { subject: 'Quality', A: 100, fullMark: 100 },
  { subject: 'Creativity', A: 100, fullMark: 100 },
  { subject: 'Affordability', A: 100, fullMark: 100 },
  { subject: 'Flexibility', A: 100, fullMark: 100 },
];

export function WhyUs() {
  const { content } = useAdmin();
  const whyUs = content.whyUs;

  return (
    <section id="why-us" className="py-24 bg-transparent text-white relative px-6 overflow-hidden">
      {/* Background abstract supergraphic */}
      <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 z-0 opacity-[0.05] pointer-events-none w-[120vw] h-[120vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-[#7d39eb] animate-spin-slow" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="border-b-4 border-[#7d39eb] pb-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">{whyUs?.title || "Why VirAshelle?"}</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold text-[#7d39eb] mb-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#7d39eb]"></span>
                Integrated Visual Solutions :
              </h3>
              <p className="text-zinc-400 pl-5">
                No need to juggle multiple vendors for 3D, animation, or editing. We handle your entire visual ecosystem under one roof.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#7d39eb] mb-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#7d39eb]"></span>
                Result-Driven Creativity :
              </h3>
              <p className="text-zinc-400 pl-5">
                We don't just create beautiful visuals; we design them strategically to boost engagement and maximize your product's ad conversions.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#7d39eb] mb-3 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#7d39eb]"></span>
                Proven Track Record :
              </h3>
              <p className="text-zinc-400 pl-5">
                Backed by a solid portfolio, we have successfully produced high-performing product commercials across various digital platforms.
              </p>
            </div>
          </div>
          
          <div className="relative aspect-square max-w-lg mx-auto w-full flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-[#7d39eb]/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis 
                     dataKey="subject" 
                     tick={{ fill: '#d4d4d8', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif' }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Capabilities"
                    dataKey="A"
                    stroke="#7d39eb"
                    strokeWidth={3}
                    fill="#7d39eb"
                    fillOpacity={0.3}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
