import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimationControls } from 'motion/react';
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
  { label: 'Integrity',     icon: Shield,  color: '#7d39eb' },
  { label: 'Quality',       icon: Award,   color: '#a472f2' },
  { label: 'Creativity',    icon: Zap,     color: '#c4a0ff' },
  { label: 'Affordability', icon: Target,  color: '#a472f2' },
  { label: 'Flexibility',   icon: Puzzle,  color: '#7d39eb' },
];

function getPentagonPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

const SIZE = 480;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 170;
const INNER_R = 90;

const outerPts = getPentagonPoints(CX, CY, OUTER_R);
const innerPts = getPentagonPoints(CX, CY, INNER_R);
const outerPolyStr = outerPts.map((p) => `${p.x},${p.y}`).join(' ');
const innerPolyStr = innerPts.map((p) => `${p.x},${p.y}`).join(' ');

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

// ── Glitch boot-up pentagon ────────────────────────────────────────────────
function PentagonDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  // Controls for the whole SVG wrapper — the initial flicker burst
  const wrapCtrl = useAnimationControls();
  // Controls for scanline
  const scanCtrl = useAnimationControls();
  // Controls for inner content (nodes, labels, etc.)
  const innerCtrl = useAnimationControls();

  useEffect(() => {
    if (!isInView) return;

    const run = async () => {
      // ── Phase 1: raw flicker (CRT boot) ──────────────────────────────
      await wrapCtrl.start({
        opacity:  [0, 0.9, 0,   0.8, 0.05, 0, 0.95, 0.1, 0,   1],
        x:        [0, -3,  3,  -2,   0,    2,  -1,   1,   0,   0],
        filter: [
          'brightness(2) contrast(2)',
          'brightness(1)',
          'brightness(3) contrast(3)',
          'brightness(1)',
          'brightness(2)',
          'brightness(1)',
          'brightness(1.5)',
          'brightness(1)',
          'brightness(1)',
          'brightness(1)',
        ],
        transition: {
          duration: 0.75,
          times: [0, 0.08, 0.18, 0.3, 0.42, 0.52, 0.63, 0.75, 0.88, 1],
          ease: 'linear',
        },
      });

      // ── Phase 2: scanline sweep ───────────────────────────────────────
      scanCtrl.start({
        scaleY: [0, 1],
        y: [`-${SIZE / 2}px`, `${SIZE / 2}px`],
        opacity: [1, 1, 0],
        transition: { duration: 0.9, ease: 'easeIn' },
      });

      // ── Phase 3: inner elements reveal (slight glitch per element) ────
      await new Promise((r) => setTimeout(r, 200));
      innerCtrl.start({
        opacity: [0, 1, 0.4, 1, 0.2, 0, 1],
        x: [0, -2, 2, -1, 1, 0, 0],
        transition: {
          duration: 0.55,
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
          ease: 'linear',
        },
      });
    };

    run();
  }, [isInView, wrapCtrl, scanCtrl, innerCtrl]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <p className="text-[11px] uppercase tracking-[0.3em] font-ui text-zinc-500">Core Values</p>

      <div className="relative" style={{ width: SIZE, height: SIZE, maxWidth: '100%' }}>

        {/* Scanline sweep */}
        <motion.div
          animate={scanCtrl}
          initial={{ opacity: 0, scaleY: 0, y: `-${SIZE / 2}px` }}
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: '50%',
            height: 2,
            background: 'linear-gradient(90deg, transparent, #7d39eb, #c4a0ff, #7d39eb, transparent)',
            boxShadow: '0 0 12px 4px rgba(125,57,235,0.6)',
          }}
        />

        {/* Static noise overlay — flashes briefly */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? {
            opacity: [0, 0.25, 0, 0.4, 0, 0.15, 0, 0],
            transition: { duration: 0.75, times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1], ease: 'linear' },
          } : {}}
          className="absolute inset-0 rounded-full pointer-events-none z-[5]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(125,57,235,0.07) 2px, rgba(125,57,235,0.07) 4px)',
          }}
        />

        {/* Main SVG — flicker wrapper */}
        <motion.div
          animate={wrapCtrl}
          initial={{ opacity: 0 }}
          style={{ width: '100%', height: '100%' }}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <radialGradient id="pentaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7d39eb" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#7d39eb" stopOpacity="0" />
              </radialGradient>
              <filter id="nodeGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Ambient glow */}
            <circle cx={CX} cy={CY} r={OUTER_R + 30} fill="url(#pentaGlow)" />

            {/* Inner elements — secondary glitch layer */}
            <motion.g animate={innerCtrl} initial={{ opacity: 0 }}>
              {/* Spoke lines */}
              {outerPts.map((pt, i) => (
                <line
                  key={`spoke-${i}`}
                  x1={CX} y1={CY}
                  x2={pt.x} y2={pt.y}
                  stroke="#7d39eb"
                  strokeWidth="1"
                  strokeOpacity="0.22"
                />
              ))}

              {/* Outer pentagon */}
              <polygon
                points={outerPolyStr}
                fill="none"
                stroke="#7d39eb"
                strokeWidth="1.5"
                strokeOpacity="0.55"
                filter="url(#nodeGlow)"
              />

              {/* Inner pentagon */}
              <polygon
                points={innerPolyStr}
                fill="rgba(125,57,235,0.07)"
                stroke="#a472f2"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            </motion.g>

            {/* Rotating dashed ring — starts after boot */}
            <motion.circle
              cx={CX} cy={CY} r={OUTER_R + 18}
              fill="none"
              stroke="#7d39eb"
              strokeWidth="0.7"
              strokeOpacity="0.18"
              strokeDasharray="5 9"
              initial={{ opacity: 0, rotate: 0 }}
              animate={isInView ? { opacity: 1, rotate: 360 } : {}}
              transition={{
                opacity: { delay: 1.2, duration: 0.4 },
                rotate: { delay: 1.2, duration: 28, repeat: Infinity, ease: 'linear' },
              }}
              style={{ originX: `${CX}px`, originY: `${CY}px` }}
            />

            {/* Center pulse circle */}
            <motion.circle
              cx={CX} cy={CY} r={22}
              fill="rgba(125,57,235,0.15)"
              stroke="#7d39eb"
              strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? {
                opacity: 1,
                scale: 1,
                r: [22, 25, 22],
              } : {}}
              transition={{
                opacity: { delay: 1.1, duration: 0.3 },
                scale:   { delay: 1.1, duration: 0.4, type: 'spring' },
                r:       { delay: 1.4, duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ originX: `${CX}px`, originY: `${CY}px` }}
            />

            <motion.text
              x={CX} y={CY + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="800"
              fill="#c4a0ff"
              letterSpacing="0.08em"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.3, duration: 0.3 }}
            >
              VRA
            </motion.text>

            {/* Value nodes */}
            {coreValues.map((val, i) => {
              const pt = outerPts[i];
              const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
              const labelR = OUTER_R + 46;
              const lx = CX + labelR * Math.cos(angle);
              const ly = CY + labelR * Math.sin(angle);
              // Stagger each node's blip entrance
              const nodeDelay = 1.0 + i * 0.18;

              return (
                <g key={i}>
                  {/* Node ring — blip entrance */}
                  <motion.circle
                    cx={pt.x} cy={pt.y} r={17}
                    fill="rgba(125,57,235,0.1)"
                    stroke="#7d39eb"
                    strokeWidth="1.2"
                    strokeOpacity="0.6"
                    initial={{ opacity: 0 }}
                    animate={isInView ? {
                      // rapid blink: on → off → on → off → on → stay
                      opacity: [0, 1, 0, 1, 0, 1, 0, 1],
                    } : {}}
                    transition={{
                      delay: nodeDelay,
                      duration: 0.5,
                      times:    [0, 0.12, 0.25, 0.42, 0.55, 0.7, 0.82, 1],
                      ease: 'linear',
                    }}
                  />

                  {/* Node dot — blip entrance, slightly offset */}
                  <motion.circle
                    cx={pt.x} cy={pt.y} r={8}
                    fill={val.color}
                    filter="url(#nodeGlow)"
                    initial={{ opacity: 0 }}
                    animate={isInView ? {
                      opacity: [0, 1, 0, 1, 0, 0, 1, 0, 1],
                    } : {}}
                    transition={{
                      delay: nodeDelay + 0.04,
                      duration: 0.55,
                      times:    [0, 0.1, 0.22, 0.38, 0.5, 0.6, 0.72, 0.85, 1],
                      ease: 'linear',
                    }}
                  />

                  {/* Idle radar ping */}
                  <g transform={`translate(${pt.x}, ${pt.y})`}>
                    <motion.circle
                      cx={0} cy={0} r={8}
                      fill="none"
                      stroke={val.color}
                      strokeWidth="1.2"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={isInView ? {
                        opacity: [0, 0.6, 0],
                        scale:   [1, 2.6, 4],
                      } : {}}
                      transition={{
                        delay: 1.8 + [0, 1.3, 0.6, 1.8, 0.9][i % 5],
                        duration: 1.4,
                        repeat: Infinity,
                        repeatDelay: 1.5 + [0.5, 0.1, 0.8, 0.3, 1.2][i % 5],
                        ease: 'easeOut',
                      }}
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'center',
                      }}
                    />
                  </g>

                  {/* Label — blip in after dot */}
                  <motion.text
                    x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    fill="#e4e4e7"
                    letterSpacing="0.1em"
                    initial={{ opacity: 0 }}
                    animate={isInView ? {
                      opacity: [0, 1, 0, 1, 0, 1],
                    } : {}}
                    transition={{
                      delay: nodeDelay + 0.25,
                      duration: 0.45,
                      times:    [0, 0.15, 0.32, 0.5, 0.7, 1],
                      ease: 'linear',
                    }}
                  >
                    {val.label.toUpperCase()}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
          className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em] mb-6"
        >
          {whyUs?.title || 'Why VirAshelle?'}
        </motion.h2>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
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
                      <p className="text-zinc-400 text-sm font-body leading-relaxed">{feature.desc}</p>
                      <AnimatedBar value={feature.value} delay={0.3 + i * 0.15} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pentagon */}
          <div className="flex justify-center">
            <PentagonDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
