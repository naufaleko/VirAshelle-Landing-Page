import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls, useInView } from 'motion/react';
import { 
  Copy, Check, Layers, Palette, Type, MousePointerClick, 
  Sparkles, Layout, Box, Sliders, Smartphone, Tablet, 
  Monitor, Laptop, ExternalLink, RefreshCw, Eye, Code, 
  Shield, Zap, Award, Target, Puzzle, Building2, Play, 
  ArrowUp, ArrowRight, X, Search, ChevronRight, CheckCircle2,
  Terminal, Activity, Sun, Moon, Info, Compass, Waves, 
  Flame, Cpu, Radio, Sparkle, Download, Package
} from 'lucide-react';
import { useAdmin } from '../lib/AdminContext';
import { Logo } from '../components/Logo';
import { Supergraphic } from '../components/Supergraphic';
import { EditableText } from '../components/EditableText';
import { ImageUpload } from '../components/ImageUpload';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Clients } from '../components/Clients';
import { Services } from '../components/Services';
import { WhyUs } from '../components/WhyUs';
import { Milestone } from '../components/Milestone';
import { Workflow } from '../components/Workflow';
import { About } from '../components/About';
import { KeyPeople } from '../components/KeyPeople';
import { Footer } from '../components/Footer';
import { GlobalBackground } from '../components/GlobalBackground';
import { Link } from 'react-router-dom';

// ── Copy Helper Component ───────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 hover:border-brand/40 transition-all cursor-pointer"
      title={`Copy: ${text}`}
    >
      {copied ? <Check size={12} className="text-brand-light" /> : <Copy size={12} />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}

// ── Color Swatch Card ───────────────────────────────────────────────────
function ColorSwatch({ 
  name, 
  variable, 
  hex, 
  desc, 
  textColor = 'text-white' 
}: { 
  name: string; 
  variable: string; 
  hex: string; 
  desc: string; 
  textColor?: string;
}) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3 group hover:border-brand/40 transition-all duration-300">
      <div 
        className="h-20 rounded-lg w-full flex items-end p-2 border border-white/10 relative overflow-hidden group-hover:scale-[1.02] transition-transform"
        style={{ backgroundColor: hex }}
      >
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md ${textColor}`}>
          {hex}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-display font-bold text-white">{name}</span>
        <span className="text-[11px] font-mono text-zinc-500">{variable}</span>
        <p className="text-xs text-zinc-400 font-body mt-1">{desc}</p>
      </div>
      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <CopyButton text={hex} label="Hex" />
        <CopyButton text={`var(${variable})`} label="Var" />
      </div>
    </div>
  );
}

// ── Component Container Box ─────────────────────────────────────────────
function ComponentBox({ 
  title, 
  category, 
  description, 
  codeSnippet, 
  children 
}: { 
  title: string; 
  category: string; 
  description?: string; 
  codeSnippet?: string; 
  children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden mb-8 group hover:border-white/20 transition-all duration-300">
      {/* Box Header */}
      <div className="p-5 border-b border-white/5 bg-surface-card/70 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] font-ui text-brand-light font-bold">
              {category}
            </span>
          </div>
          <h3 className="text-lg font-display font-bold text-white">{title}</h3>
          {description && <p className="text-xs text-zinc-400 font-body mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {codeSnippet && (
            <>
              <button
                onClick={() => setShowCode(!showCode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-ui uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  showCode 
                    ? 'bg-brand text-white shadow-[0_0_15px_var(--color-brand)]' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <Code size={13} />
                <span>{showCode ? 'Hide Code' : 'JSX Code'}</span>
              </button>
              <CopyButton text={codeSnippet} label="Copy JSX" />
            </>
          )}
        </div>
      </div>

      {/* Code Snippet Drawer */}
      {showCode && codeSnippet && (
        <div className="bg-[#050508] p-4 border-b border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto">
          <pre className="text-[12px] leading-relaxed">{codeSnippet}</pre>
        </div>
      )}

      {/* Component Sandbox / Live Canvas */}
      <div className="p-6 md:p-8 flex items-center justify-center relative min-h-[140px] overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

// ── Interactive Pentagon Bootup Sandbox ─────────────────────────────────
function InteractivePentagon() {
  const [bootKey, setBootKey] = useState(0);
  const wrapCtrl = useAnimationControls();
  const scanCtrl = useAnimationControls();
  const innerCtrl = useAnimationControls();

  const SIZE = 360;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = 120;
  const INNER_R = 65;

  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return { x: CX + OUTER_R * Math.cos(angle), y: CY + OUTER_R * Math.sin(angle) };
  });
  const innerPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return { x: CX + INNER_R * Math.cos(angle), y: CY + INNER_R * Math.sin(angle) };
  });

  const outerPolyStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const innerPolyStr = innerPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const values = ['Integrity', 'Quality', 'Creativity', 'Affordability', 'Flexibility'];

  const triggerBootSequence = async () => {
    setBootKey((prev) => prev + 1);
    await wrapCtrl.start({
      opacity: [0, 0.9, 0, 0.8, 0.05, 0, 0.95, 0.1, 0, 1],
      x: [0, -4, 4, -2, 0, 2, -1, 1, 0, 0],
      filter: ['brightness(2)', 'brightness(1)', 'brightness(3)', 'brightness(1)'],
      transition: { duration: 0.75, times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1], ease: 'linear' },
    });
    scanCtrl.start({
      scaleY: [0, 1],
      y: [`-${SIZE / 2}px`, `${SIZE / 2}px`],
      opacity: [1, 1, 0],
      transition: { duration: 0.8, ease: 'easeIn' },
    });
    innerCtrl.start({
      opacity: [0, 1, 0.4, 1, 0.2, 0, 1],
      x: [0, -2, 2, -1, 1, 0, 0],
      transition: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: 'linear' },
    });
  };

  useEffect(() => {
    triggerBootSequence();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={triggerBootSequence}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:brightness-110 text-white font-display font-bold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_var(--color-brand)] transition-all cursor-pointer"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          <span>Replay CRT Boot Glitch</span>
        </button>
      </div>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Scanline */}
        <motion.div
          animate={scanCtrl}
          initial={{ opacity: 0, scaleY: 0, y: `-${SIZE / 2}px` }}
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: '50%',
            height: 2,
            background: 'linear-gradient(90deg, transparent, #4BD200, #7cff33, #4BD200, transparent)',
            boxShadow: '0 0 12px 4px rgba(75,210,0,0.6)',
          }}
        />

        <motion.div animate={wrapCtrl} initial={{ opacity: 0 }} className="w-full h-full">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" style={{ overflow: 'visible' }}>
            <circle cx={CX} cy={CY} r={OUTER_R + 20} fill="rgba(75,210,0,0.05)" />
            {points.map((pt, i) => (
              <line key={i} x1={CX} y1={CY} x2={pt.x} y2={pt.y} stroke="#4BD200" strokeWidth="1" strokeOpacity="0.3" />
            ))}
            <polygon points={outerPolyStr} fill="none" stroke="#4BD200" strokeWidth="1.5" strokeOpacity="0.6" />
            <polygon points={innerPolyStr} fill="rgba(75,210,0,0.08)" stroke="#7cff33" strokeWidth="1" strokeOpacity="0.4" />
            
            {/* Rotating dashed ring */}
            <g transform={`translate(${CX}, ${CY})`}>
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={OUTER_R + 14}
                  fill="none"
                  stroke="#4BD200"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="5 9"
                />
              </motion.g>
            </g>

            {/* Center circle */}
            <g transform={`translate(${CX}, ${CY})`}>
              <circle cx={0} cy={0} r={18} fill="rgba(75,210,0,0.2)" stroke="#4BD200" strokeWidth="1.5" />
            </g>
            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="monospace" fontWeight="800" fill="#7cff33">
              VRA
            </text>

            {values.map((val, i) => {
              const pt = points[i];
              const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
              const labelR = OUTER_R + 32;
              const lx = CX + labelR * Math.cos(angle);
              const ly = CY + labelR * Math.sin(angle);

              return (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r={12} fill="rgba(75,210,0,0.15)" stroke="#4BD200" strokeWidth="1.2" />
                  <circle cx={pt.x} cy={pt.y} r={6} fill="#7cff33" />
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#e4e4e7" letterSpacing="0.1em">
                    {val.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

// ── Interactive Preloader Simulator ─────────────────────────────────────
function PreloaderSimulator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const startPreloader = () => {
    setIsPlaying(true);
    setProgress(0);
    const duration = 2000;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setProgress(Math.round(eased * 100));

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setIsPlaying(false), 800);
      }
    };

    requestAnimationFrame(tick);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <button
        onClick={startPreloader}
        disabled={isPlaying}
        className="flex items-center gap-2 px-6 py-3 bg-brand hover:brightness-110 disabled:opacity-50 text-white font-display font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_20px_var(--color-brand)] transition-all cursor-pointer"
      >
        <Play size={14} />
        <span>{isPlaying ? 'Running Animation...' : 'Test Preloader Intro Sequence'}</span>
      </button>

      {/* Simulator Viewport Frame */}
      <div className="w-full h-64 bg-black rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        <Logo className="w-12 h-12 text-brand mb-6 animate-pulse" />
        <div className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-zinc-500 tracking-widest">{progress}% COMPLETED</span>

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />
      </div>
    </div>
  );
}

// ── Interactive High Speed DataNode Simulator ───────────────────────────
function DataNodeSimulator() {
  const [nodes, setNodes] = useState([
    { id: 1, top: '25%', duration: 4 },
    { id: 2, top: '50%', duration: 3 },
    { id: 3, top: '75%', duration: 5 },
  ]);

  return (
    <div className="w-full max-w-2xl h-56 bg-black rounded-2xl border border-white/10 relative overflow-hidden flex items-center p-6">
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Live Data Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute left-0 z-10 flex items-center pointer-events-none"
          style={{ top: node.top }}
          animate={{ x: ['-20vw', '100vw'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: node.duration, repeat: Infinity, ease: 'linear' }}
        >
          <div 
            className="h-[2px] opacity-80"
            style={{
              width: '240px',
              backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 4px, var(--color-brand) 4px, var(--color-brand) 10px)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black)'
            }}
          />
          <div className="w-1.5 h-1.5 bg-brand-light shadow-[0_0_15px_3px_var(--color-brand-light)]" />
        </motion.div>
      ))}

      <div className="relative z-20 glass p-4 rounded-xl max-w-xs border border-white/10">
        <span className="text-[10px] font-mono text-brand-light uppercase tracking-widest block mb-1">
          High-Speed Data Nodes
        </span>
        <p className="text-xs text-zinc-400 font-body">
          Subtle shooting telemetry nodes with pixelated particle trails moving across horizontal vector lines.
        </p>
      </div>
    </div>
  );
}

// ── Category Navigation Tabs ────────────────────────────────────────────
type NavCategory = 
  | 'overview' 
  | 'tokens' 
  | 'animations' 
  | 'buttons' 
  | 'brand' 
  | 'cards' 
  | 'cms' 
  | 'sections'
  | 'libraries';

export function UIComponentsPage() {
  const { isAdminMode, setIsAdminMode, content } = useAdmin();
  const [activeTab, setActiveTab] = useState<NavCategory>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewportWidth, setViewportWidth] = useState<'100%' | '1024px' | '768px' | '375px'>('100%');
  const [canvasBg, setCanvasBg] = useState<'black' | 'surface' | 'grid' | 'radial'>('radial');
  const [activeSectionPreview, setActiveSectionPreview] = useState<string>('hero');

  // Filter categories and search items
  const menuItems = [
    { id: 'overview', label: 'Overview & Specs', icon: Compass, count: 'Lab' },
    { id: 'tokens', label: 'Design Tokens', icon: Palette, count: '14+' },
    { id: 'animations', label: 'Background & FX', icon: Waves, count: '6+' },
    { id: 'buttons', label: 'Buttons & CTAs', icon: MousePointerClick, count: '8' },
    { id: 'brand', label: 'Brand & Graphics', icon: Sparkles, count: '4' },
    { id: 'cards', label: 'Cards & Primitives', icon: Box, count: '6' },
    { id: 'cms', label: 'CMS & Form Widgets', icon: Sliders, count: '3' },
    { id: 'sections', label: 'Full Section Blocks', icon: Layout, count: '10' },
    { id: 'libraries', label: 'Library Install Guide', icon: Package, count: '8 Libs' },
  ];

  // Background style helper
  const getCanvasBackground = () => {
    switch (canvasBg) {
      case 'black':
        return 'bg-black';
      case 'surface':
        return 'bg-[#0a0a0f]';
      case 'grid':
        return 'bg-black bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:24px_24px]';
      case 'radial':
      default:
        return 'bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(75,210,0,0.12),rgba(255,255,255,0))]';
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-body selection:bg-brand selection:text-white flex flex-col">
      {/* ── Top Bar / Global Lab Header ── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 text-brand group-hover:drop-shadow-[0_0_12px_var(--color-brand)] transition-all" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider uppercase text-white">VIRASHELLE</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-brand/20 text-brand-light font-bold border border-brand/30">
                  UI LAB v2.0
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-ui uppercase tracking-widest block">Design System & Component Showcase</span>
            </div>
          </Link>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-3">
          {/* Admin Mode Toggle */}
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-ui uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
              isAdminMode 
                ? 'bg-[#7d39eb]/20 border-[#7d39eb] text-[#c4a0ff] shadow-[0_0_15px_rgba(125,57,235,0.3)]' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
            }`}
            title="Toggle Admin Mode to test EditableText hover and inline editors"
          >
            <div className={`w-2 h-2 rounded-full ${isAdminMode ? 'bg-[#c4a0ff] animate-pulse' : 'bg-zinc-600'}`} />
            <span>Admin Mode: {isAdminMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Canvas Background Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
            <span className="text-[10px] uppercase font-ui tracking-wider text-zinc-500 px-1.5">BG</span>
            <button
              onClick={() => setCanvasBg('radial')}
              className={`px-2 py-1 rounded text-[11px] font-ui transition-all cursor-pointer ${canvasBg === 'radial' ? 'bg-brand text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Glow
            </button>
            <button
              onClick={() => setCanvasBg('grid')}
              className={`px-2 py-1 rounded text-[11px] font-ui transition-all cursor-pointer ${canvasBg === 'grid' ? 'bg-brand text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setCanvasBg('black')}
              className={`px-2 py-1 rounded text-[11px] font-ui transition-all cursor-pointer ${canvasBg === 'black' ? 'bg-brand text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Black
            </button>
            <button
              onClick={() => setCanvasBg('surface')}
              className={`px-2 py-1 rounded text-[11px] font-ui transition-all cursor-pointer ${canvasBg === 'surface' ? 'bg-brand text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Surface
            </button>
          </div>

          {/* Viewport Frame Resizer */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setViewportWidth('100%')}
              className={`p-1.5 rounded transition-all cursor-pointer ${viewportWidth === '100%' ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Full Desktop (100%)"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewportWidth('1024px')}
              className={`p-1.5 rounded transition-all cursor-pointer ${viewportWidth === '1024px' ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Laptop (1024px)"
            >
              <Laptop size={14} />
            </button>
            <button
              onClick={() => setViewportWidth('768px')}
              className={`p-1.5 rounded transition-all cursor-pointer ${viewportWidth === '768px' ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Tablet (768px)"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setViewportWidth('375px')}
              className={`p-1.5 rounded transition-all cursor-pointer ${viewportWidth === '375px' ? 'bg-brand text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Mobile (375px)"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Quick Home Link */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:brightness-110 text-white font-display font-bold text-xs tracking-wider uppercase rounded-lg shadow-[0_0_15px_var(--color-brand)] transition-all"
          >
            <span>Live Site</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* ── Main Layout: Sidebar + Canvas ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* ── Sidebar ── */}
        <aside className="w-full md:w-64 bg-[#0a0a0f] border-r border-white/10 flex flex-col p-4 shrink-0 overflow-y-auto max-h-screen">
          {/* Search Box */}
          <div className="relative mb-6">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search component or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand transition-all"
            />
          </div>

          {/* Navigation Category List */}
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-ui uppercase tracking-[0.2em] text-zinc-500 px-3 py-1 block">
              Categories
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavCategory)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-display font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand/15 text-brand-light border border-brand/30 shadow-[0_0_15px_rgba(75,210,0,0.15)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-brand-light' : 'text-zinc-500'} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-brand text-white font-bold' : 'bg-white/5 text-zinc-500'}`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* System Info Box */}
          <div className="mt-8 p-3 rounded-xl bg-surface-card border border-white/5 text-xs text-zinc-500">
            <div className="flex items-center gap-2 text-zinc-400 font-display font-bold mb-1">
              <Activity size={13} className="text-brand" />
              <span>Theme Tokens</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">Tailwind v4 @theme</p>
            <p className="text-[11px] font-mono text-zinc-500">Motion React 12</p>
          </div>
        </aside>

        {/* ── Main Canvas Viewport ── */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-10 transition-all ${getCanvasBackground()}`}>
          
          <div 
            className="mx-auto transition-all duration-300"
            style={{ maxWidth: viewportWidth }}
          >

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 1. OVERVIEW & SPECS TAB                                   */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-10">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-2">
                    VIRASHELLE DESIGN SYSTEM
                  </span>
                  <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Component Laboratory</h1>
                  <p className="text-zinc-400 text-sm md:text-base font-body mt-3 max-w-2xl leading-relaxed">
                    A centralized internal sandbox to preview, stress-test, and grab implementation code for all UI elements, design tokens, interactive micro-animations, and full-page section blocks.
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  <div className="glass p-5 rounded-2xl border border-white/10">
                    <span className="text-zinc-500 text-[10px] font-ui uppercase tracking-widest block">Brand Colors</span>
                    <span className="text-3xl font-display font-bold text-brand-light mt-1 block">5 Palettes</span>
                    <span className="text-[11px] font-mono text-zinc-400 mt-2 block">#4BD200 Primary</span>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/10">
                    <span className="text-zinc-500 text-[10px] font-ui uppercase tracking-widest block">Typography</span>
                    <span className="text-3xl font-display font-bold text-white mt-1 block">4 Families</span>
                    <span className="text-[11px] font-mono text-zinc-400 mt-2 block">Display, Body, UI, Accent</span>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/10">
                    <span className="text-zinc-500 text-[10px] font-ui uppercase tracking-widest block">Core Components</span>
                    <span className="text-3xl font-display font-bold text-white mt-1 block">16+ Items</span>
                    <span className="text-[11px] font-mono text-zinc-400 mt-2 block">Interactive & CMS-Ready</span>
                  </div>
                  <div className="glass p-5 rounded-2xl border border-white/10">
                    <span className="text-zinc-500 text-[10px] font-ui uppercase tracking-widest block">Section Blocks</span>
                    <span className="text-3xl font-display font-bold text-brand mt-1 block">10 Sections</span>
                    <span className="text-[11px] font-mono text-zinc-400 mt-2 block">Zero External CSS</span>
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <h3 className="text-xl font-display font-bold mb-4">Jump to Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('animations')}
                    className="glass p-5 rounded-2xl border border-white/10 hover:border-brand/40 text-left transition-all group cursor-pointer"
                  >
                    <Waves className="text-brand mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-display font-bold text-white text-base">Background Animations & FX</h4>
                    <p className="text-zinc-400 text-xs mt-1">Data nodes, CRT boot glitches, preloader, ambient orbs.</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('tokens')}
                    className="glass p-5 rounded-2xl border border-white/10 hover:border-brand/40 text-left transition-all group cursor-pointer"
                  >
                    <Palette className="text-brand mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-display font-bold text-white text-base">Color Tokens & Fonts</h4>
                    <p className="text-zinc-400 text-xs mt-1">HEX codes, CSS variables, gradients, and font hierarchy scales.</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('libraries')}
                    className="glass p-5 rounded-2xl border border-white/10 hover:border-brand/40 text-left transition-all group cursor-pointer"
                  >
                    <Package className="text-brand mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-display font-bold text-white text-base">Library Install Guide</h4>
                    <p className="text-zinc-400 text-xs mt-1">Step-by-step commands to install Motion, Tailwind, Lucide, etc.</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 2. DESIGN TOKENS TAB                                      */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'tokens' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    DESIGN TOKENS
                  </span>
                  <h2 className="text-3xl font-display font-bold">Color Palettes & System Surfaces</h2>
                </div>

                {/* Color Swatches Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                  <ColorSwatch 
                    name="Brand Primary" 
                    variable="--color-brand" 
                    hex="#4BD200" 
                    desc="Vibrant electric green used for main highlights and key CTAs." 
                  />
                  <ColorSwatch 
                    name="Brand Deep" 
                    variable="--color-brand-deep" 
                    hex="#328c00" 
                    desc="Mid-tone green used for hover gradients and subtle borders." 
                  />
                  <ColorSwatch 
                    name="Brand Dark" 
                    variable="--color-brand-dark" 
                    hex="#194600" 
                    desc="Deep background tint and container ambient fills." 
                  />
                  <ColorSwatch 
                    name="Brand Light" 
                    variable="--color-brand-light" 
                    hex="#7cff33" 
                    desc="High-contrast lime green for overlines and glow accents." 
                  />
                  <ColorSwatch 
                    name="Brand Wash" 
                    variable="--color-brand-wash" 
                    hex="#e5ffd6" 
                    desc="Ultra soft pastel tint for text gradient endpoints." 
                    textColor="text-black"
                  />
                  <ColorSwatch 
                    name="Surface Raised" 
                    variable="--color-surface-raised" 
                    hex="#0a0a0f" 
                    desc="Elevated dark background tone with blue-indigo undertones." 
                  />
                  <ColorSwatch 
                    name="Surface Card" 
                    variable="--color-surface-card" 
                    hex="#111118" 
                    desc="Card backdrop container background with deep contrast." 
                  />
                  <ColorSwatch 
                    name="Surface Glass" 
                    variable="--color-surface-glass" 
                    hex="rgba(17,17,24,0.6)" 
                    desc="Backdrop blur frosted glass token with 60% opacity." 
                  />
                </div>

                {/* Typography Hierarchy Demo */}
                <div className="mb-12">
                  <h3 className="text-2xl font-display font-bold mb-4">Typography Hierarchy</h3>
                  <div className="glass rounded-2xl p-6 md:p-8 space-y-6 border border-white/10">
                    
                    <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Display Headings (Inter Bold)</span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
                          Creative Studio & Visual Architecture
                        </h1>
                      </div>
                      <CopyButton text='font-display font-bold tracking-[-0.03em]' label="Classes" />
                    </div>

                    <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Text Gradient (Utility: .text-gradient)</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient">
                          Crafting Experiences Beyond the Ordinary
                        </h2>
                      </div>
                      <CopyButton text='text-gradient font-display font-bold' label="Classes" />
                    </div>

                    <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Accent Serif Quote (Georgia)</span>
                        <p className="text-xl font-accent italic text-zinc-300">
                          "Combining cutting-edge visual technology with compelling storytelling."
                        </p>
                      </div>
                      <CopyButton text='font-accent italic text-zinc-300' label="Classes" />
                    </div>

                    <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Body Text (Helvetica / Arsenal)</span>
                        <p className="text-zinc-400 font-body text-sm leading-relaxed max-w-xl">
                          No need to juggle multiple vendors for 3D, animation, or video editing. We handle your entire visual ecosystem with pixel precision.
                        </p>
                      </div>
                      <CopyButton text='font-body text-zinc-400 text-sm leading-relaxed' label="Classes" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">UI Overline & Badges (Arsenal / Inter)</span>
                        <span className="inline-flex items-center gap-2 text-xs font-ui uppercase tracking-[0.3em] font-bold text-brand-light">
                          <span className="w-6 h-[1px] bg-brand-light" />
                          OUR CORE CAPABILITIES
                        </span>
                      </div>
                      <CopyButton text='font-ui uppercase tracking-[0.3em] text-brand-light' label="Classes" />
                    </div>

                  </div>
                </div>

                {/* Glassmorphism & Effects */}
                <div>
                  <h3 className="text-2xl font-display font-bold mb-4">Glassmorphism & Glow Effects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl flex flex-col justify-between h-40">
                      <div>
                        <span className="text-xs font-mono text-brand-light block mb-1">.glass</span>
                        <span className="text-white font-display font-bold text-sm">Standard Glass Card</span>
                      </div>
                      <p className="text-zinc-400 text-xs">Backdrop blur 20px with 6% white border.</p>
                      <CopyButton text="glass rounded-2xl" label="Copy Class" />
                    </div>

                    <div className="glass-strong p-6 rounded-2xl flex flex-col justify-between h-40">
                      <div>
                        <span className="text-xs font-mono text-brand-light block mb-1">.glass-strong</span>
                        <span className="text-white font-display font-bold text-sm">Strong Frosted Glass</span>
                      </div>
                      <p className="text-zinc-400 text-xs">Backdrop blur 40px with 85% card opacity.</p>
                      <CopyButton text="glass-strong rounded-2xl" label="Copy Class" />
                    </div>

                    <div className="glass glow-brand p-6 rounded-2xl flex flex-col justify-between h-40 border border-brand/40">
                      <div>
                        <span className="text-xs font-mono text-brand-light block mb-1">.glow-brand</span>
                        <span className="text-white font-display font-bold text-sm">Neon Glow Container</span>
                      </div>
                      <p className="text-zinc-400 text-xs">Multi-layered colored drop shadow.</p>
                      <CopyButton text="glow-brand" label="Copy Class" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 3. BACKGROUND ANIMATIONS & FX TAB                         */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'animations' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    MOTION & BACKGROUND FX
                  </span>
                  <h2 className="text-3xl font-display font-bold">Cybernetic Particles & Glitch Boot FX</h2>
                </div>

                {/* CRT Bootup Glitch Sandbox */}
                <ComponentBox
                  title="Pentagon Radar Glitch Boot-up Sequence"
                  category="Cybernetic Animations"
                  description="3-phase CRT boot animation: Raw screen flicker burst → Scanline sweep → Value node staggered blips."
                  codeSnippet={`// 3-Phase Animation Controls
await wrapCtrl.start({
  opacity: [0, 0.9, 0, 0.8, 0.05, 0, 0.95, 0.1, 0, 1],
  x: [0, -4, 4, -2, 0, 2, -1, 1, 0, 0],
  transition: { duration: 0.75 }
});
scanCtrl.start({ scaleY: [0, 1], y: ['-50%', '50%'] });
innerCtrl.start({ opacity: [0, 1, 0.4, 1, 0.2, 0, 1] });`}
                >
                  <InteractivePentagon />
                </ComponentBox>

                {/* High Speed Data Node Particle Simulator */}
                <ComponentBox
                  title="High Speed Telemetry Data Nodes"
                  category="Particle FX"
                  description="Pixelated gradient trail particles with glowing square heads moving along vector channels."
                  codeSnippet={`<motion.div
  animate={{ x: ['-20vw', '120vw'], opacity: [0, 1, 1, 0] }}
  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
>
  <div className="h-[2px] opacity-70 bg-[repeating-linear-gradient(to_right,transparent,transparent_4px,var(--color-brand)_4px,var(--color-brand)_10px)]" />
  <div className="w-1.5 h-1.5 bg-brand-light shadow-[0_0_15px_2px_rgba(124,255,51,0.8)]" />
</motion.div>`}
                >
                  <DataNodeSimulator />
                </ComponentBox>

                {/* Preloader Intro Sequence Simulator */}
                <ComponentBox
                  title="Site Preloader & Progress Counter"
                  category="Intro Transitions"
                  description="Expo-eased counter with gradient fill bar and seamless clip-path/fade exit."
                  codeSnippet={`const duration = 1800;
const tick = () => {
  const p = Math.min((Date.now() - start) / duration, 1);
  const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
  setProgress(Math.round(eased * 100));
};`}
                >
                  <PreloaderSimulator />
                </ComponentBox>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 4. BUTTONS & INTERACTIVE TAB                              */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'buttons' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    INTERACTIVE CONTROLS
                  </span>
                  <h2 className="text-3xl font-display font-bold">Buttons, Pills & Badges</h2>
                </div>

                {/* Primary CTA with Shine */}
                <ComponentBox
                  title="Hero CTA with Hover Shine"
                  category="Primary Action"
                  description="Rounded pill button with animated linear shine gradient on hover."
                  codeSnippet={`<motion.a 
  href="#" 
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-brand rounded-full text-sm font-display font-semibold tracking-wide text-white overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(75,210,0,0.4)]"
>
  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
  <span className="relative z-10 font-bold">START YOUR PROJECT</span>
  <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
</motion.a>`}
                >
                  <motion.a 
                    href="#hero-cta" 
                    onClick={(e) => e.preventDefault()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-brand rounded-full text-sm font-display font-bold tracking-wide text-white overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(75,210,0,0.4)] cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">START YOUR PROJECT</span>
                    <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.a>
                </ComponentBox>

                {/* Header Contact Button */}
                <ComponentBox
                  title="Header Compact Contact Button"
                  category="Navigation CTA"
                  description="Sharp angular button with ambient neon glow."
                  codeSnippet={`<a 
  href="#" 
  className="px-5 py-2 bg-brand hover:brightness-110 text-white font-display font-bold text-[11px] tracking-[0.1em] uppercase rounded-sm transition-all duration-300 shadow-[0_0_15px_var(--color-brand)] opacity-90 hover:opacity-100"
>
  Contact Us
</a>`}
                >
                  <div className="flex items-center gap-4">
                    <a 
                      href="#contact" 
                      onClick={(e) => e.preventDefault()}
                      className="px-6 py-2.5 bg-brand hover:brightness-110 text-white font-display font-bold text-[11px] tracking-[0.1em] uppercase rounded-sm transition-all duration-300 shadow-[0_0_15px_var(--color-brand)] opacity-90 hover:opacity-100 cursor-pointer"
                    >
                      Contact Us
                    </a>

                    <a 
                      href="#contact-alt" 
                      onClick={(e) => e.preventDefault()}
                      className="px-6 py-2.5 glass hover:border-brand/40 text-brand-light font-display font-bold text-[11px] tracking-[0.1em] uppercase rounded-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(75,210,0,0.2)] cursor-pointer"
                    >
                      Outline Glass
                    </a>
                  </div>
                </ComponentBox>

                {/* Circular Action Icons */}
                <ComponentBox
                  title="Circular Icon Actions"
                  category="Floating & Micro-Actions"
                  description="Back-to-top, close lightbox, and floating admin triggers."
                  codeSnippet={`<button className="group flex items-center gap-3 text-zinc-500 hover:text-brand-light transition-colors duration-300">
  <span className="text-[10px] uppercase tracking-[0.2em] font-ui">Back to top</span>
  <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-brand/40 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(75,210,0,0.15)]">
    <ArrowUp size={14} />
  </div>
</button>`}
                >
                  <div className="flex flex-wrap items-center gap-8">
                    {/* Back to Top */}
                    <button className="group flex items-center gap-3 text-zinc-500 hover:text-brand-light transition-colors duration-300 cursor-pointer">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-ui">Back to top</span>
                      <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-brand/40 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(75,210,0,0.15)]">
                        <ArrowUp size={14} />
                      </div>
                    </button>

                    {/* Lightbox Close */}
                    <button className="p-3 glass rounded-full text-white hover:text-brand hover:border-brand/40 transition-all cursor-pointer">
                      <X size={18} />
                    </button>

                    {/* Play Video Trigger */}
                    <button className="w-12 h-12 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand-light hover:scale-110 transition-transform shadow-[0_0_20px_rgba(75,210,0,0.3)] cursor-pointer">
                      <Play size={18} className="translate-x-0.5" />
                    </button>
                  </div>
                </ComponentBox>

                {/* Category Badges & Pills */}
                <ComponentBox
                  title="Category Badges & Status Tags"
                  category="Labels & Tags"
                  description="Metadata pills used in Portfolio and Services sections."
                  codeSnippet={`<div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-ui text-zinc-400 hover:border-brand/30 hover:text-brand-light transition-all">
  3D Animation / 01
</div>`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] text-brand-light uppercase font-ui font-bold tracking-[0.2em] px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
                      Video Production / 01
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-ui text-zinc-400">
                      View Project
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      EST. 2024
                    </span>
                  </div>
                </ComponentBox>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 5. BRAND & GRAPHICS TAB                                   */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'brand' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    BRAND ASSETS
                  </span>
                  <h2 className="text-3xl font-display font-bold">Logo & Supergraphic Pattern</h2>
                </div>

                {/* SVG Logo Component */}
                <ComponentBox
                  title="VirAshelle SVG Logo"
                  category="Brand Geometry"
                  description="Scalable SVG logo supporting custom colors, hover dropshadows, and dimensions."
                  codeSnippet={`import { Logo } from '../components/Logo';

<Logo className="w-16 h-16 text-brand drop-shadow-[0_0_15px_var(--color-brand)]" />`}
                >
                  <div className="flex flex-wrap items-center justify-around gap-8 w-full">
                    <div className="flex flex-col items-center gap-3">
                      <Logo className="w-14 h-14 text-brand drop-shadow-[0_0_15px_var(--color-brand)]" />
                      <span className="text-[10px] font-mono text-zinc-500">Brand Green</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <Logo className="w-14 h-14 text-white hover:text-brand transition-colors" />
                      <span className="text-[10px] font-mono text-zinc-500">Pure White</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <Logo className="w-14 h-14 text-brand-light drop-shadow-[0_0_20px_var(--color-brand-light)]" />
                      <span className="text-[10px] font-mono text-zinc-500">Brand Light</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <Logo className="w-14 h-14 text-zinc-600" />
                      <span className="text-[10px] font-mono text-zinc-500">Muted Gray</span>
                    </div>
                  </div>
                </ComponentBox>

                {/* Supergraphic SVG Banner */}
                <ComponentBox
                  title="Cybernetic Supergraphic"
                  category="Abstract Architecture"
                  description="Complex vector geometry used in background headers and watermarks."
                  codeSnippet={`import { Supergraphic } from '../components/Supergraphic';

<Supergraphic className="w-full max-w-4xl text-brand/20" />`}
                >
                  <div className="w-full flex flex-col items-center gap-4">
                    <Supergraphic className="w-full max-w-3xl text-brand/30 hover:text-brand/60 transition-colors duration-500" />
                    <span className="text-[11px] font-mono text-zinc-500">viewBox="0 0 1460.44 444.43"</span>
                  </div>
                </ComponentBox>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 6. CARDS & CONTAINERS TAB                                 */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'cards' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    CONTAINER PRIMITIVES
                  </span>
                  <h2 className="text-3xl font-display font-bold">Cards & Feature Layouts</h2>
                </div>

                {/* Workflow Step Card */}
                <ComponentBox
                  title="Workflow Process Step Card"
                  category="Process Timeline"
                  description="Numbered step node with orbiting animated ring and ghost number watermark."
                  codeSnippet={`<div className="glass rounded-2xl p-6 w-full relative overflow-hidden group hover:border-brand/30 transition-all">
  <span className="text-[9px] uppercase tracking-[0.3em] font-ui text-brand-light/70 mb-3 block">Step 01</span>
  <h3 className="text-lg font-display font-bold mb-3 text-white group-hover:text-brand-light transition-colors">Discovery & Brief</h3>
  <p className="text-zinc-500 text-sm">Deep dive into project requirements and aesthetic directions.</p>
</div>`}
                >
                  <div className="w-full max-w-md">
                    <div className="glass rounded-2xl p-6 relative overflow-hidden group hover:border-brand/30 transition-all duration-500">
                      <div className="absolute -bottom-2 -right-2 text-[72px] font-display font-bold text-white/[0.03] leading-none pointer-events-none select-none">
                        01
                      </div>
                      <div className="relative z-10">
                        <span className="text-[9px] uppercase tracking-[0.3em] font-ui text-brand-light/70 mb-2 block font-bold">
                          Step 01
                        </span>
                        <h3 className="text-lg font-display font-bold mb-2 text-white group-hover:text-brand-light transition-colors duration-300">
                          Discovery & Concepting
                        </h3>
                        <p className="text-zinc-400 font-body text-sm leading-relaxed">
                          We dissect your project brief, establish creative moodboards, and align on timeline deliverables.
                        </p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </div>
                  </div>
                </ComponentBox>

                {/* Client Marquee Card */}
                <ComponentBox
                  title="Client Marquee Pill Card"
                  category="Social Proof"
                  description="Rounded pill card with hover glow, white badge logo container, and subtitle."
                  codeSnippet={`<div className="group flex items-center gap-4 glass rounded-full px-6 py-4 min-w-[200px] hover:border-brand/50 hover:shadow-[0_0_20px_rgba(75,210,0,0.15)] transition-all">
  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
    <Building2 size={16} className="text-brand" />
  </div>
  <span className="text-sm font-display font-semibold text-zinc-400 group-hover:text-white transition-colors">
    Partner Brand
  </span>
</div>`}
                >
                  <div className="group flex items-center gap-4 glass rounded-full px-6 py-4 min-w-[240px] hover:border-brand/50 hover:shadow-[0_0_20px_rgba(75,210,0,0.15)] transition-all duration-300 cursor-pointer">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(75,210,0,0.4)] group-hover:ring-2 group-hover:ring-brand transition-all duration-300">
                      <Building2 size={18} className="text-brand" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-display font-semibold text-zinc-300 group-hover:text-white transition-colors">
                        Apex Studio Inc.
                      </span>
                      <span className="text-[10px] text-brand-light font-ui uppercase tracking-wider">Enterprise Client</span>
                    </div>
                  </div>
                </ComponentBox>

                {/* WhyUs Bento Feature Card with Progress */}
                <ComponentBox
                  title="Feature Bento Card with Animated Bar"
                  category="Feature Showcase"
                  description="Glass container with icon badge and bottom animated gradient progress meter."
                  codeSnippet={`<div className="group glass rounded-2xl p-8 hover:border-brand/30 transition-all">
  <div className="flex items-start gap-5">
    <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
      <Zap size={20} className="text-brand-light" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-display font-bold mb-2 text-white">Integrated Visual Solutions</h3>
      <p className="text-zinc-400 text-sm">Everything under one studio roof.</p>
    </div>
  </div>
</div>`}
                >
                  <div className="w-full max-w-lg glass rounded-2xl p-6 md:p-8 hover:border-brand/30 transition-all duration-500">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand/20 group-hover:shadow-[0_0_20px_rgba(75,210,0,0.2)] transition-all">
                        <Zap size={20} className="text-brand-light" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-display font-bold mb-2 text-white group-hover:text-brand-light transition-colors">
                          Result-Driven Creativity
                        </h3>
                        <p className="text-zinc-400 text-sm font-body leading-relaxed">
                          We don't just create visuals; we design them strategically to boost engagement and maximize commercial conversions.
                        </p>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
                          <div className="h-full w-full rounded-full bg-gradient-to-r from-brand to-brand-light" />
                        </div>
                      </div>
                    </div>
                  </div>
                </ComponentBox>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 7. CMS & FORM WIDGETS TAB                                 */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'cms' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    INTERNAL CMS TOOLS
                  </span>
                  <h2 className="text-3xl font-display font-bold">EditableText & Media Handlers</h2>
                  <p className="text-zinc-400 text-sm mt-2">
                    Click the "Admin Mode" switch in the top toolbar to test inline text editing live without logging into Firebase!
                  </p>
                </div>

                {/* EditableText Live Demo */}
                <ComponentBox
                  title="EditableText Component"
                  category="Live CMS Inline Editor"
                  description="Renders regular typography in public mode; turns into click-to-edit input/textarea in Admin mode."
                  codeSnippet={`import { EditableText } from '../components/EditableText';

// Single line heading
<EditableText 
  contentKey="hero" 
  field="title" 
  as="h1" 
  className="text-3xl font-display font-bold" 
/>

// Multiline paragraph
<EditableText 
  contentKey="about" 
  field="content" 
  as="div" 
  className="text-base text-zinc-300 font-body" 
  multiline 
/>`}
                >
                  <div className="w-full max-w-xl flex flex-col gap-6">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">Live Interactive Heading Field</span>
                      <EditableText
                        contentKey="hero"
                        field="title"
                        as="h2"
                        className="text-2xl md:text-3xl font-display font-bold text-white"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">Live Subtitle Field</span>
                      <EditableText
                        contentKey="hero"
                        field="subtitle"
                        as="p"
                        className="text-sm text-zinc-400 font-body leading-relaxed"
                        multiline
                      />
                    </div>
                  </div>
                </ComponentBox>

                {/* Image Upload Component */}
                <ComponentBox
                  title="ImageUpload URL Transformer"
                  category="Media Management"
                  description="Auto-converts Google Drive share links to high-speed CDN thumbnails with fallback handlers."
                  codeSnippet={`import { ImageUpload } from '../components/ImageUpload';

<ImageUpload
  currentUrl="https://images.unsplash.com/photo-1558655146-d09347e92766"
  onUploadSuccess={(url) => console.log('Updated URL:', url)}
  path="portfolio"
/>`}
                >
                  <div className="w-full max-w-md">
                    <ImageUpload
                      currentUrl="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop"
                      onUploadSuccess={(url) => {}}
                      path="preview"
                    />
                  </div>
                </ComponentBox>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 8. FULL SECTION BLOCKS TAB                                */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'sections' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                      SECTION SHOWCASE
                    </span>
                    <h2 className="text-3xl font-display font-bold">Isolated Page Blocks</h2>
                  </div>

                  {/* Section Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                    {[
                      { id: 'hero', label: 'Hero' },
                      { id: 'clients', label: 'Clients' },
                      { id: 'services', label: 'Services' },
                      { id: 'why-us', label: 'Why Us' },
                      { id: 'milestone', label: 'Milestone' },
                      { id: 'workflow', label: 'Workflow' },
                      { id: 'about', label: 'About' },
                      { id: 'team', label: 'Team' },
                      { id: 'footer', label: 'Footer' },
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSectionPreview(sec.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer ${
                          activeSectionPreview === sec.id
                            ? 'bg-brand text-white shadow-[0_0_12px_var(--color-brand)]'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Preview Container Frame */}
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black relative shadow-2xl">
                  <div className="px-4 py-2 bg-surface-card border-b border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                      Live Component: &lt;{activeSectionPreview.toUpperCase()} /&gt;
                    </span>
                    <span>Isolated Render</span>
                  </div>

                  <div className="relative">
                    {activeSectionPreview === 'hero' && <Hero />}
                    {activeSectionPreview === 'clients' && <Clients />}
                    {activeSectionPreview === 'services' && <Services />}
                    {activeSectionPreview === 'why-us' && <WhyUs />}
                    {activeSectionPreview === 'milestone' && <Milestone />}
                    {activeSectionPreview === 'workflow' && <Workflow />}
                    {activeSectionPreview === 'about' && <About />}
                    {activeSectionPreview === 'team' && <KeyPeople />}
                    {activeSectionPreview === 'footer' && <Footer />}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* 9. LIBRARY & DEPENDENCIES GUIDE TAB                       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeTab === 'libraries' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light font-bold block mb-1">
                    DEPENDENCIES & SETUP
                  </span>
                  <h2 className="text-3xl font-display font-bold">Libraries & Installation Commands</h2>
                  <p className="text-zinc-400 text-sm mt-2">
                    Daftar lengkap library yang digunakan di project VirAshelle beserta panduan instalasi dan fungsinya.
                  </p>
                </div>

                {/* One-Click Full Install Command Box */}
                <div className="glass rounded-2xl p-6 md:p-8 border border-brand/30 glow-brand mb-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-brand-light uppercase tracking-widest block mb-1">
                        📦 Fast 1-Line Installation
                      </span>
                      <h3 className="text-xl font-display font-bold text-white">Install All Production Dependencies</h3>
                    </div>
                    <CopyButton 
                      text="npm install motion animejs lucide-react react-router-dom recharts firebase @google/genai dotenv express" 
                      label="Copy npm command" 
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-black font-mono text-xs text-brand-light border border-white/10 overflow-x-auto">
                    <code>npm install motion animejs lucide-react react-router-dom recharts firebase @google/genai dotenv express</code>
                  </div>

                  <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <span className="text-xs font-mono text-zinc-400">Dev Dependencies (Tailwind v4, TypeScript, Vite)</span>
                    <CopyButton 
                      text="npm install -D tailwindcss @tailwindcss/vite @types/react @types/react-dom @types/node tsx typescript vite" 
                      label="Copy dev command" 
                    />
                  </div>
                </div>

                {/* Detailed Library Breakdown Table */}
                <h3 className="text-2xl font-display font-bold mb-4">Detailed Library Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  
                  {/* Motion React */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">motion (Framer Motion v12)</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^12.23.24</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Library animasi utama untuk hardware-accelerated transitions, 3D card tilts, timeline sequences, spring physics, dan glitch boot sequences.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install motion</span>
                      <CopyButton text="npm install motion" />
                    </div>
                  </div>

                  {/* anime.js */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">animejs (anime.js v4)</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^4.5.0</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Mesin animasi admin dashboard. Semua preset (popover, modal, collapsible, draw chart) ada di satu modul <code className="font-mono text-zinc-300">src/admin/lib/motion.ts</code>; landing page tetap memakai motion.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install animejs</span>
                      <CopyButton text="npm install animejs" />
                    </div>
                  </div>

                  {/* Lucide React */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">lucide-react</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^0.546.0</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Kumpulan ribuan vector SVG icons yang clean, modern, dan ultra ringan untuk button icons, controls, dan telemetry tags.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install lucide-react</span>
                      <CopyButton text="npm install lucide-react" />
                    </div>
                  </div>

                  {/* Tailwind CSS v4 */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">tailwindcss & @tailwindcss/vite</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">v4.1.14</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Engine styling modern Tailwind CSS v4 dengan sistem `@theme` CSS variables tanpa perlu file `tailwind.config.js` jadul.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install tailwindcss @tailwindcss/vite</span>
                      <CopyButton text="npm install tailwindcss @tailwindcss/vite" />
                    </div>
                  </div>

                  {/* React Router DOM */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">react-router-dom</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^7.18.1</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Client-side router untuk navigasi antara landing page (`/`), internal admin dashboard (`/admin`), dan component laboratory (`/UIComponents`).
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install react-router-dom</span>
                      <CopyButton text="npm install react-router-dom" />
                    </div>
                  </div>

                  {/* Firebase */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">firebase</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^12.15.0</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Cloud Firestore & Authentication SDK untuk CMS real-time database dan autentikasi admin login.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install firebase</span>
                      <CopyButton text="npm install firebase" />
                    </div>
                  </div>

                  {/* Recharts */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">recharts</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^3.9.1</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Composable SVG charting library untuk menampilkan diagram milestone, metrics performa, dan visual stats.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install recharts</span>
                      <CopyButton text="npm install recharts" />
                    </div>
                  </div>

                  {/* Google Gen AI SDK */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">@google/genai</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">^2.4.0</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Official Google GenAI SDK untuk integrasi model Gemini AI dalam auto-generating copywriting dan konten website.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install @google/genai</span>
                      <CopyButton text="npm install @google/genai" />
                    </div>
                  </div>

                  {/* Express & TSX */}
                  <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-brand/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-display font-bold text-white">express & tsx</span>
                        <span className="text-[10px] font-mono text-brand-light bg-brand/10 px-2 py-0.5 rounded border border-brand/20">v4.21 / v4.21</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-body leading-relaxed mb-4">
                        Node.js server & TypeScript execution engine untuk serving production build dan API proxying.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500">npm install express dotenv</span>
                      <CopyButton text="npm install express dotenv" />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
