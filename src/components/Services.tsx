import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import { useAdmin } from '../lib/AdminContext';
import { VideoPlayer, getVideoThumbnail, isVideoMedia, getOptimizedMediaUrl, isLikelyVerticalMedia } from './VideoPlayer';

const SERVICE_ICONS = [];

function matchesService(category: string, serviceIndex: number, serviceTitle?: string): boolean {
  if (!category) return false;
  const lc = category.toLowerCase().trim();
  
  if (serviceTitle && lc === serviceTitle.toLowerCase().trim()) return true;

  const defaults = ['video', 'motion', '3d', 'graphic'];
  if (defaults.includes(lc)) return lc === defaults[serviceIndex];

  if (lc.includes('video') || lc.includes('editing') || lc.includes('film') || lc.includes('commercial')) return serviceIndex === 0;
  if (lc.includes('motion') || lc.includes('animation') || lc.includes('explainer')) return serviceIndex === 1;
  if (lc.includes('3d') || lc.includes('cgi') || lc.includes('render')) return serviceIndex === 2;
  if (lc.includes('graphic') || lc.includes('branding') || lc.includes('design') || lc.includes('identity')) return serviceIndex === 3;
  
  return false;
}

function ServiceMarqueeRow({
  items,
  reverse = false,
  onSelect,
}: {
  items: any[];
  reverse?: boolean;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;

  // Ensure enough items to fill track on large screens without gaps before looping
  let base = [...items];
  while (base.length < 6) {
    base = [...base, ...items];
  }
  const displayItems = [...base, ...base];
  const duration = Math.max(25, Math.min(85, base.length * 4.5));

  return (
    <div className="relative w-full overflow-hidden marquee-pause py-2 group/track">
      {/* Edge Fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

      {/* Scrolling Track */}
      <div
        className={`flex gap-4 shrink-0 marquee-track ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
        style={{
          width: 'max-content',
          animationDuration: `${duration}s`,
        }}
      >
        {displayItems.map((item, idx) => {
          const isVideo = item.type === 'video' || isVideoMedia(item.src);
          const thumb = item.thumbnail_url || getVideoThumbnail(item.src);

          return (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => onSelect(item.id)}
              className="group/card relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border border-white/8 hover:border-[#4BD200]/50 transition-all duration-300 hover:shadow-[0_0_24px_rgba(75,210,0,0.18)] bg-zinc-950 shrink-0"
            >
              {thumb ? (
                <img
                  src={getOptimizedMediaUrl(thumb)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 opacity-80 group-hover/card:opacity-60"
                  loading="lazy"
                />
              ) : !isVideo ? (
                <img
                  src={getOptimizedMediaUrl(item.src)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 opacity-80 group-hover/card:opacity-60"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full relative bg-zinc-900 overflow-hidden">
                  <video
                    src={`${getOptimizedMediaUrl(item.src)}#t=0.001`}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 opacity-80 group-hover/card:opacity-60 pointer-events-none"
                  />
                </div>
              )}

              {/* Video Badge & Play Icon */}
              {isVideo && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-11 h-11 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-[#4BD200] group-hover/card:scale-110 group-hover/card:bg-[#4BD200] group-hover/card:text-black transition-all duration-300 shadow-xl">
                      <Play size={18} className="fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/90 font-bold uppercase tracking-wider pointer-events-none">
                    VIDEO
                  </div>
                </>
              )}

              {/* Bottom Title & Category Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end pointer-events-none">
                <span className="text-white font-display font-semibold text-xs tracking-tight leading-tight line-clamp-1 group-hover/card:text-[#7cff33] transition-colors">
                  {item.title}
                </span>
                <span className="text-[#7cff33] text-[9px] font-ui uppercase tracking-wider mt-0.5 font-medium">
                  {item.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Services() {
  const { content } = useAdmin();
  const servicesData = content.services || { title: '', description: '', items: [] };
  const portfolioItems = content.portfolio?.items || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaAspectRatio, setMediaAspectRatio] = useState<number | null>(null);
  const selectedItem = portfolioItems.find((item) => item.id === selectedId);

  useEffect(() => {
    if (selectedItem) {
      if (isLikelyVerticalMedia(selectedItem.src, selectedItem.title)) {
        setMediaAspectRatio(9 / 16);
      } else {
        setMediaAspectRatio(null);
      }
    } else {
      setMediaAspectRatio(null);
    }
  }, [selectedId, selectedItem]);

  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedId(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedId]);

  return (
    <section id="services" className="relative py-20 md:py-28 bg-transparent text-white overflow-hidden section-deferred">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ── Section Header ── */}
        <div className="flex flex-col items-center text-center gap-6 mb-20 w-full">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6 w-full"
            >
              <span className="w-8 h-[1px] bg-brand-light" />
              {servicesData.description}
              <span className="w-8 h-[1px] bg-brand-light" />
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
            >
              {servicesData.title}
            </motion.h2>
          </div>
        </div>

        {/* ── Service Rows ── */}
        <div className="flex flex-col gap-0">
          {(servicesData.items || []).map((service, index) => {
            const works = portfolioItems.filter((item) => matchesService(item.category, index, service.title));

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                {/* Divider */}
                <div className="w-full h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                <div className="py-10 md:py-12">
                  {/* ── Service Info Row ── */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16 mb-8 md:mb-10">

                    {/* Left: Number + Title + Icon */}
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-8 h-[1px] bg-brand-light/30 group-hover:bg-brand-light transition-colors duration-400" />
                        <span className="text-[10px] uppercase tracking-[0.35em] font-ui text-zinc-500 group-hover:text-brand-light transition-colors duration-400">
                          Service 0{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white group-hover:text-gradient transition-all duration-400">
                          {service.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#7cff33] font-semibold">
                          {works.length} Karya
                        </span>
                      </div>
                    </div>

                    {/* Right: Description */}
                    <div className="flex flex-col justify-center">
                      <p className="text-zinc-400 leading-relaxed font-body text-[15px] md:text-base max-w-xl whitespace-pre-wrap">
                        {service.desc}
                      </p>
                      <span className="text-[11px] font-mono text-zinc-500 mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4BD200] animate-pulse" />
                        Arahkan kursor untuk pause • Klik untuk melihat karya
                      </span>
                    </div>
                  </div>

                  {/* ── Portfolio Works Auto-Scroller directly below ── */}
                  {works.length > 0 ? (
                    <div className="flex flex-col gap-3 -mx-6 px-6 sm:-mx-0 sm:px-0">
                      {works.length > 16 ? (
                        <>
                          <ServiceMarqueeRow
                            items={works.slice(0, Math.ceil(works.length / 2))}
                            reverse={index % 2 === 1}
                            onSelect={(id) => setSelectedId(id)}
                          />
                          <ServiceMarqueeRow
                            items={works.slice(Math.ceil(works.length / 2))}
                            reverse={index % 2 === 0}
                            onSelect={(id) => setSelectedId(id)}
                          />
                        </>
                      ) : (
                        <ServiceMarqueeRow
                          items={works}
                          reverse={index % 2 === 1}
                          onSelect={(id) => setSelectedId(id)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/8 p-8 text-center">
                      <p className="text-zinc-600 text-xs font-ui uppercase tracking-widest">
                        Belum ada karya yang dipublikasikan.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Final bottom divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>
      </div>

      {/* ── Lightbox Modal ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedId && selectedItem && (() => {
            const isVideo = selectedItem.type === 'video' || isVideoMedia(selectedItem.src);
            const isVertical = mediaAspectRatio !== null && mediaAspectRatio < 0.85;

            let maxWidthClass = 'max-w-4xl';
            if (isVertical) {
              // 9:16 vertical (Reels / TikTok / portrait)
              maxWidthClass = 'max-w-[340px] sm:max-w-[380px]';
            } else if (mediaAspectRatio) {
              if (mediaAspectRatio < 1.25) {
                // 1:1 square / 4:5
                maxWidthClass = 'max-w-md sm:max-w-lg';
              } else if (mediaAspectRatio > 1.9) {
                // 21:9 ultrawide
                maxWidthClass = 'max-w-5xl';
              } else {
                // 16:9 / 4:3 standard landscape
                maxWidthClass = 'max-w-3xl lg:max-w-4xl';
              }
            }

            return (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(null)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-xl cursor-pointer"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative w-full ${maxWidthClass} max-h-[88vh] bg-surface-card border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl z-10 transition-[max-width] duration-300 my-auto`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Tutup popup"
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-black/95 border border-white/20 text-white hover:text-[#4BD200] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  {/* Media area */}
                  <div
                    className="w-full relative bg-black flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                      maxHeight: isVertical ? 'min(68vh, 580px)' : 'min(62vh, 540px)',
                      aspectRatio: mediaAspectRatio
                        ? `${mediaAspectRatio}`
                        : (isVideo ? (isLikelyVerticalMedia(selectedItem.src, selectedItem.title) ? '9/16' : '16/9') : undefined),
                    }}
                  >
                    {!isVideo ? (
                      <img
                        src={getOptimizedMediaUrl(selectedItem.src)}
                        alt={selectedItem.title}
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth && img.naturalHeight) {
                            setMediaAspectRatio(img.naturalWidth / img.naturalHeight);
                          }
                        }}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <VideoPlayer
                        src={selectedItem.src}
                        title={selectedItem.title}
                        onAspectRatioChange={(ratio) => setMediaAspectRatio(ratio)}
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  {/* Text / Info area */}
                  <div className={`p-4 ${isVertical ? 'sm:p-4' : 'sm:p-5'} bg-surface-card border-t border-white/10 shrink-0 overflow-y-auto max-h-[22vh]`}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={`${isVertical ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-display font-bold tracking-tight text-white leading-snug line-clamp-2`}>
                        {selectedItem.title}
                      </h3>
                      <span className="text-brand-light text-[9px] sm:text-[10px] font-ui uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-brand-light/10 border border-brand-light/20 shrink-0">
                        {selectedItem.category}
                      </span>
                    </div>
                    {selectedItem.desc && (
                      <p className="text-zinc-400 mt-2 text-xs sm:text-sm font-body leading-relaxed whitespace-pre-wrap">
                        {selectedItem.desc}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
