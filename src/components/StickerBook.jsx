import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { STICKER_TYPES } from './Items/registry';
import { getStickers, STICKER_EMOJI, STICKER_LABEL, migrateOldScavengerProgress } from '../utils/stickers';

const cleanTitle = (t) => (t || '').replace(/\[[^\]]*\]/g, '').trim();

const StickerBook = ({ items = [], monthKey }) => {
  const [stickers, setStickers] = useState(() => {
    migrateOldScavengerProgress();
    return getStickers();
  });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const slots = useMemo(
    () => items.filter((i) => STICKER_TYPES.includes(i.type)),
    [items]
  );
  const earned = slots.filter((s) => stickers[s.id]).length;
  const total = slots.length;
  const complete = total > 0 && earned === total;

  useEffect(() => {
    const onEarned = (e) => {
      const next = getStickers();
      setStickers(next);
      const item = e.detail?.item;
      setToast({ emoji: STICKER_EMOJI[item?.type] || '⭐', key: Date.now() });
      setTimeout(() => setToast(null), 2600);

      const nowEarned = slots.filter((s) => next[s.id]).length;
      if (slots.length > 0 && nowEarned === slots.length) {
        // Board complete!
        setTimeout(() => {
          const end = Date.now() + 1500;
          const burst = () => {
            confetti({ particleCount: 40, spread: 80, origin: { x: Math.random(), y: 0.3 } });
            if (Date.now() < end) requestAnimationFrame(burst);
          };
          burst();
          setOpen(true);
        }, 900);
      }
    };
    window.addEventListener('sticker-earned', onEarned);
    return () => window.removeEventListener('sticker-earned', onEarned);
  }, [slots]);

  if (total === 0) return null;

  const monthName = monthKey ? format(new Date(monthKey + '-01'), 'MMMM') : '';

  return (
    <>
      {/* Floating sticker counter */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-white border-4 border-yellow-400 rounded-full pl-3 pr-4 py-2 shadow-xl hover:scale-105 transition-transform font-handwriting text-xl"
        title="Sticker book"
      >
        <span className="text-2xl">{complete ? '🏆' : '⭐'}</span>
        <span className="font-bold text-gray-800">{earned} / {total}</span>
      </button>

      {/* "New sticker!" toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 40, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 right-4 z-50 bg-yellow-300 text-gray-900 rounded-2xl px-5 py-3 shadow-2xl font-handwriting text-2xl flex items-center gap-3 pointer-events-none"
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.6 }}
            >
              {toast.emoji}
            </motion.span>
            New sticker! シール ゲット！
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker book */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-amber-50 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative border-8 border-amber-700"
              initial={{ scale: 0.8, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-amber-200"
              >
                <X size={24} />
              </button>

              <h2 className="font-handwriting text-4xl text-amber-900 text-center mb-1">
                {complete ? '🏆 Board Champion! 🏆' : 'My Sticker Book'}
              </h2>
              <p className="text-center text-amber-800 mb-5">
                {complete
                  ? `You finished every activity on the ${monthName} board! すごい！`
                  : `Finish activities on the board to collect stickers! (${earned} / ${total})`}
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {slots.map((s) => {
                  const got = !!stickers[s.id];
                  return (
                    <div
                      key={s.id}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center p-1 ${
                        got ? 'bg-white shadow-md' : 'bg-amber-100 border-2 border-dashed border-amber-300'
                      }`}
                      title={cleanTitle(s.content?.title) || STICKER_LABEL[s.type]}
                    >
                      <span className={`text-4xl ${got ? '' : 'opacity-20 grayscale'}`}>
                        {got ? STICKER_EMOJI[s.type] || '⭐' : '?'}
                      </span>
                      <span className="text-[10px] leading-tight text-amber-900 mt-1 line-clamp-2">
                        {STICKER_LABEL[s.type]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickerBook;
