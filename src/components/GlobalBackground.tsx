import React from 'react';
import { motion } from 'motion/react';
import { Supergraphic } from './Supergraphic';

function Glitch({ children, delay = 0, duration = 4 }: { children: React.ReactNode, delay?: number, duration?: number }) {
  return (
    <motion.div
      animate={{
        opacity: [1, 1, 0, 1, 0.5, 1, 1, 0.2, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        times: [0, 0.8, 0.82, 0.85, 0.87, 0.9, 0.95, 0.97, 1],
        delay,
        ease: "linear"
      }}
    >
      {children}
    </motion.div>
  );
}

function DataNode({ top, delay, duration }: { top: string, delay: number, duration: number }) {
  // Faster speed (lower duration) = longer trail
  const trailLength = Math.max(80, 450 - (duration * 50));

  return (
    <motion.div
      className="absolute left-0 z-0 flex items-center pointer-events-none"
      style={{ top }}
      animate={{
        x: ['-20vw', '120vw'],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: (v: number) => Math.floor(v * 80) / 80,
        delay,
        times: [0, 0.1, 0.9, 1]
      }}
    >
      {/* Pixelated Trail */}
      <div 
        className="h-[2px] opacity-70"
        style={{
          width: `${trailLength}px`,
          backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 4px, var(--color-brand) 4px, var(--color-brand) 10px)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black)'
        }}
      />
      {/* Head Square */}
      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-brand-light shadow-[0_0_15px_2px_rgba(181,136,243,0.8)]" />
    </motion.div>
  );
}

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-50] bg-surface overflow-hidden pointer-events-none selection:bg-brand selection:text-white">
      {/* ── Giant Infinite Scrolling Supergraphic ── */}
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 flex opacity-[0.03] pointer-events-none"
        animate={{ x: ['-50%', '0%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-[150vw] shrink-0 h-[150vw] flex items-center justify-center">
          <Supergraphic className="w-full h-full text-brand" />
        </div>
        <div className="w-[150vw] shrink-0 h-[150vw] flex items-center justify-center">
          <Supergraphic className="w-full h-full text-brand" />
        </div>
      </motion.div>

      {/* ── Ambient Lighting / Gradient Blobs ── */}
      {/* Primary gradient blob */}
      <div 
        className="absolute w-[800px] h-[800px] -top-40 -right-40 rounded-full blur-[120px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(125,57,235,0.25) 0%, rgba(125,57,235,0.05) 50%, transparent 70%)',
        }}
      />
      {/* Secondary gradient blob */}
      <div 
        className="absolute w-[600px] h-[600px] bottom-0 left-1/4 rounded-full blur-[100px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(49,17,102,0.3) 0%, rgba(49,17,102,0.05) 50%, transparent 70%)',
        }}
      />

      {/* ── High Speed Data Nodes ── */}
      <DataNode top="20%" delay={0} duration={6} />
      <DataNode top="45%" delay={2.5} duration={5} />
      <DataNode top="75%" delay={1} duration={4.5} />
      <DataNode top="35%" delay={4} duration={7} />
      <DataNode top="85%" delay={1.5} duration={5.5} />

      {/* ── Tactical UI Elements (Bits & Bobs) ── */}
      
      {/* Top Left Grid Crosshair */}
      <div className="absolute top-12 left-12 w-8 h-8 opacity-20">
        <Glitch delay={0.5} duration={3}>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white" />
        </Glitch>
      </div>

      {/* Bottom Right Coordinates */}
      <div className="absolute bottom-12 right-12 opacity-30 flex flex-col items-end gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white">
        <Glitch delay={1.2} duration={5}>
          <span>LAT 6.2088° S</span>
          <span>LNG 106.8456° E</span>
          <div className="w-12 h-[1px] bg-brand mt-2" />
        </Glitch>
      </div>

      {/* Center Left Data Ticker */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 opacity-20 font-ui text-[10px] uppercase tracking-widest text-brand-light flex flex-col gap-4 [writing-mode:vertical-lr] rotate-180">
        <Glitch delay={2.5} duration={4.5}>
          <span>VRL-SYS-01</span>
          <span className="w-[1px] h-12 bg-brand-light" />
          <span>ACTIVE</span>
        </Glitch>
      </div>

      {/* Top Right Decorative Squares */}
      <div className="absolute top-16 right-16 opacity-30 flex gap-2">
        <Glitch delay={0.8} duration={3.5}>
          <div className="w-1.5 h-1.5 bg-brand" />
          <div className="w-1.5 h-1.5 border border-brand" />
          <div className="w-1.5 h-1.5 border border-brand" />
        </Glitch>
      </div>

      {/* Geometric Lines across screen */}
      <Glitch delay={3.1} duration={6}>
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-brand/[0.03] to-transparent" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      </Glitch>

      {/* Small Floating Data Points */}
      <Glitch delay={1.7} duration={4.2}>
        <div className="absolute top-[30%] left-[20%] w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute top-[32%] left-[21%] text-[8px] font-mono text-white/20">.024</div>
      </Glitch>

      <Glitch delay={4.2} duration={5.5}>
        <div className="absolute bottom-[40%] right-[15%] w-1 h-1 bg-brand/40 rounded-full" />
        <div className="absolute bottom-[38%] right-[14%] text-[8px] font-mono text-brand/40">RX_99</div>
      </Glitch>
      
      {/* Corner Brackets */}
      <Glitch delay={2.1} duration={4.8}>
        <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/20" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/20" />
      </Glitch>
    </div>
  );
}
