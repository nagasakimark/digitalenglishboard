// Sticker book progress, saved on each student's Chromebook (localStorage).
const KEY = 'deb-stickers';

export const STICKER_EMOJI = {
  quiz: '🧠',
  crossword: '✏️',
  wordsearch: '🔍',
  'scavenger-item': '🎁',
  'snowball-catch': '⛄',
  advent: '🚪',
  'decorate-tree': '🎄',
  'mad-libs': '📝',
  'scratch-card': '🪙',
};

export const STICKER_LABEL = {
  quiz: 'Quiz',
  crossword: 'Crossword',
  wordsearch: 'Word Search',
  'scavenger-item': 'Hidden item',
  'snowball-catch': 'Snowball Catch',
  advent: 'Advent Calendar',
  'decorate-tree': 'Decorate the Tree',
  'mad-libs': 'Mad Libs',
  'scratch-card': 'Scratch Card',
};

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
};

export const getStickers = () => read();

export const hasSticker = (itemId) => !!read()[itemId];

// The editor sets this so that playing items while editing never awards stickers.
let disabled = false;
export const disableStickers = (value = true) => { disabled = value; };

export const awardSticker = (item) => {
  if (disabled || !item?.id) return false;
  const all = read();
  if (all[item.id]) return false;
  all[item.id] = { type: item.type, month: item.month, at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked: ignore */
  }
  window.dispatchEvent(new CustomEvent('sticker-earned', { detail: { item } }));
  return true;
};

// Keep the old scavenger-hunt progress (stored under a different key before stickers existed).
export const migrateOldScavengerProgress = () => {
  try {
    const old = JSON.parse(localStorage.getItem('rovo-scavenger-found') || '[]');
    if (!old.length) return;
    const all = read();
    let changed = false;
    old.forEach((id) => {
      if (!all[id]) {
        all[id] = { type: 'scavenger-item', at: new Date().toISOString() };
        changed = true;
      }
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
};
