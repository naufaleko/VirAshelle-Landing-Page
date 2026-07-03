import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
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

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-display font-bold text-white mb-3">
      <span className="text-gradient">{count}</span>
    </div>
  );
}

export function Milestone() {
  const { content } = useAdmin();
  const milestoneData = content.milestone;

  return (
    <section id="milestones" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6"
          >
            <span className="w-8 h-[1px] bg-brand-light" />
            {milestoneData?.subtitle || "Our Journey"}
            <span className="w-8 h-[1px] bg-brand-light" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
          >
            {milestoneData?.title || "Milestones"}
          </motion.h2>
        </div>
        
        {/* Milestone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {milestoneData?.items?.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group relative glass rounded-2xl p-8 md:p-10 overflow-hidden hover:border-brand/30 transition-all duration-500"
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Ghost number */}
              <div className="absolute top-2 right-4 font-display text-[100px] font-bold text-white/[0.02] group-hover:text-brand/[0.05] leading-none transition-all duration-700 pointer-events-none select-none">
                {("0" + (i + 1)).slice(-2)}
              </div>
              
              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] font-ui text-zinc-500 mb-4 block">
                  {m.status}
                </span>
                <Counter target={m.count} />
                <p className="text-zinc-400 text-sm font-body leading-relaxed mt-2">
                  {m.desc}
                </p>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand via-brand-light to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
