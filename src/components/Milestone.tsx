import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useAdmin } from '../lib/AdminContext';

// ── Counter ─────────────────────────────────────────────────────────────────
function Counter({ target, color, fontSize = 22 }: { target: string; color: string; fontSize?: number }) {
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
    <div ref={ref} style={{ fontSize, fontWeight: 800, color, lineHeight: 1.1, fontFamily: 'inherit' }}>
      {display}
    </div>
  );
}

// ── Parse desc text into structured lines ────────────────────────────────────
function parseDescLines(desc: string): { isList: boolean; lines: string[] } {
  if (!desc) return { isList: false, lines: [] };
  const raw = desc.split(/\n/).map(l => l.trim()).filter(Boolean);
  const listPattern = /^(?:[-•*]|\d+[.)]\s*)/;
  const listCount = raw.filter(l => listPattern.test(l)).length;
  const isList = listCount >= 2 || (raw.length >= 2 && listCount / raw.length > 0.5);

  if (isList) {
    return {
      isList: true,
      lines: raw.map(l => l.replace(/^(?:[-•*]\s*|\d+[.)]\s*)/, '').trim()),
    };
  }
  return { isList: false, lines: [desc] };
}

// ── Chart constants (fixed) ─────────────────────────────────────────────────
const VW         = 1000;
const ABOVE_H    = 110;
const CHART_H    = 180;
const BELOW_H    = 110;
const VH         = ABOVE_H + CHART_H + BELOW_H; // 400

const CHART_T    = ABOVE_H;           // 110
const CHART_B    = ABOVE_H + CHART_H; // 290
const PAD_L      = 80;
const PAD_R      = 80;

const MAX_CARD_W    = 152;
const BASE_CARD_H   = 88;
const BASE_NODE_GAP = 14;

const H_PAT = [0.62, 0.88, 0.22, 0.75, 0.38, 0.9, 0.18];
const PALETTE = ['#7d39eb', '#a472f2', '#c4a0ff', '#8b5cf6', '#6d28d9', '#7c3aed', '#9333ea'];

// ── Dynamic sizing based on item count ───────────────────────────────────────
function getDynamicSizes(itemCount: number) {
  // Base constants
  const MAX_CARD_W = 164;
  const BASE_CARD_H = 100;

  const usableW = VW - 60;
  const cardW = Math.min(MAX_CARD_W, Math.max(72, Math.floor(usableW / Math.max(itemCount, 1)) - 6));
  const scale = cardW / MAX_CARD_W;
  
  const compactH = Math.round(BASE_CARD_H * Math.max(0.7, scale));
  const nodeGap = cardW * 0.25;

  const expandBuffer = 800; // Extra height given to foreignObject for expansion
  return { cardW, scale, compactH, nodeGap, expandBuffer };
}

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

// ── Expandable Milestone Card ────────────────────────────────────────────────
function MilestoneCard({
  item, col, isAbove, cardW, sizeScale,
}: {
  item: { status: string; count: string; desc: string };
  col: string;
  isAbove: boolean;
  cardW: number;
  sizeScale: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isList, lines } = parseDescLines(item.desc);
  const hasOverflow = isList || item.desc.length > 45;
  const isActive = hovered || isExpanded;

  // Dynamic font sizes based on card scale - larger minimums for readability
  const statusFs = Math.max(12, Math.round(13 * sizeScale));
  
  // Adjust central text size if it's long text instead of a number
  const countLen = item.count ? item.count.length : 0;
  const countBaseFs = countLen > 12 ? 16 : (countLen > 7 ? 22 : 36);
  const countFs = Math.max(18, Math.round(countBaseFs * sizeScale));
  
  const descFs = Math.max(13, Math.round(15 * sizeScale));
  const pad = Math.max(12, Math.round(16 * sizeScale));
  const borderRad = Math.max(10, Math.round(18 * sizeScale));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (hasOverflow) setIsExpanded(!isExpanded);
      }}
      style={{
        width: cardW,
        background: isActive
          ? 'rgba(18, 14, 38, 0.97)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isActive ? col + '90' : col + '30'}`,
        borderRadius: borderRad,
        padding: `${pad + 4}px ${pad + 6}px`,
        textAlign: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        cursor: hasOverflow ? 'pointer' : 'default',
        transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isActive ? 'scale(1.15)' : 'scale(1)',
        transformOrigin: isAbove ? 'center bottom' : 'center top',
        boxShadow: isActive
          ? `0 14px 44px rgba(0,0,0,0.65), 0 0 50px ${col}20, 0 0 100px ${col}08, inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 2px 6px rgba(0,0,0,0.15)',
        backdropFilter: isActive ? 'blur(24px)' : 'none',
        zIndex: isActive ? 20 : 1,
      }}
    >
      {/* Shimmer sweep on hover */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundImage: isActive
          ? `linear-gradient(105deg, transparent 35%, ${col}12 45%, ${col}20 50%, ${col}12 55%, transparent 65%)`
          : 'none',
        backgroundSize: '200% 100%',
        animation: isActive ? 'milestone-shimmer 2.5s ease-in-out infinite' : 'none',
        pointerEvents: 'none',
        borderRadius: borderRad,
      }} />

      {/* Accent bar with glow */}
      <div style={{
        position: 'absolute',
        [isAbove ? 'bottom' : 'top']: 0,
        left: 0, right: 0,
        height: isActive ? 3 : 2,
        background: isActive
          ? `linear-gradient(90deg, transparent 0%, ${col} 25%, ${col} 75%, transparent 100%)`
          : col,
        transition: 'all 0.4s ease',
        boxShadow: isActive ? `0 ${isAbove ? '-' : ''}4px 16px ${col}60` : 'none',
      }} />

      {/* Corner radial glow on hover */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: isAbove ? 'auto' : -12,
          bottom: isAbove ? -12 : 'auto',
          left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 24,
          background: `radial-gradient(ellipse, ${col}35, transparent 70%)`,
          pointerEvents: 'none',
          filter: 'blur(6px)',
          animation: 'milestone-glow-pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Status label */}
      <div style={{
        fontSize: statusFs, fontFamily: 'monospace', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.15em',
        color: col, marginBottom: 2,
        transition: 'all 0.35s ease',
        transform: isActive ? 'scale(1.06)' : 'scale(1)',
        textShadow: isActive ? `0 0 8px ${col}50` : 'none',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {item.status}
      </div>

      {/* Counter number or Central Text */}
      <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Counter target={item.count} color={col} fontSize={countFs} />
      </div>

      {/* Desc area — smooth expand/collapse */}
      <div 
        className="milestone-scroll"
        style={{
          overflowY: isExpanded && hasOverflow ? 'auto' : 'hidden',
          overflowX: 'hidden',
          height: isExpanded && hasOverflow ? 80 : Math.round(28 * sizeScale),
          transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
        <div style={{
          fontSize: descFs,
          color: isActive ? '#d4d4d8' : '#71717a',
          lineHeight: 1.5,
          marginTop: Math.max(6, Math.round(8 * sizeScale)),
          padding: `0 ${Math.max(2, Math.round(4 * sizeScale))}px`,
          paddingBottom: isExpanded ? 8 : 0,
          fontFamily: 'sans-serif',
          textAlign: isList && isExpanded ? 'left' : 'center',
          transition: 'color 0.3s ease',
        }}>
          {isList && isExpanded ? (
            /* Expanded list with staggered bullet points */
            <ul style={{
              listStyle: 'none', margin: 0, padding: 0,
              display: 'flex', flexDirection: 'column',
              gap: Math.max(2, Math.round(4 * sizeScale)),
            }}>
              {lines.map((line, li) => (
                <li key={li} style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: Math.max(3, Math.round(5 * sizeScale)),
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateX(0)' : 'translateX(-12px)',
                  transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.12 + li * 0.07}s`,
                }}>
                  <span style={{
                    color: col,
                    fontSize: Math.max(8, Math.round(10 * sizeScale)),
                    lineHeight: `${Math.round(descFs * 1.5)}px`,
                    flexShrink: 0,
                    opacity: isExpanded ? 1 : 0,
                    transform: isExpanded ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-90deg)',
                    transition: `all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.18 + li * 0.07}s`,
                  }}>●</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : isList ? (
            /* Compact: join list items with separator */
            <span style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {lines.join(' · ')}
            </span>
          ) : (
            /* Plain text with clamp */
            <span style={{
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 99 : 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {item.desc}
            </span>
          )}
        </div>
      </div>

      {/* Expand hint indicator */}
      {hasOverflow && (
        <div style={{
          fontSize: Math.max(8, Math.round(10 * sizeScale)),
          color: col, marginTop: 4,
          opacity: isExpanded ? 0 : (hovered ? 0.9 : 0.4),
          letterSpacing: '0.05em',
          fontFamily: 'sans-serif',
          fontWeight: 600,
          transition: 'opacity 0.3s ease',
          height: isExpanded ? 0 : 'auto',
          overflow: 'hidden',
        }}>
          ▼ CLICK TO EXPAND
        </div>
      )}
    </div>
  );
}

// ── Main Milestone Section ───────────────────────────────────────────────────
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

  // Dynamic sizes based on item count
  const { cardW, scale, compactH, nodeGap, expandBuffer } = getDynamicSizes(items.length);
  const foH = compactH + expandBuffer;

  return (
    <section id="milestones" className="relative pt-20 pb-0 md:pt-28 md:pb-0 bg-transparent text-white overflow-hidden">
      <style>{`
        .milestone-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .milestone-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .milestone-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .milestone-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
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

        {/* Chart — single proportional SVG */}
        <div ref={wrapRef} className="w-full overflow-x-auto overflow-y-hidden milestone-scroll pb-6" style={{ position: 'relative' }}>
          <div style={{ minWidth: '950px' }}>
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              style={{ width: '100%', display: 'block', overflow: 'visible' }}
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

            {/* Per-node: short connector + dot + card close to node */}
            {nodes.map((nd, i) => {
              const col  = PALETTE[i % PALETTE.length];
              const item = items[i];
              if (!item) return null;

              const cardX = nd.x - cardW / 2;
              const nodeR = 11;

              // ── Card position: directly above or below its node ──
              const foY = nd.isAbove
                ? nd.y - nodeGap - foH
                : nd.y + nodeGap;

              // Short connector line between card edge and node ring
              const connY1 = nd.isAbove
                ? nd.y - nodeGap
                : nd.y + nodeR + 2;
              const connY2 = nd.isAbove
                ? nd.y - nodeR - 2
                : nd.y + nodeGap;

              const enterDelay = 1.25 + i * 0.12;

              return (
                <g key={i}>
                  {/* Short connector line */}
                  <motion.line
                    x1={nd.x} y1={connY1} x2={nd.x} y2={connY2}
                    stroke={col} strokeWidth="1" strokeOpacity="0.45"
                    strokeDasharray="2 3"
                    initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: enterDelay - 0.05, duration: 0.3 }}
                  />

                  {/* Node outer ring */}
                  <motion.circle
                    cx={nd.x} cy={nd.y} r={nodeR}
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

                  {/* Card in foreignObject — close to node */}
                  <motion.g
                    initial={{ opacity: 0, y: nd.isAbove ? 6 : -6 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: enterDelay, duration: 0.4, type: 'spring', stiffness: 200 }}
                  >
                    <foreignObject
                      x={cardX}
                      y={foY}
                      width={cardW}
                      height={foH}
                      style={{ overflow: 'visible' }}
                    >
                      {/* Wrapper: pins card to the edge nearest the node */}
                      <div style={{
                        width: cardW,
                        height: foH,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: nd.isAbove ? 'flex-end' : 'flex-start',
                      }}>
                        <MilestoneCard
                          item={item}
                          col={col}
                          isAbove={nd.isAbove}
                          cardW={cardW}
                          sizeScale={scale}
                        />
                      </div>
                    </foreignObject>
                  </motion.g>
                </g>
              );
            })}
          </svg>
          </div>
        </div>

      </div>
    </section>
  );
}
