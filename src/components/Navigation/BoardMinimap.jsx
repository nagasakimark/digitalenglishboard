import React, { useEffect, useState, useCallback } from 'react';
import { STICKER_TYPES } from '../Items/registry';
import { STICKER_EMOJI, getStickers } from '../../utils/stickers';

const BOARD_WIDTH = 1366;
const MAP_W = 64;

const approxSize = (item) => {
  const w = parseInt(item.width, 10) || ({ calendar: 420, advent: 380, quiz: 260, crossword: 260, wordsearch: 260 }[item.type] || 250);
  const h = item.size?.height || ({ calendar: 420, advent: 420, 'local-video': w * 0.75 + 60, image: w * 0.9 } [item.type] || 220);
  return { w, h };
};

/**
 * A little map of the whole board on the right edge.
 * Tap it to jump around a tall board on the Chromebook's short screen.
 */
const BoardMinimap = ({ items = [], boardHeight }) => {
  const [view, setView] = useState({ top: 0, height: 1, scale: 1, client: 0 });
  const [stickers, setStickers] = useState(getStickers);

  const getScroller = () => document.querySelector('.cork-board-scroll-area');

  const update = useCallback(() => {
    const el = getScroller();
    if (!el) return;
    const scale = el.clientWidth / BOARD_WIDTH;
    setView({ top: el.scrollTop / scale, height: el.clientHeight / scale, scale, client: el.clientHeight });
  }, []);

  useEffect(() => {
    const el = getScroller();
    if (!el) return undefined;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const onSticker = () => setStickers(getStickers());
    window.addEventListener('sticker-earned', onSticker);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('sticker-earned', onSticker);
    };
  }, [update, items]);

  if (!boardHeight || view.height <= 0 || boardHeight < view.height * 1.3) return null;

  const mapH = Math.min(window.innerHeight - 150, 420);
  const k = mapH / boardHeight; // board px → map px
  const kx = MAP_W / BOARD_WIDTH;

  const jump = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = (e.clientY - rect.top) / k; // board coordinate
    const el = getScroller();
    if (el) el.scrollTo({ top: Math.max(0, (y - view.height / 2) * view.scale), behavior: 'smooth' });
  };

  return (
    <div
      className="fixed right-2 z-30 rounded-xl bg-white/70 backdrop-blur border-2 border-amber-800/60 shadow-lg cursor-pointer overflow-hidden"
      style={{ top: 70, width: MAP_W + 8, height: mapH + 8, padding: 4 }}
      onClick={jump}
      title="Board map — tap to jump / タップで移動"
    >
      <div className="relative" style={{ width: MAP_W, height: mapH }}>
        {items.map((item) => {
          const { w, h } = approxSize(item);
          const game = STICKER_TYPES.includes(item.type) && item.type !== 'scavenger-item';
          if (item.type === 'scavenger-item') return null; // keep hidden items secret!
          const done = game && stickers[item.id];
          return (
            <div
              key={item.id}
              className={`absolute rounded-sm flex items-center justify-center ${game ? (done ? 'bg-green-400' : 'bg-yellow-400') : 'bg-amber-700/40'}`}
              style={{
                left: item.position.x * kx,
                top: item.position.y * k,
                width: Math.max(6, w * kx),
                height: Math.max(5, h * k),
                fontSize: 9,
              }}
            >
              {game && h * k > 9 ? STICKER_EMOJI[item.type] : null}
            </div>
          );
        })}
        {/* the part of the board you can see now */}
        <div
          className="absolute left-0 right-0 border-2 border-blue-600 bg-blue-500/15 rounded pointer-events-none transition-[top] duration-75"
          style={{ top: view.top * k, height: Math.max(10, view.height * k) }}
        />
      </div>
    </div>
  );
};

export const computeBoardHeight = (items = [], decorations = []) => {
  let maxBottom = 768;
  items.forEach((item) => {
    const { h } = approxSize(item);
    maxBottom = Math.max(maxBottom, (item.position?.y || 0) + h);
  });
  decorations.forEach((d) => {
    maxBottom = Math.max(maxBottom, (d.position?.y || 0) + 150 * (d.scale || 1));
  });
  return maxBottom + 60;
};

export default BoardMinimap;
