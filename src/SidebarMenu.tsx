import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuProps {
  onNavigate: (section: string) => void;
  className?: string;
}

export default function SidebarMenu({ onNavigate, className }: MenuProps) {
  const [openMinat, setOpenMinat] = useState(true);
  const [openMataKuliah, setOpenMataKuliah] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);

  // Arrow Icon SVG similar to the image
  const ArrowIcon = () => (
    <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16l4-4-4-4"></path>
      <path d="M8 12h8"></path>
    </svg>
  );

  const Item = ({ title, onClick, hasSub, isOpen, border = true }: { title: string; onClick: () => void; hasSub?: boolean; isOpen?: boolean; border?: boolean }) => (
    <div className={`cursor-pointer group flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-colors ${border ? 'border-b border-white/10' : ''}`} onClick={onClick}>
      <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
        <ArrowIcon />
      </div>
      <span className="font-serif tracking-wider font-semibold text-sm uppercase">{title}</span>
    </div>
  );

  const SubItem = ({ title, onClick }: { title: string; onClick: () => void }) => (
    <div className="cursor-pointer px-12 py-3 hover:bg-white/10 transition-colors text-sm font-medium tracking-wide text-white/80 hover:text-white" onClick={onClick}>
      {title}
    </div>
  );

  return (
    <div className={`shrink-0 h-screen bg-gradient-to-b from-academic-primary to-academic-ink text-white shadow-xl overflow-y-auto ${className || 'w-72'}`}>
      <div className="border-t border-white/10 mt-8" />
      
      <Item title="Homepage" onClick={() => onNavigate('home')} />
      <Item title="About Me" onClick={() => onNavigate('about')} />
      <Item title="News" onClick={() => onNavigate('news')} />
      <Item title="Jurnal" onClick={() => onNavigate('publications')} />
      <Item title="Renungan" onClick={() => onNavigate('renungan')} />
      
      <div>
        <Item title="Minat" onClick={() => setOpenMinat(!openMinat)} hasSub isOpen={openMinat} />
        <AnimatePresence>
          {openMinat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/5 border-b border-white/10 overflow-hidden"
            >
              <div className="py-2">
                <SubItem title="Pendidikan Kristen" onClick={() => onNavigate('minat')} />
                <SubItem title="Kepemimpinan Pendidikan" onClick={() => onNavigate('minat')} />
                <SubItem title="Kristen" onClick={() => onNavigate('minat')} />
                <SubItem title="Komunikasi" onClick={() => onNavigate('minat')} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <Item title="Mata Kuliah" onClick={() => setOpenMataKuliah(!openMataKuliah)} hasSub isOpen={openMataKuliah} />
        <AnimatePresence>
          {openMataKuliah && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/5 border-b border-white/10 overflow-hidden"
            >
              <div className="py-2">
                <SubItem title="Bahan Kuliah" onClick={() => onNavigate('teaching')} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <Item title="Products" onClick={() => setOpenProducts(!openProducts)} hasSub isOpen={openProducts} />
        <AnimatePresence>
          {openProducts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/5 border-b border-white/10 overflow-hidden"
            >
              <div className="py-2">
                <SubItem title="Buku" onClick={() => onNavigate('products')} />
                <SubItem title="Bahan Ajar" onClick={() => onNavigate('teaching')} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Item title="Contact Us" onClick={() => onNavigate('contact')} />
      
      <div className="pb-16" />
    </div>
  );
}
