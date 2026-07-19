import React from 'react';
import { Logo } from './Logo';
import { Supergraphic } from './Supergraphic';
import { useAdmin } from '../lib/AdminContext';
import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export function Footer() {
  const { content } = useAdmin();
  const footerData = content.footer;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-transparent text-white pt-32 pb-12 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
          {/* CTA Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <Logo className="h-12 text-brand mb-12" />
            <h3 
              className="text-5xl md:text-7xl font-display font-bold tracking-[-0.04em] leading-[0.9] max-w-md uppercase"
              dangerouslySetInnerHTML={{ __html: (footerData?.title || "LET'S <span class=\"text-brand\">BUILD</span><br/>THE FUTURE").replace(/\n/g, '<br/>') }}
            />
            <div className="mt-12 flex flex-col items-start gap-4">
              <p className="text-zinc-500 text-sm font-ui uppercase tracking-[0.15em]">Ready to start your next project?</p>
              <a 
                href={`mailto:${footerData?.email || 'virashelle@gmail.com'}`} 
                className="group relative inline-flex items-center gap-4 text-xl font-display font-medium tracking-tight"
              >
                <span className="relative z-10 group-hover:text-brand-light transition-colors duration-300">
                  {footerData?.email || 'virashelle@gmail.com'}
                </span>
                <span className="w-8 h-px bg-white/30 group-hover:bg-brand group-hover:w-16 transition-all duration-500" />
              </a>
            </div>
          </motion.div>
          
          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h4 className="text-[10px] uppercase text-zinc-600 font-ui font-bold tracking-[0.25em] mb-8">Contact</h4>
            <ul className="space-y-5 text-sm font-body text-zinc-400">
              {footerData?.phones?.map((phone, i) => (
                <li key={i} className="hover:text-white transition-colors duration-300 cursor-default min-h-[44px] flex items-center">{phone}</li>
              )) || (
                <>
                  <li className="hover:text-white transition-colors">+62 88 1212 8323</li>
                  <li className="hover:text-white transition-colors">+62 851 7333 9084</li>
                </>
              )}
            </ul>
          </motion.div>
          
          {/* Office Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h4 className="text-[10px] uppercase text-zinc-600 font-ui font-bold tracking-[0.25em] mb-8">Office</h4>
            <address className="not-italic text-sm font-body text-zinc-400 leading-relaxed">
              <p>{footerData?.address || 'Jakarta, Indonesia'}</p>
            </address>
          </motion.div>
        </div>
        
        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-white/5 pt-8 gap-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start sm:items-center">
            <div>
              <div className="text-[9px] uppercase text-zinc-600 font-ui font-bold tracking-[0.2em] mb-1">Time</div>
              <div className="text-[11px] font-mono text-zinc-500">UTC {new Date().toISOString().substring(11, 16)}</div>
            </div>
            <div className="w-px h-6 bg-white/5 hidden sm:block" />
            <div>
              <div className="text-[9px] uppercase text-zinc-600 font-ui font-bold tracking-[0.2em] mb-1">Coordinates</div>
              <div className="text-[11px] font-mono text-zinc-500">6.2088° S, 106.8456° E</div>
            </div>
          </div>

          {/* Back to top */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="group flex items-center gap-3 text-zinc-500 hover:text-brand-light transition-colors duration-300"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-ui">Back to top</span>
            <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-brand/40 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(125,57,235,0.15)]">
              <ArrowUp size={14} />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
}
