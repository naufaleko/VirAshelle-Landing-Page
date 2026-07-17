import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAdmin } from '../lib/AdminContext';

const SERVICE_ICONS = [];

function matchesService(category: string, serviceIndex: number): boolean {
  if (!category) return false;
  const lc = category.toLowerCase().trim();
  
  const defaults = ['video', 'motion', '3d', 'graphic'];
  if (defaults.includes(lc)) return lc === defaults[serviceIndex];

  if (lc.includes('video') || lc.includes('editing') || lc.includes('film') || lc.includes('commercial')) return serviceIndex === 0;
  if (lc.includes('motion') || lc.includes('animation') || lc.includes('explainer')) return serviceIndex === 1;
  if (lc.includes('3d') || lc.includes('cgi') || lc.includes('render')) return serviceIndex === 2;
  if (lc.includes('graphic') || lc.includes('branding') || lc.includes('design') || lc.includes('identity')) return serviceIndex === 3;
  
  return false;
}

function VideoPlayer({ src }: { src: string }) {
  if (!src) return null;
  
  let embedUrl = src;
  const isDirectVideo = src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov') || src.includes('cloudinary.com/video/upload');

  if (isDirectVideo) {
    return (
      <video controls className="w-full h-full object-contain bg-black">
        <source src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Handle YouTube
  if (src.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(src);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {}
  } else if (src.includes('youtu.be/')) {
    const videoId = src.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } 
  // Handle Vimeo
  else if (src.includes('vimeo.com/') && !src.includes('player.vimeo.com')) {
    const videoId = src.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }
  // Handle Google Drive
  else if (src.includes('drive.google.com/file/d/')) {
    const videoId = src.split('file/d/')[1]?.split('/')[0];
    if (videoId) embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full border-none"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function getVideoThumbnail(url: string) {
  if (!url) return null;
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch (e) {}
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } else if (url.includes('drive.google.com/file/d/')) {
    const videoId = url.split('file/d/')[1]?.split('/')[0];
    if (videoId) return `https://drive.google.com/thumbnail?id=${videoId}&sz=w1280-h720`;
  }
  return null;
}

export function Services() {
  const { content } = useAdmin();
  const servicesData = content.services;
  const portfolioItems = content.portfolio?.items || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = portfolioItems.find((item) => item.id === selectedId);

  return (
    <section id="services" className="relative py-20 md:py-28 bg-transparent text-white overflow-hidden">
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
          {servicesData.items.map((service, index) => {
            const works = portfolioItems.filter((item) => matchesService(item.category, index));

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
                            {item.type === 'image' ? (
                              <img
                                src={item.src}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full relative bg-zinc-900">
                                {getVideoThumbnail(item.src) ? (
                                  <>
                                    <img
                                      src={getVideoThumbnail(item.src)!}
                                      alt={item.title}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-70 group-hover/card:opacity-50"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-2xl">
                                      <span className="text-4xl text-white opacity-90 group-hover/card:scale-110 transition-transform">▶</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                    <span className="text-2xl">▶</span>
                                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-ui">Video</span>
                                  </div>
                                )}
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
                        No works yet — add portfolio items from the admin dashboard.
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-surface-card border border-white/10 rounded-2xl overflow-y-auto flex flex-col shadow-2xl z-10"
            >
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 z-20 p-2 glass rounded-full text-white hover:text-brand transition-colors"
              >
                <X size={20} />
              </button>
              {selectedItem.type === 'image' ? (
                <div
                  className="flex-1 overflow-hidden relative bg-black flex items-center justify-center"
                  style={{ minHeight: '55vh' }}
                >
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full relative bg-black aspect-video flex-shrink-0">
                  <VideoPlayer src={selectedItem.src} />
                </div>
              )}
              <div className="p-6 md:p-8 bg-surface-card border-t border-white/10">
                <h3 className="text-2xl font-display font-bold tracking-tight">{selectedItem.title}</h3>
                <p className="text-brand-light mt-2 text-sm font-ui uppercase tracking-widest">
                  {selectedItem.category}
                </p>
                {selectedItem.desc && (
                  <p className="text-zinc-400 mt-4 text-sm font-body leading-relaxed whitespace-pre-wrap">
                    {selectedItem.desc}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
