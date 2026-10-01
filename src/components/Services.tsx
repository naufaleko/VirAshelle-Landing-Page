import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import { useAdmin } from '../lib/AdminContext';
import { VideoPlayer, getVideoThumbnail, isVideoMedia, getOptimizedMediaUrl } from './VideoPlayer';

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

export function Services() {
  const { content } = useAdmin();
  const servicesData = content.services || { title: '', description: '', items: [] };
  const portfolioItems = content.portfolio?.items || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaAspectRatio, setMediaAspectRatio] = useState<number | null>(null);
  const selectedItem = portfolioItems.find((item) => item.id === selectedId);

  useEffect(() => {
    setMediaAspectRatio(null);
  }, [selectedId]);

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
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-[1px] bg-brand-light/30 group-hover:bg-brand-light transition-colors duration-400" />
                        <span className="text-[10px] uppercase tracking-[0.35em] font-ui text-zinc-500 group-hover:text-brand-light transition-colors duration-400">
                          Service 0{index + 1}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white group-hover:text-gradient transition-all duration-400">
                        {service.title}
                      </h3>
                    </div>

                    {/* Right: Description */}
                    <div className="flex items-center">
                      <p className="text-zinc-400 leading-relaxed font-body text-[15px] md:text-base max-w-xl whitespace-pre-wrap">
                        {service.desc}
                      </p>
                    </div>
                  </div>

                  {/* ── Portfolio Works directly below ── */}
                  {works.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {works.slice(0, 4).map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: '-40px' }}
                          transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => setSelectedId(item.id)}
                          className="group/card relative rounded-xl overflow-hidden cursor-pointer border border-white/8 hover:border-brand/40 transition-all duration-400 hover:shadow-[0_0_24px_rgba(125,57,235,0.15)]"
                        >
                          {/* Thumbnail */}
                          <div className="aspect-[4/3] w-full overflow-hidden relative bg-surface-card">
                            {!(item.type === 'video' || isVideoMedia(item.src)) ? (
                              <img
                                src={getOptimizedMediaUrl(item.src)}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full relative bg-zinc-900 overflow-hidden">
                                {getVideoThumbnail(item.src) ? (
                                  <img
                                    src={getVideoThumbnail(item.src)!}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-80 group-hover/card:opacity-60"
                                    loading="lazy"
                                  />
                                ) : (
                                  <video
                                    src={`${getOptimizedMediaUrl(item.src)}#t=0.001`}
                                    preload="metadata"
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-80 group-hover/card:opacity-60 pointer-events-none"
                                  />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-11 h-11 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-[#4BD200] group-hover/card:scale-110 group-hover/card:bg-[#4BD200] group-hover/card:text-black transition-all duration-300 shadow-xl">
                                    <Play size={18} className="fill-current translate-x-0.5" />
                                  </div>
                                </div>
                                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/90 font-bold uppercase tracking-wider pointer-events-none">
                                  VIDEO
                                </div>
                              </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-3">
                              <span className="text-white font-display font-bold text-xs tracking-tight leading-tight">
                                {item.title}
                              </span>
                              <span className="text-brand-light text-[9px] font-ui uppercase tracking-wider mt-1">
                                {item.category}
                              </span>
                            </div>

                            {/* View icon */}
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-75 group-hover/card:scale-100">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/8 p-8 text-center">
                      <p className="text-zinc-600 text-xs font-ui uppercase tracking-widest">
                        No work published yet.
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
      <AnimatePresence>
        {selectedId && selectedItem && (() => {
          const isVideo = selectedItem.type === 'video' || isVideoMedia(selectedItem.src);

          let maxWidthClass = 'max-w-4xl';
          if (mediaAspectRatio) {
            if (mediaAspectRatio < 0.8) {
              // 9:16 vertical (Reels / TikTok / portrait)
              maxWidthClass = 'max-w-[340px] sm:max-w-[390px]';
            } else if (mediaAspectRatio < 1.25) {
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl cursor-pointer"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`relative w-full ${maxWidthClass} max-h-[90vh] bg-surface-card border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl z-10 transition-[max-width] duration-300`}
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
                    maxHeight: 'min(60vh, 560px)',
                    aspectRatio: mediaAspectRatio ? `${mediaAspectRatio}` : (isVideo ? '16/9' : undefined),
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
                      onAspectRatioChange={(ratio) => setMediaAspectRatio(ratio)}
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Text / Info area */}
                <div className="p-4 sm:p-5 bg-surface-card border-t border-white/10 shrink-0 overflow-y-auto max-h-[28vh]">
                  <h3 className="text-lg sm:text-xl font-display font-bold tracking-tight text-white leading-snug">
                    {selectedItem.title}
                  </h3>
                  <p className="text-brand-light mt-1 text-[10px] sm:text-xs font-ui uppercase tracking-widest font-semibold">
                    {selectedItem.category}
                  </p>
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
      </AnimatePresence>
    </section>
  );
}
