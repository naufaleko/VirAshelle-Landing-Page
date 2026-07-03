import React from 'react';
import { Supergraphic } from './Supergraphic';
import { Logo } from './Logo';
import { useAdmin } from '../lib/AdminContext';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export function Workflow() {
  const { content } = useAdmin();
  const workflowData = content.workflow;

  return (
    <section id="workflow" className="py-24 bg-zinc-950 text-white relative px-6 overflow-hidden">
      {/* Background abstract supergraphic — gentle floating drift */}
      <motion.div 
        className="absolute left-0 bottom-0 -translate-x-1/3 translate-y-1/3 z-0 opacity-[0.03] pointer-events-none w-[120vw] h-[120vw] md:w-[80vw] md:h-[80vw]"
        animate={{ 
          scale: [1, 1.08, 1.03, 1.06, 1],
          x: ['0%', '2%', '-1%', '1.5%', '0%'],
          y: ['0%', '-1.5%', '1%', '-0.5%', '0%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Supergraphic className="w-full h-full text-[#7d39eb]" />
      </motion.div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-b border-white/10 pb-6 mb-16 flex items-center justify-between"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">
            {workflowData?.title || "Our Workflow"}
          </h2>
          <div className="hidden md:block w-32 h-1 bg-gradient-to-r from-[#7d39eb] to-transparent"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 lg:gap-24">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6 relative z-10"
          >
            {/* A vertical line connecting the steps */}
            <div className="absolute left-[39px] top-10 bottom-10 w-px bg-gradient-to-b from-[#7d39eb] via-[#7d39eb]/50 to-transparent hidden sm:block"></div>

            {workflowData?.items?.map((step, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="group relative flex gap-6 sm:gap-8 items-start bg-white/[0.02] hover:bg-white/[0.04] p-6 rounded-3xl border border-white/5 hover:border-[#7d39eb]/30 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="bg-zinc-950 border-2 border-[#7d39eb]/50 group-hover:border-[#7d39eb] text-white font-display font-bold text-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl relative shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-[0_0_0_rgba(125,57,235,0)] group-hover:shadow-[0_0_20px_rgba(125,57,235,0.3)] z-10">
                  {step.number}
                </div>
                <div className="pt-1 sm:pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white group-hover:text-[#7d39eb] transition-colors">{step.title}</h3>
                  <p className="text-zinc-400 font-light leading-relaxed text-sm sm:text-base">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="relative hidden xl:flex items-center justify-center">
            {/* Abstract visual for workflow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative w-full max-w-lg aspect-square"
            >
              {/* Breathing gradient glow */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-[#7d39eb]/20 to-transparent rounded-full blur-3xl mix-blend-screen"
                animate={{ opacity: [0.4, 0.8, 0.5, 0.7, 0.4], scale: [1, 1.1, 0.95, 1.05, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Logo with gentle breathing */}
              <motion.div
                className="w-full h-full flex items-center justify-center"
                animate={{ scale: [1, 1.04, 0.98, 1.02, 1], opacity: [0.05, 0.08, 0.04, 0.07, 0.05] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Logo className="w-3/4 text-white" />
              </motion.div>
              
              {/* Outer ring — pulsing scale + fade */}
              <motion.div 
                className="absolute inset-10 border border-white/5 rounded-full"
                animate={{ scale: [1, 1.06, 0.97, 1.03, 1], opacity: [0.05, 0.15, 0.05, 0.12, 0.05] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Middle ring — offset breathing */}
              <motion.div 
                className="absolute inset-20 border border-[#7d39eb]/20 rounded-full"
                animate={{ scale: [1, 0.95, 1.05, 0.98, 1], opacity: [0.2, 0.4, 0.15, 0.35, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              />
              
              {/* Inner glow ring */}
              <motion.div 
                className="absolute inset-[7.5rem] border border-[#7d39eb]/10 rounded-full"
                animate={{ scale: [1, 1.08, 0.96, 1.04, 1], opacity: [0.1, 0.3, 0.08, 0.25, 0.1] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
              />
              
              {/* Center dot — pulsing glow */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#7d39eb] rounded-full"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(125,57,235,0.4), 0 0 60px rgba(125,57,235,0.1)',
                    '0 0 40px rgba(125,57,235,0.8), 0 0 80px rgba(125,57,235,0.3)',
                    '0 0 20px rgba(125,57,235,0.4), 0 0 60px rgba(125,57,235,0.1)',
                  ],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
