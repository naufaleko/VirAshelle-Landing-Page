import React, { useEffect, useState, useRef } from 'react';
import { useAdmin } from '../lib/AdminContext';

function Counter({ target }: { target: string }) {
  const [count, setCount] = useState("0");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target]);

  const startAnimation = () => {
    if (!target) return;
    const match = target.match(/^(\d+)(.*)$/);
    if (!match) {
      setCount(target);
      return;
    }

    const endValue = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 2000;
    const startTime = Date.now();

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOutExpo * endValue);
      
      setCount(currentCount + suffix);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  return <div ref={ref} className="text-5xl font-display font-bold text-white mb-6">{count}</div>;
}

export function Milestone() {
  const { content } = useAdmin();
  const milestoneData = content.milestone;

  return (
    <section id="milestones" className="py-24 bg-transparent text-white relative px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[#7d39eb] uppercase font-bold tracking-widest text-sm mb-4">{milestoneData?.subtitle || "Our Journey"}</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">{milestoneData?.title || "Milestones"}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {milestoneData?.items?.map((m, i) => (
            <div key={i} className={`bg-[#0C0C0C] border ${m.color} p-8 rounded-2xl relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-6 opacity-10 font-display text-8xl font-bold group-hover:scale-110 transition-transform duration-500">
                {("0" + (i + 1)).slice(-2)}
              </div>
              <div className="relative z-10">
                <h3 className="text-sm uppercase tracking-widest text-zinc-400 mb-2">{m.status}</h3>
                <Counter target={m.count} />
                <p className="text-zinc-500 text-sm leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
