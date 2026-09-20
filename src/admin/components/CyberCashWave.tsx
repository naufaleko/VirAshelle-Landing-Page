import React, { useState, useMemo, useRef, useEffect } from 'react';
import { usePresence } from '../lib/usePresence';
import { drawPath, fadeIn, popoverInUp, popoverOutDown } from '../lib/motion';
import { TrendingUp, TrendingDown, Activity, Layers } from 'lucide-react';
import { MonthlyCashflowPoint } from '../types';
import { formatRupiah, formatRpCompact } from '../hooks/useFinance';

export type ChartMode = 'dual' | 'net' | 'income' | 'expense';

interface CyberCashWaveProps {
  data: MonthlyCashflowPoint[];
  height?: number;
  compact?: boolean;
  showControls?: boolean;
  className?: string;
  onSelectMonth?: (point: MonthlyCashflowPoint) => void;
}

// SVG Canvas constants
const VW = 1000;
const PAD_L = 80;
const PAD_R = 50;
const PAD_T = 45;
const PAD_B = 55;

export function CyberCashWave({
  data = [],
  height = 300,
  compact = false,
  showControls = true,
  className = '',
  onSelectMonth,
}: CyberCashWaveProps) {
  const [activeMode, setActiveMode] = useState<ChartMode>('dual');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Guard against empty data
  const validData = useMemo(() => {
    if (!data || data.length === 0) {
      const now = new Date();
      const dynamicMonths: MonthlyCashflowPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('id-ID', { month: 'short' });
        const fullLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        dynamicMonths.push({ month: key, label, fullLabel, income: 0, expense: 0, net: 0 });
      }
      return dynamicMonths;
    }
    return data;
  }, [data]);

  // Compute scale boundaries
  const { maxVal, peakIncomeIdx } = useMemo(() => {
    let max = 10_000_000; // Minimum 10M scale base
    let peakInc = -1;
    let maxInc = 0;
    let peakExp = -1;
    let maxExp = 0;

    validData.forEach((pt, i) => {
      if (pt.income > max) max = pt.income;
      if (pt.expense > max) max = pt.expense;
      if (Math.abs(pt.net) > max) max = Math.abs(pt.net);

      if (pt.income > maxInc) {
        maxInc = pt.income;
        peakInc = i;
      }
      if (pt.expense > maxExp) {
        maxExp = pt.expense;
        peakExp = i;
      }
    });

    // Add 15% headroom for peak labels
    return {
      maxVal: Math.ceil(max * 1.15),
      peakIncomeIdx: maxInc > 0 ? peakInc : -1,
      peakExpenseIdx: maxExp > 0 ? peakExp : -1,
    };
  }, [validData]);

  // Map nodes coordinates
  const usableW = VW - PAD_L - PAD_R;
  const usableH = height - PAD_T - PAD_B;
  const baselineY = PAD_T + usableH;

  const getCoord = (idx: number, val: number) => {
    const x = PAD_L + (validData.length <= 1 ? usableW / 2 : (idx / (validData.length - 1)) * usableW);
    const clampedVal = Math.max(0, Math.min(val, maxVal));
    const y = baselineY - (clampedVal / maxVal) * usableH;
    return { x, y };
  };

  // Node coordinate sets
  const incomeNodes = useMemo(() => {
    return validData.map((pt, i) => ({
      ...getCoord(i, pt.income),
      val: pt.income,
      point: pt,
      idx: i,
    }));
  }, [validData, maxVal, height]);

  const expenseNodes = useMemo(() => {
    return validData.map((pt, i) => ({
      ...getCoord(i, pt.expense),
      val: pt.expense,
      point: pt,
      idx: i,
    }));
  }, [validData, maxVal, height]);

  const netNodes = useMemo(() => {
    return validData.map((pt, i) => {
      // For net, mid-baseline or proportional
      const normalized = Math.max(0, pt.net);
      return {
        ...getCoord(i, normalized),
        val: pt.net,
        point: pt,
        idx: i,
      };
    });
  }, [validData, maxVal, height]);

  // Spline builder (Catmull-Rom / smooth cubic Bezier like Milestone.tsx)
  const buildSpline = (nodes: { x: number; y: number }[]) => {
    if (nodes.length < 2) return '';
    let d = `M ${nodes[0].x},${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const mx = (a.x + b.x) / 2;
      d += ` C ${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
    }
    return d;
  };

  const incomePath = useMemo(() => buildSpline(incomeNodes), [incomeNodes]);
  const expensePath = useMemo(() => buildSpline(expenseNodes), [expenseNodes]);
  const netPath = useMemo(() => buildSpline(netNodes), [netNodes]);

  // Area fills
  const incomeArea = useMemo(() => {
    if (incomeNodes.length < 2) return '';
    return `${incomePath} L ${incomeNodes[incomeNodes.length - 1].x},${baselineY} L ${incomeNodes[0].x},${baselineY} Z`;
  }, [incomePath, incomeNodes, baselineY]);

  const expenseArea = useMemo(() => {
    if (expenseNodes.length < 2) return '';
    return `${expensePath} L ${expenseNodes[expenseNodes.length - 1].x},${baselineY} L ${expenseNodes[0].x},${baselineY} Z`;
  }, [expensePath, expenseNodes, baselineY]);

  const netArea = useMemo(() => {
    if (netNodes.length < 2) return '';
    return `${netPath} L ${netNodes[netNodes.length - 1].x},${baselineY} L ${netNodes[0].x},${baselineY} Z`;
  }, [netPath, netNodes, baselineY]);

  // Active hovered point details. The last hovered index is kept so the HUD card still has
  // data to render while it fades out after the pointer leaves the chart.
  const lastHoveredRef = useRef<number | null>(null);
  if (hoveredIdx !== null) lastHoveredRef.current = hoveredIdx;
  const hudIdx = hoveredIdx ?? lastHoveredRef.current;
  const activePoint = hudIdx !== null ? validData[hudIdx] : null;
  const activeIncomeNode = hudIdx !== null ? incomeNodes[hudIdx] : null;
  const activeExpenseNode = hudIdx !== null ? expenseNodes[hudIdx] : null;
  const hudOpen = hoveredIdx !== null && !!activePoint && !!activeIncomeNode;
  const { mounted: hudMounted, ref: hudRef } = usePresence<HTMLDivElement>(hudOpen, popoverInUp, popoverOutDown);

  return (
    <div 
      ref={containerRef} 
      className={`relative select-none ${className}`}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {/* Top Controls & Legend Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Mode Switcher Tabs */}
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0a0a0f] border border-white/10 rounded-xl" role="group" aria-label="Mode grafik">
            <button
              onClick={() => setActiveMode('dual')}
              aria-pressed={activeMode === 'dual'}
              className={`px-2.5 py-1.5 min-h-[36px] text-xs font-ui rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeMode === 'dual'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers size={13} className="text-[#4BD200]" />
              <span>Masuk &amp; keluar</span>
            </button>
            <button
              onClick={() => setActiveMode('net')}
              aria-pressed={activeMode === 'net'}
              className={`px-2.5 py-1.5 min-h-[36px] text-xs font-ui rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeMode === 'net'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity size={13} className="text-zinc-200" />
              <span>Net</span>
            </button>
            <button
              onClick={() => setActiveMode('income')}
              aria-pressed={activeMode === 'income'}
              className={`px-2.5 py-1.5 min-h-[36px] text-xs font-ui rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeMode === 'income'
                  ? 'bg-[#4BD200]/15 text-[#4BD200] font-semibold border border-[#4BD200]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp size={13} className="text-[#4BD200]" />
              <span>Uang Masuk</span>
            </button>
            <button
              onClick={() => setActiveMode('expense')}
              aria-pressed={activeMode === 'expense'}
              className={`px-2.5 py-1.5 min-h-[36px] text-xs font-ui rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeMode === 'expense'
                  ? 'bg-[#ff3344]/15 text-[#ff3344] font-semibold border border-[#ff3344]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingDown size={13} className="text-[#ff3344]" />
              <span>Uang Keluar</span>
            </button>
          </div>

          {/* Quick Legend Indicators */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {(activeMode === 'dual' || activeMode === 'income') && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4BD200]" />
                <span className="font-ui text-zinc-400">Masuk</span>
              </div>
            )}
            {(activeMode === 'dual' || activeMode === 'expense') && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3344]" />
                <span className="font-ui text-zinc-400">Keluar</span>
              </div>
            )}
            {activeMode === 'net' && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                <span className="font-ui text-zinc-400">Net</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG Container */}
      <div 
        className="relative w-full overflow-x-auto sm:overflow-visible custom-h-scrollbar"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <svg
          viewBox={`0 0 ${VW} ${height}`}
          className="w-full h-auto overflow-visible min-w-[640px] sm:min-w-0"
          style={{ maxHeight: `${height}px` }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Income Neon Gradient */}
            <linearGradient id="cashWaveIncomeLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#328c00" />
              <stop offset="50%" stopColor="#4BD200" />
              <stop offset="100%" stopColor="#7cff33" />
            </linearGradient>

            {/* Income Area Fill */}
            <linearGradient id="cashWaveIncomeArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4BD200" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#4BD200" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#4BD200" stopOpacity="0" />
            </linearGradient>

            {/* Expense Ruby Gradient */}
            <linearGradient id="cashWaveExpenseLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="50%" stopColor="#ff3344" />
              <stop offset="100%" stopColor="#ff6b7a" />
            </linearGradient>

            {/* Expense Area Fill */}
            <linearGradient id="cashWaveExpenseArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff3344" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#ff3344" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ff3344" stopOpacity="0" />
            </linearGradient>

            {/* Net series: neutral, so income green and expense red stay the only semantic hues */}
            <linearGradient id="cashWaveNetLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4d4d8" />
              <stop offset="100%" stopColor="#fafafa" />
            </linearGradient>

            <linearGradient id="cashWaveNetArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fafafa" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
            </linearGradient>

            {/* Cyber Scanning Laser Line */}
            <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4BD200" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#4BD200" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4BD200" stopOpacity="0.05" />
            </linearGradient>

            {/* Cyber Glow Filter */}
            <filter id="cashWaveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Intense Node Pulse Glow */}
            <filter id="nodeIntenseGlow">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background reset hitbox: clears hover if cursor moves into empty chart space */}
          <rect
            x={0}
            y={0}
            width={VW}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(null)}
          />

          {/* ── Background Grid & Telemetry Lines ───────────────────── */}
          {[0.25, 0.5, 0.75].map((f, gi) => {
            const gy = PAD_T + f * usableH;
            const gridVal = Math.round(maxVal * (1 - f));
            return (
              <g key={gi}>
                <line
                  x1={PAD_L}
                  y1={gy}
                  x2={VW - PAD_R}
                  y2={gy}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  strokeOpacity="0.06"
                  strokeDasharray="4 8"
                />
                <text
                  x={PAD_L - 8}
                  y={gy + 3}
                  textAnchor="end"
                  fill="#8b8b95"
                  fontSize="13"
                  fontFamily="monospace"
                >
                  {formatRpCompact(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Baseline Ground Line */}
          <line
            x1={PAD_L}
            y1={baselineY}
            x2={VW - PAD_R}
            y2={baselineY}
            stroke="#4BD200"
            strokeWidth="0.8"
            strokeOpacity="0.2"
          />
          <text
            x={PAD_L - 8}
            y={baselineY + 3}
            textAnchor="end"
            fill="#8b8b95"
            fontSize="13"
            fontFamily="monospace"
          >
            Rp 0
          </text>

          {/* ── Dynamic Spline Areas & Lines ────────────────────────── */}

          {/* 1. EXPENSE WAVE */}
          {(activeMode === 'dual' || activeMode === 'expense') && (
            <g>
              {expenseArea && <FadeArea d={expenseArea} fill="url(#cashWaveExpenseArea)" />}
              {expensePath && <DrawnLine d={expensePath} stroke="url(#cashWaveExpenseLine)" strokeWidth={2.5} />}
            </g>
          )}

          {/* 2. INCOME WAVE */}
          {(activeMode === 'dual' || activeMode === 'income') && (
            <g>
              {incomeArea && <FadeArea d={incomeArea} fill="url(#cashWaveIncomeArea)" />}
              {incomePath && <DrawnLine d={incomePath} stroke="url(#cashWaveIncomeLine)" strokeWidth={2.8} />}
            </g>
          )}

          {/* 3. NET WAVE */}
          {activeMode === 'net' && (
            <g>
              {netArea && <FadeArea d={netArea} fill="url(#cashWaveNetArea)" />}
              {netPath && <DrawnLine d={netPath} stroke="url(#cashWaveNetLine)" strokeWidth={2.8} />}
            </g>
          )}

          {/* ── Scanning Vertical Laser for Hovered Node ─────────────── */}
          {hoveredIdx !== null && (
            <g>
              <line
                x1={incomeNodes[hoveredIdx].x}
                y1={PAD_T}
                x2={incomeNodes[hoveredIdx].x}
                y2={baselineY + 15}
                stroke="url(#laserBeamGrad)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* ── Monthly Nodes & Interactive Touchpoints ──────────────── */}
          {validData.map((pt, i) => {
            const incNode = incomeNodes[i];
            const expNode = expenseNodes[i];
            const netNode = netNodes[i];
            const isHovered = hoveredIdx === i;
            const isPeak = i === peakIncomeIdx && pt.income > 0;

            return (
              <g
                key={i}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role={onSelectMonth ? 'button' : 'img'}
                aria-label={`${pt.fullLabel || pt.label}: masuk ${formatRupiah(pt.income)}, keluar ${formatRupiah(pt.expense)}, net ${formatRupiah(pt.net)}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onFocus={() => setHoveredIdx(i)}
                onBlur={() => setHoveredIdx(null)}
                onClick={() => onSelectMonth && onSelectMonth(pt)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onSelectMonth) {
                    e.preventDefault();
                    onSelectMonth(pt);
                  }
                }}
              >
                {/* Milestone Vertical Connector Line */}
                <line
                  x1={incNode.x}
                  y1={baselineY}
                  x2={incNode.x}
                  y2={incNode.y}
                  stroke="#4BD200"
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  strokeOpacity={isHovered ? 0.6 : 0.2}
                  strokeDasharray="2 3"
                />

                {/* ── Peak Revenue Badge (Milestone Style) ─────────────── */}
                {isPeak && (activeMode === 'dual' || activeMode === 'income') && (
                  <g transform={`translate(${incNode.x}, ${Math.max(PAD_T - 18, incNode.y - 28)})`}>
                    <rect
                      x="-46"
                      y="-11"
                      width="92"
                      height="20"
                      rx="10"
                      fill="#0a0a0f"
                      stroke="#4BD200"
                      strokeWidth="1"
                      strokeOpacity="0.8"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#7cff33"
                      fontSize="11"
                      fontFamily="sans-serif"
                      fontWeight="700"
                      letterSpacing="0.05em"
                    >
                      Puncak masuk
                    </text>
                  </g>
                )}

                {/* ── Income Node ────────────────────────────────────── */}
                {(activeMode === 'dual' || activeMode === 'income') && (
                  <g>
                    {/* Outer Radar Pulse Ring */}
                    <circle
                      cx={incNode.x}
                      cy={incNode.y}
                      r={isHovered ? 14 : 9}
                      fill="none"
                      stroke="#4BD200"
                      strokeWidth={isHovered ? 1.8 : 1}
                      strokeOpacity={isHovered ? 0.9 : 0.4}
                      className="transition-all duration-300"
                    />

                    {/* Glowing Core Dot */}
                    <circle
                      cx={incNode.x}
                      cy={incNode.y}
                      r={isHovered ? 6 : 4}
                      fill="#7cff33"
                      filter={isHovered ? 'url(#nodeIntenseGlow)' : 'none'}
                      className="transition-all duration-300"
                    />
                  </g>
                )}

                {/* ── Expense Node ───────────────────────────────────── */}
                {(activeMode === 'dual' || activeMode === 'expense') && (
                  <g>
                    <circle
                      cx={expNode.x}
                      cy={expNode.y}
                      r={isHovered ? 12 : 7.5}
                      fill="none"
                      stroke="#ff3344"
                      strokeWidth={isHovered ? 1.5 : 1}
                      strokeOpacity={isHovered ? 0.8 : 0.4}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx={expNode.x}
                      cy={expNode.y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ff6b7a"
                      filter={isHovered ? 'url(#nodeIntenseGlow)' : 'none'}
                      className="transition-all duration-300"
                    />
                  </g>
                )}

                {/* ── Net Node ───────────────────────────────────────── */}
                {activeMode === 'net' && (
                  <g>
                    <circle
                      cx={netNode.x}
                      cy={netNode.y}
                      r={isHovered ? 14 : 8}
                      fill="none"
                      stroke="#e4e4e7"
                      strokeWidth="1.5"
                      strokeOpacity={isHovered ? 0.9 : 0.5}
                    />
                    <circle
                      cx={netNode.x}
                      cy={netNode.y}
                      r={isHovered ? 6 : 4}
                      fill="#fafafa"
                      filter={isHovered ? 'url(#nodeIntenseGlow)' : 'none'}
                    />
                  </g>
                )}

                {/* ── X-Axis Month Labels ────────────────────────────── */}
                <text
                  x={incNode.x}
                  y={baselineY + 22}
                  textAnchor="middle"
                  fill={isHovered ? '#4BD200' : '#a1a1aa'}
                  fontSize={isHovered ? '15' : '14'}
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="monospace"
                  className="transition-colors duration-200"
                >
                  {pt.label}
                </text>

                {/* Invisible broad hitbox for easy hover/tap */}
                <rect
                  className="cashwave-hitbox cursor-pointer"
                  x={incNode.x - (usableW / validData.length / 2)}
                  y={PAD_T}
                  width={usableW / validData.length}
                  height={usableH + PAD_B}
                  fill="transparent"
                  pointerEvents="all"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating HUD card on hover */}
          {hudMounted && activePoint && activeIncomeNode && (() => {
            const xRatio = activeIncomeNode.x / VW;
            const activeY = Math.min(
              activeIncomeNode.y,
              activeExpenseNode ? activeExpenseNode.y : activeIncomeNode.y
            );

            const isRightHalf = xRatio > 0.52;
            const isLeftHalf = xRatio < 0.28;
            const isHighNode = activeY < 125;

            const positionStyle: React.CSSProperties = {
              top: isHighNode 
                ? `${Math.min(65, (activeY / height) * 100 + 10)}%` 
                : `${Math.max(8, (activeY / height) * 100 - 10)}%`,
            };

            if (isRightHalf) {
              positionStyle.right = `${Math.max(2, (1 - xRatio) * 100)}%`;
              positionStyle.left = 'auto';
              positionStyle.transform = isHighNode ? 'translateY(0%)' : 'translateY(-100%)';
            } else if (isLeftHalf) {
              positionStyle.left = `${Math.max(2, xRatio * 100)}%`;
              positionStyle.right = 'auto';
              positionStyle.transform = isHighNode ? 'translateY(0%)' : 'translateY(-100%)';
            } else {
              positionStyle.left = `${xRatio * 100}%`;
              positionStyle.transform = isHighNode ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)';
            }

            return (
              <div className="pointer-events-none absolute z-40" style={positionStyle}>
                <div ref={hudRef} className="bg-[#0a0a0f] border border-[#4BD200]/40 rounded-2xl p-3.5 shadow-[0_24px_64px_rgba(0,0,0,0.8)] min-w-[210px] max-w-[240px]">
                {/* Header: Month & Tag */}
                <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-white/10">
                  <span className="font-display font-bold text-white text-sm">
                    {activePoint.fullLabel || activePoint.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#4BD200]/10 text-[#4BD200] border border-[#4BD200]/25 font-semibold">
                    {activePoint.net >= 0 ? 'Surplus' : 'Defisit'}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-zinc-400 font-ui text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-[#4BD200]" />
                      Masuk:
                    </span>
                    <span className="font-bold text-[#4BD200]">
                      +{formatRupiah(activePoint.income)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-zinc-400 font-ui text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-[#ff3344]" />
                      Keluar:
                    </span>
                    <span className="font-bold text-[#ff3344]">
                      -{formatRupiah(activePoint.expense)}
                    </span>
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-white/5 flex items-center justify-between gap-4 text-xs font-bold">
                    <span className="text-zinc-300 font-ui text-[11px]">Net Cash:</span>
                    <span className={activePoint.net >= 0 ? 'text-white' : 'text-red-400'}>
                      {activePoint.net >= 0 ? '+' : ''}{formatRupiah(activePoint.net)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Subtle empty data indicator when all values are 0 */}
        {validData.every(d => d.income === 0 && d.expense === 0) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10">
              <p className="text-xs font-ui text-zinc-300 font-medium">Belum ada pergerakan kas pada periode ini</p>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">Catat transaksi baru untuk melihat visualisasi kurva</p>
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 pt-3 border-t border-white/5 mt-2">
          <span>
            Periode {validData[0]?.fullLabel || validData[0]?.label} sampai {validData[validData.length - 1]?.fullLabel || validData[validData.length - 1]?.label}
          </span>
          <span>
            {peakIncomeIdx >= 0 && validData[peakIncomeIdx]?.income > 0 
              ? `Puncak kas masuk: ${formatRpCompact(validData[peakIncomeIdx].income)} (${validData[peakIncomeIdx].label})` 
              : 'Belum ada kas masuk pada periode ini'}
          </span>
        </div>
      )}
    </div>
  );
}

/** Area fill under a wave; fades in once when the wave mounts (mode switch or first render). */
function FadeArea({ d, fill }: { d: string; fill: string }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const anim = fadeIn(ref.current);
    return () => anim.cancel();
  }, []);
  return <path ref={ref} d={d} fill={fill} />;
}

/** Wave stroke; draws itself from left to right once on mount, the chart's single long motion. */
function DrawnLine({ d, stroke, strokeWidth }: { d: string; stroke: string; strokeWidth: number }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const anim = drawPath(ref.current);
    return () => anim.cancel();
  }, []);
  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#cashWaveGlow)"
    />
  );
}
