import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  items: Array<{ url: string; type: 'image' | 'video'; label?: string }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ open, onClose, items, currentIndex, onIndexChange }: LightboxProps) {
  const { t } = useTranslation();
  const current = items[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) onIndexChange(currentIndex + 1);
  }, [currentIndex, items.length, onIndexChange]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, goNext, goPrev]);

  const handleDownload = () => {
    if (!current) return;
    const a = document.createElement('a');
    a.href = current.url;
    a.download = current.label || `download.${current.type === 'video' ? 'mp4' : 'png'}`;
    a.click();
  };

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-white/70">
              {current.label || ''} {items.length > 1 && `(${currentIndex + 1} / ${items.length})`}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={handleDownload} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none" title={t('lightbox.download')}>
                <Download className="h-5 w-5" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none" title={t('lightbox.close')}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Media */}
          <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            {current.type === 'video' ? (
              <video src={current.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
            ) : (
              <img src={current.url} alt={current.label || ''} className="max-w-full max-h-[85vh] rounded-lg object-contain" />
            )}
          </div>

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  title={t('lightbox.previous')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {currentIndex < items.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  title={t('lightbox.next')}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          )}

          {/* Thumbnail strip at bottom */}
          {items.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 rounded-xl bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={`w-12 h-9 rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${i === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center"><span className="text-[8px] text-white">VID</span></div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
