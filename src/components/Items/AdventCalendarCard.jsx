import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardSticker } from '../../utils/stickers';
import TextWithTranslation from '../TextWithTranslation';

// Door line format used by the editor:  day | picture (emoji or image URL) | English | 日本語
export const parseDoorLines = (text) =>
  (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [day, pic, en, jp] = l.split(/\s*\|\s*/);
      return { day: parseInt(day, 10), pic: (pic || '').trim(), en: (en || '').trim(), jp: (jp || '').trim() };
    })
    .filter((d) => d.day >= 1 && d.day <= 31);

export const doorsToLines = (doors = []) =>
  doors.map((d) => [d.day, d.pic || '', d.en || '', d.jp || ''].join(' | ')).join('\n');

const isImage = (pic) => /^(https?:|data:|assets\/|\/)/.test(pic || '');

const Picture = ({ pic, size }) =>
  isImage(pic) ? (
    <img src={pic} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />
  ) : (
    <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{pic || '🎁'}</span>
  );

const DOOR_COLORS = ['#c0392b', '#1e8449', '#b9770e', '#1f618d', '#7d3c98', '#a93226'];

const AdventCalendarCard = ({ item, isEditing }) => {
  const { content = {} } = item;
  const doors = useMemo(
    () => [...(content.doors || [])].sort((a, b) => a.day - b.day),
    [content.doors]
  );
  const storeKey = `deb-advent-${item.id}`;
  const [opened, setOpened] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch { return []; }
  });
  const [showing, setShowing] = useState(null);
  const [shake, setShake] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(opened)); } catch { /* ignore */ }
  }, [opened, storeKey]);

  // Which month is this calendar for? (item.month is "YYYY-MM")
  const [year, month] = (item.month || '').split('-').map((n) => parseInt(n, 10));
  const today = new Date();
  const monthName = year && month ? new Date(year, month - 1, 1).toLocaleString('en', { month: 'long' }).toUpperCase() : '';

  const isUnlocked = (day) => {
    if (isEditing) return true;
    if (!year || !month) return true;
    const doorDate = new Date(year, month - 1, day);
    return today >= doorDate;
  };

  const openDoor = (door, e) => {
    e.stopPropagation();
    if (!isUnlocked(door.day)) {
      setShake(door.day);
      setTimeout(() => setShake(null), 500);
      return;
    }
    if (!opened.includes(door.day)) {
      setOpened((o) => [...o, door.day]);
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
        colors: ['#ffd700', '#e74c3c', '#2ecc71', '#ffffff'],
      });
      awardSticker(item);
      setTimeout(() => setShowing(door), 450);
    } else {
      setShowing(door);
    }
  };

  const width = item.width || 380;
  const cols = doors.length > 16 ? 6 : doors.length > 9 ? 5 : 4;

  return (
    <div
      className="rounded-2xl shadow-xl p-3"
      style={{
        width,
        background: 'linear-gradient(135deg, #7b1e1e, #b03a2e)',
        border: '6px solid #d4af37',
      }}
    >
      <h3 className="font-handwriting text-3xl text-yellow-100 text-center mb-2 drop-shadow">
        <TextWithTranslation text={content.title || 'Advent Calendar'} />
      </h3>
      {doors.length === 0 ? (
        <p className="text-yellow-100 text-center text-sm py-6">Add doors in the editor.</p>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {doors.map((door, idx) => {
            const isOpen = opened.includes(door.day);
            const unlocked = isUnlocked(door.day);
            const color = DOOR_COLORS[idx % DOOR_COLORS.length];
            return (
              <button
                key={door.day}
                onClick={(e) => openDoor(door, e)}
                className="relative aspect-square rounded-lg bg-yellow-50 overflow-hidden"
                style={{ perspective: 400 }}
                title={unlocked ? `Day ${door.day}` : 'まだ開けられません — come back later!'}
              >
                {/* inside of the door */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                  <Picture pic={door.pic} size={width / cols / 2.2} />
                  <span className="text-[10px] font-bold text-gray-700 leading-tight truncate w-full">{door.en}</span>
                </div>
                {/* the door itself */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-yellow-300/70 font-handwriting text-white"
                  style={{ background: color, transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
                  animate={{
                    rotateY: isOpen ? -105 : 0,
                    x: shake === door.day ? [0, -4, 4, -4, 0] : 0,
                  }}
                  transition={{ duration: isOpen ? 0.5 : 0.35 }}
                >
                  <span className="text-2xl font-bold drop-shadow">{door.day}</span>
                  {!unlocked && <Lock size={12} className="absolute bottom-1 right-1 opacity-70" />}
                </motion.div>
              </button>
            );
          })}
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {showing && (
            <motion.div
              className="fixed inset-0 z-[65] bg-black/50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowing(null)}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 text-center shadow-2xl relative min-w-[300px] border-8 border-red-700"
                initial={{ scale: 0.5, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100" onClick={() => setShowing(null)}>
                  <X size={22} />
                </button>
                <div className="text-sm font-bold text-red-700 tracking-widest mb-2">{monthName} {showing.day}</div>
                <div className="flex justify-center mb-3">
                  <Picture pic={showing.pic} size={140} />
                </div>
                <div className="font-handwriting text-5xl text-gray-900">{showing.en}</div>
                {showing.jp && <div className="text-xl text-gray-500 mt-1">{showing.jp}</div>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default AdventCalendarCard;
