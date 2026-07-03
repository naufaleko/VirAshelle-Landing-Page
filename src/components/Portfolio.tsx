import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';

export function Portfolio() {
  const { content } = useAdmin();
  const portfolioData = content.portfolio;
  const portfolioItems = portfolioData?.items || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = portfolioItems.find((item) => item.id === selectedId);

  return (
    <section id="work" className="py-32 bg-transparent text-white relative overflow-hidden">
      {/* Background abstract supergraphic */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-0 opacity-[0.03] pointer-events-none w-[150vw] h-[150vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-white" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">{portfolioData?.title || "Selected Works."}</h2>
          <p className="text-zinc-400 max-w-sm font-light">
            {portfolioData?.description || "A curation of our most impactful digital architectures and spatial designs."}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              layoutId={`portfolio-container-${item.id}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/10 relative overflow-hidden group cursor-pointer p-4 flex flex-col h-full"
              onClick={() => setSelectedId(item.id)}
            >
              <div className="flex justify-between items-start mb-4 z-10 relative">
                <span className="text-[10px] text-[#7d39eb] uppercase font-bold tracking-widest">{item.category} / 0{index + 1}</span>
                <div className="bg-white/10 px-2 py-1 rounded text-[8px] uppercase tracking-tighter">View Project</div>
              </div>
              <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-900 rounded-lg relative z-10">
                {item.type === 'image' ? (
                  <motion.img
                    layoutId={`portfolio-media-${item.id}`}
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-zinc-500 uppercase tracking-widest text-xs font-medium">Video Content</span>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="mt-4 z-10 relative">
                <h3 className="text-xs font-medium uppercase tracking-tight group-hover:text-[#7d39eb] transition-colors">{item.title}</h3>
              </div>
              <div className="absolute inset-0 bg-[#7d39eb]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
            </motion.div>
          ))}
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
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              layoutId={`portfolio-container-${selectedItem.id}`}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#0C0C0C] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl z-10"
            >
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex-1 overflow-hidden relative bg-black flex items-center justify-center">
                {selectedItem.type === 'image' ? (
                  <motion.img
                    layoutId={`portfolio-media-${selectedItem.id}`}
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={selectedItem.src}
                    className="w-full h-full"
                    allow="autoplay"
                    allowFullScreen
                  />
                )}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 md:p-8 bg-[#0C0C0C] border-t border-white/10"
              >
                <h3 className="text-2xl font-display font-bold tracking-tight">{selectedItem.title}</h3>
                <p className="text-zinc-400 mt-2">{selectedItem.category}</p>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
