import React from 'react';
import { Logo } from './Logo';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';
import { motion } from 'motion/react';

export function Footer() {
  const { content } = useAdmin();
  const footerData = content.footer;

  return (
    <footer className="bg-zinc-950 text-white pt-32 pb-12 mt-12 relative px-6 overflow-hidden border-t border-white/5">
      {/* Background abstract supergraphic */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 z-0 opacity-[0.03] pointer-events-none w-[120vw] h-[120vw] md:w-[80vw] md:h-[80vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-[#7d39eb] animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '60s' }} />
      </div>
      
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 z-0 opacity-[0.04] pointer-events-none w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] mix-blend-screen">
        <Supergraphic className="w-full h-full text-white animate-spin-slow" style={{ animationDuration: '45s' }} />
      </div>
      
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-4xl h-64 bg-[#7d39eb]/10 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Logo className="h-12 text-[#7d39eb] mb-12" />
            <h3 
              className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-[0.9] max-w-md uppercase"
              dangerouslySetInnerHTML={{ __html: footerData?.title || "LET'S <span class=\"text-[#7d39eb]\">BUILD</span><br/>THE FUTURE" }}
            />
            <div className="mt-12 flex flex-col items-start gap-4">
              <p className="text-zinc-400 text-lg">Ready to start your next project?</p>
              <a href={`mailto:${footerData?.email || 'virashelle@gmail.com'}`} className="group relative inline-flex items-center gap-4 text-xl font-medium tracking-tight">
                <span className="relative z-10 group-hover:text-[#7d39eb] transition-colors">{footerData?.email || 'virashelle@gmail.com'}</span>
                <span className="w-8 h-px bg-white/30 group-hover:bg-[#7d39eb] group-hover:w-12 transition-all duration-300"></span>
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-[10px] uppercase text-zinc-500 font-bold tracking-[0.2em] mb-8">Contact</h4>
            <ul className="space-y-6 text-sm font-medium uppercase tracking-tight text-zinc-300">
              {footerData?.phones?.map((phone, i) => (
                <li key={i} className="hover:text-white transition-colors">{phone}</li>
              )) || (
                <>
                  <li className="hover:text-white transition-colors">+62 88 1212 8323</li>
                  <li className="hover:text-white transition-colors">+62 851 7333 9084</li>
                </>
              )}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-[10px] uppercase text-zinc-500 font-bold tracking-[0.2em] mb-8">Office</h4>
            <address className="not-italic text-sm space-y-2 font-mono text-zinc-300">
              <p>{footerData?.address || 'Jakarta, Indonesia'}</p>
            </address>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end z-10 border-t border-white/10 pt-8 gap-8"
        >
          <div className="flex flex-col space-y-2">
            <div className="text-[9px] uppercase text-zinc-500 font-bold tracking-[0.2em]">Digital Workspace</div>
            <div className="text-[10px] font-mono text-zinc-400">G-DRIVE_ID: 9812_CREATIVE_ASSETS_MAIN</div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-12 items-start sm:items-center">
            <div className="text-left sm:text-right">
              <div className="text-[9px] uppercase text-zinc-500 font-bold tracking-[0.2em] mb-2">Time</div>
              <div className="text-[10px] font-mono text-zinc-400">UTC {new Date().toISOString().substring(11, 16)}</div>
            </div>
            <div className="w-[1px] h-8 bg-white/10 hidden sm:block"></div>
            <div className="text-left sm:text-right">
              <div className="text-[9px] uppercase text-zinc-500 font-bold tracking-[0.2em] mb-2">Coordinates</div>
              <div className="text-[10px] font-mono text-zinc-400">6.2088° S, 106.8456° E</div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
