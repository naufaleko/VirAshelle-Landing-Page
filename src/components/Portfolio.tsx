import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';
import { VideoPlayer, getVideoThumbnail, isVideoMedia, getOptimizedMediaUrl } from './VideoPlayer';

export function Portfolio() {
  const { content } = useAdmin();
  const portfolioData = content.portfolio;
  const portfolioItems = portfolioData?.items || [];
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
    <section id="work" className="relative py-32 md:py-40 bg-transparent text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-ui text-brand-light mb-6 block"
            >
              <span className="w-8 h-[1px] bg-brand-light" />
              Portfolio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-[-0.03em]"
            >
              {portfolioData?.title || "Selected Works."}
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 max-w-sm font-body font-light text-sm"
          >
            {portfolioData?.description || "A curation of our most impactful digital architectures and spatial designs."}
          </motion.p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {portfolioItems.map((item, index) => {
            const isVideo = item.type === 'video' || isVideoMedia(item.src);

            return (
              <motion.div
                key={item.id}
                layoutId={`portfolio-container-${item.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group glass rounded-2xl overflow-hidden cursor-pointer hover:border-brand/30 transition-all duration-500"
                onClick={() => setSelectedId(item.id)}
              >
                {/* Category tag */}
                <div className="flex justify-between items-center p-5 pb-0 relative z-10">
                  <span className="text-[10px] text-brand-light uppercase font-ui font-bold tracking-[0.2em]">
                    {item.category} / 0{index + 1}
                  </span>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-ui text-zinc-400 group-hover:border-brand/30 group-hover:text-brand-light transition-all duration-300">
                    View
                  </div>
                </div>

                {/* Image / Video Card */}
                <div className="p-4">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl relative bg-zinc-950">
                    {!isVideo ? (
                      <motion.img
                        layoutId={`portfolio-media-${item.id}`}
                        src={getOptimizedMediaUrl(item.src)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                    <div className="w-full h-full relative group/vid">
                      {getVideoThumbnail(item.src) ? (
                        <img
                          src={getVideoThumbnail(item.src)!}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={`${getOptimizedMediaUrl(item.src)}#t=0.001`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}
                      {/* Play badge overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-[#4BD200] group-hover:scale-110 group-hover:bg-[#4BD200] group-hover:text-black transition-all duration-300 shadow-2xl">
                          <Play size={18} className="fill-current translate-x-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/80 font-bold uppercase tracking-wider">
                        VIDEO
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <span className="text-white font-display font-bold text-lg tracking-tight">{item.title}</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="px-5 pb-5">
                <h3 className="text-sm font-display font-semibold uppercase tracking-tight text-zinc-400 group-hover:text-white transition-colors duration-300">
                  {item.title}
                </h3>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
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
                    <motion.img
                      layoutId={`portfolio-media-${selectedItem.id}`}
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
