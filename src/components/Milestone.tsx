import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useAdmin } from '../lib/AdminContext';

// ── Counter ─────────────────────────────────────────────────────────────────
function Counter({ target, color }: { target: string; color: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const m = target.match(/^(\d+)(.*)$/);
        if (!m) { setDisplay(target); return; }
        const end = parseInt(m[1]), suf = m[2], t0 = Date.now(), dur = 1600;
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          const e2 = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setDisplay(Math.floor(e2 * end) + suf);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, [target]);
  return (
    <div ref={ref} style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, fontFamily: 'inherit' }}>
      {display}
    </div>
  );
}

// ── Chart constants ──────────────────────────────────────────────────────────
// All in SVG user units (scales proportionally — no stretching)
const VW         = 1000;
const ABOVE_H    = 110;  // card zone above chart
const CHART_H    = 180;  // chart drawing area
const BELOW_H    = 110;  // card zone below chart
const VH         = ABOVE_H + CHART_H + BELOW_H; // 400

const CHART_T    = ABOVE_H;           // 110
const CHART_B    = ABOVE_H + CHART_H; // 290
const PAD_L      = 110;
const PAD_R      = 110;

const CARD_W     = 152;
const CARD_H_SVG = 98;

// Height fraction = position within chart (0=top 1=bottom)
// isAbove = node is in lower half → card zone above; !isAbove = upper half → card zone below
const H_PAT = [0.62, 0.88, 0.22, 0.75, 0.38, 0.9, 0.18];

const PALETTE = ['#7d39eb', '#a472f2', '#c4a0ff', '#8b5cf6', '#6d28d9', '#7c3aed', '#9333ea'];

function getNodes(count: number) {
  const usableW = VW - PAD_L - PAD_R;
  const usableH = CHART_H;
  return Array.from({ length: count }, (_, i) => {
    const hFrac = H_PAT[i % H_PAT.length];
    const x = PAD_L + (count === 1 ? usableW / 2 : (i / (count - 1)) * usableW);
    const y = CHART_T + hFrac * usableH;
    const isAbove = hFrac >= 0.5;
    return { x, y, hFrac, isAbove };
  });
}

function buildPath(nodes: { x: number; y: number }[]) {
  if (nodes.length < 2) return '';
  let d = `M${nodes[0].x},${nodes[0].y}`;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1], mx = (a.x + b.x) / 2;
    d += ` C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  }
  return d;
}

export function Milestone() {
  const { content } = useAdmin();
  const milestoneData = content.milestone;
  const items = milestoneData?.items || [];

  const wrapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapRef, { once: true, margin: '-80px' });

  const nodes    = getNodes(items.length);
  const linePath = buildPath(nodes);
  const areaPath = nodes.length >= 2
    ? `${linePath} L${nodes[nodes.length - 1].x},${CHART_B} L${nodes[0].x},${CHART_B} Z`
    : '';

  return (
    <section id="milestones" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6"
          >
            <span className="w-8 h-[1px] bg-brand-light" />
            {milestoneData?.subtitle || 'Our Journey'}
            <span className="w-8 h-[1px] bg-brand-light" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
          >
            {milestoneData?.title || 'Milestones'}
          </motion.h2>
        </div>

        {/* Chart — single proportional SVG, no stretching */}
        <div ref={wrapRef} className="w-full">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            style={{ width: '100%', display: 'block' }}
          >
            <defs>
              <linearGradient id="mgArea2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7d39eb" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#7d39eb" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="mgLine2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#7d39eb" />
                <stop offset="50%"  stopColor="#a472f2" />
                <stop offset="100%" stopColor="#c4a0ff" />
              </linearGradient>
              <filter id="mgGlow2">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Grid lines inside chart area */}
            {[0.3, 0.6, 0.9].map((f, gi) => {
              const gy = CHART_T + f * CHART_H;
              return (
                <motion.line key={gi}
                  x1={PAD_L} y1={gy} x2={VW - PAD_R} y2={gy}
                  stroke="#fff" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="4 10"
                  initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.2 + gi * 0.08, duration: 0.4 }}
                />
              );
            })}

            {/* Baseline */}
            <motion.line
              x1={PAD_L} y1={CHART_B + 3} x2={VW - PAD_R} y2={CHART_B + 3}
              stroke="#7d39eb" strokeWidth="0.8" strokeOpacity="0.25"
              initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            />

            {/* Area fill */}
            {areaPath && (
              <motion.path d={areaPath} fill="url(#mgArea2)"
                initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.85, duration: 0.8 }}
              />
            )}

            {/* Chart line */}
            {linePath && (
              <motion.path d={linePath} fill="none"
                stroke="url(#mgLine2)" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}

            {/* Per-node: connector line + dot + card */}
            {nodes.map((nd, i) => {
              const col  = PALETTE[i % PALETTE.length];
              const item = items[i];
              if (!item) return null;

              // Card position (in SVG units)
              const cardX = nd.x - CARD_W / 2;
              const GAP   = 14;
              const connY1 = nd.isAbove ? ABOVE_H - GAP       : nd.y + 12;
              const connY2 = nd.isAbove ? nd.y - 12            : CHART_B + GAP;
              const cardY  = nd.isAbove ? 6                    : CHART_B + GAP + 4;
              const enterDelay = 1.25 + i * 0.12;

              return (
                <g key={i}>
                  {/* Connector line (dashed, from card zone to node) */}
                  <motion.line
                    x1={nd.x} y1={connY1} x2={nd.x} y2={connY2}
                    stroke={col} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 4"
                    initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: enterDelay - 0.05, duration: 0.3 }}
                  />

                  {/* Node outer ring */}
                  <motion.circle
                    cx={nd.x} cy={nd.y} r={11}
                    fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.45"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 1.0 + i * 0.12, duration: 0.4, type: 'spring' }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />

                  {/* Node inner dot — blip */}
                  <motion.circle
                    cx={nd.x} cy={nd.y} r={4.5}
                    fill={col} filter="url(#mgGlow2)"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: [0, 1, 0, 1] } : {}}
                    transition={{ delay: 1.1 + i * 0.12, duration: 0.4, times: [0, 0.3, 0.6, 1] }}
                  />

                  {/* foreignObject card — HTML inside SVG, no stretching issues */}
                  <motion.g
                    initial={{ opacity: 0, y: nd.isAbove ? 6 : -6 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: enterDelay, duration: 0.4, type: 'spring', stiffness: 200 }}
                  >
                    <foreignObject x={cardX} y={cardY} width={CARD_W} height={CARD_H_SVG}>
                      <div
                        style={{
                          width: CARD_W,
                          height: CARD_H_SVG,
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${col}40`,
                          borderRadius: 12,
                          padding: '10px 12px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Top/bottom accent bar */}
                        <div style={{
                          position: 'absolute',
                          [nd.isAbove ? 'bottom' : 'top']: 0,
                          left: 0, right: 0, height: 2,
                          background: col,
                          borderRadius: nd.isAbove ? '0 0 12px 12px' : '12px 12px 0 0',
                        }} />

                        {/* Status */}
                        <div style={{
                          fontSize: 8, fontFamily: 'monospace', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.2em',
                          color: col, marginBottom: 4,
                        }}>
                          {item.status}
                        </div>

                        {/* Count */}
                        <Counter target={item.count} color={col} />

                        {/* Desc */}
                        <div style={{
                          fontSize: 9.5, color: '#71717a', lineHeight: 1.35,
                          marginTop: 5, fontFamily: 'sans-serif',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {item.desc}
                        </div>
                      </div>
                    </foreignObject>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>

      </div>
    </section>
  );
}
