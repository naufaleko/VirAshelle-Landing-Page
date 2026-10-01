import React, { useState } from 'react';
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
  const selectedItem = portfolioItems.find((item) => item.id === selectedId);

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
                          src={getOptimizedMediaUrl(item.src)}
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
        {selectedId && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl cursor-pointer"
            />
            <motion.div
              layoutId={`portfolio-container-${selectedItem.id}`}
              className="relative w-full max-w-6xl max-h-[90vh] bg-surface-card border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl z-10"
            >
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 z-20 p-2 glass rounded-full text-white hover:text-brand transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex-1 overflow-hidden relative bg-black flex items-center justify-center" style={{ minHeight: '50vh' }}>
                {!(selectedItem.type === 'video' || isVideoMedia(selectedItem.src)) ? (
                  <motion.img
                    layoutId={`portfolio-media-${selectedItem.id}`}
                    src={getOptimizedMediaUrl(selectedItem.src)}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full aspect-video flex-shrink-0">
                    <VideoPlayer src={selectedItem.src} />
                  </div>
                )}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 md:p-8 bg-surface-card border-t border-white/10"
              >
                <h3 className="text-2xl font-display font-bold tracking-tight">{selectedItem.title}</h3>
                <p className="text-brand-light mt-2 text-sm font-ui uppercase tracking-widest">{selectedItem.category}</p>
                {selectedItem.desc && (
                  <p className="text-zinc-400 mt-4 text-sm font-body leading-relaxed whitespace-pre-wrap">
                    {selectedItem.desc}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
