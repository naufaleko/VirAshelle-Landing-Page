import React from 'react';
import { motion } from 'motion/react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';
import { Zap, Target, Award, Shield, Puzzle } from 'lucide-react';

const features = [
  {
    icon: Puzzle,
    title: 'Integrated Visual Solutions',
    desc: 'No need to juggle multiple vendors for 3D, animation, or editing. We handle your entire visual ecosystem under one roof.',
    value: 100,
  },
  {
    icon: Target,
    title: 'Result-Driven Creativity',
    desc: "We don't just create beautiful visuals; we design them strategically to boost engagement and maximize your product's ad conversions.",
    value: 100,
  },
  {
    icon: Award,
    title: 'Proven Track Record',
    desc: 'Backed by a solid portfolio, we have successfully produced high-performing product commercials across various digital platforms.',
    value: 100,
  },
];

const coreValues = [
  { label: 'Integrity', icon: Shield },
  { label: 'Quality', icon: Award },
  { label: 'Creativity', icon: Zap },
  { label: 'Affordability', icon: Target },
  { label: 'Flexibility', icon: Puzzle },
];

function AnimatedBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light"
      />
    </div>
  );
}

export function WhyUs() {
  const { content } = useAdmin();
  const whyUs = content.whyUs;

  return (
    <section id="why-us" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
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
          Our Edge
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em] mb-16"
        >
          {whyUs?.title || "Why VirAshelle?"}
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Feature Cards */}
          <div className="space-y-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="group glass rounded-2xl p-8 hover:border-brand/30 transition-all duration-500"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand/20 group-hover:shadow-[0_0_20px_rgba(125,57,235,0.2)] transition-all duration-500">
                      <Icon size={20} className="text-brand-light" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold mb-2 text-white group-hover:text-brand-light transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-400 text-sm font-body leading-relaxed">
                        {feature.desc}
                      </p>
                      <AnimatedBar value={feature.value} delay={0.3 + i * 0.15} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Core Values Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="glass rounded-3xl p-10 md:p-12">
              <h3 className="text-sm uppercase tracking-[0.2em] font-ui text-zinc-500 mb-10">Core Values</h3>
              <div className="space-y-8">
                {coreValues.map((val, i) => {
                  const Icon = val.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-5 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-all duration-300">
                        <Icon size={16} className="text-brand-light" />
                      </div>
                      <span className="text-lg font-display font-semibold text-zinc-300 group-hover:text-white transition-colors">{val.label}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden ml-4">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-brand/60 to-brand-light/40"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Decorative floating dot */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-brand rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(125,57,235,0.4)',
                  '0 0 40px rgba(125,57,235,0.7)',
                  '0 0 20px rgba(125,57,235,0.4)',
                ],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
