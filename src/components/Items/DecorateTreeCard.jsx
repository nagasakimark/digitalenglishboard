import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardSticker } from '../../utils/stickers';

export const DEFAULT_ORNAMENTS = [
  { pic: '⭐', en: 'star', jp: 'ほし' },
  { pic: '🔔', en: 'bell', jp: 'ベル' },
  { pic: '🎁', en: 'present', jp: 'プレゼント' },
  { pic: '🧦', en: 'sock', jp: 'くつした' },
  { pic: '🍬', en: 'candy', jp: 'キャンディ' },
  { pic: '⛄', en: 'snowman', jp: 'ゆきだるま' },
  { pic: '🦌', en: 'reindeer', jp: 'トナカイ' },
  { pic: '🍪', en: 'cookie', jp: 'クッキー' },
  { pic: '🎀', en: 'ribbon', jp: 'リボン' },
  { pic: '❄️', en: 'snowflake', jp: 'ゆきのけっしょう' },
];

export const parseOrnamentLines = (text) =>
  (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [pic, en, jp] = l.split(/\s*\|\s*/);
      return { pic: (pic || '').trim(), en: (en || '').trim(), jp: (jp || '').trim() };
    })
    .filter((o) => o.pic && o.en);

export const ornamentsToLines = (list = []) => list.map((o) => [o.pic, o.en, o.jp || ''].join(' | ')).join('\n');

const isImage = (pic) => /^(https?:|data:|assets\/|\/)/.test(pic || '');
const Pic = ({ pic, size }) =>
  isImage(pic) ? (
    <img src={pic} alt="" draggable={false} style={{ width: size, height: size, objectFit: 'contain', pointerEvents: 'none' }} />
  ) : (
    <span style={{ fontSize: size * 0.85, lineHeight: 1, pointerEvents: 'none' }}>{pic}</span>
  );

const article = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const TreeSvg = () => (
  <svg viewBox="0 0 400 480" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
    <rect x="175" y="400" width="50" height="60" rx="6" fill="#7a4a24" />
    <polygon points="200,40 330,200 70,200" fill="#1f7a3a" />
    <polygon points="200,120 360,300 40,300" fill="#23894a" />
    <polygon points="200,210 390,410 10,410" fill="#279c53" />
    <path d="M110 190 Q200 230 290 190" stroke="#f5d061" strokeWidth="5" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
    <path d="M80 290 Q200 340 320 290" stroke="#f5d061" strokeWidth="5" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
    <path d="M50 395 Q200 450 350 395" stroke="#f5d061" strokeWidth="5" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
  </svg>
);

// point-in-tree test in the SVG's 400x480 space (three stacked triangles + trunk)
const inTriangle = (px, py, [ax, ay], [bx, by], [cx, cy]) => {
  const d = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  const s = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / d;
  const t = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / d;
  return s >= 0 && t >= 0 && s + t <= 1;
};
const onTree = (x, y) =>
  inTriangle(x, y, [200, 20], [330, 200], [70, 200]) ||
  inTriangle(x, y, [200, 100], [360, 300], [40, 300]) ||
  inTriangle(x, y, [200, 190], [390, 410], [10, 410]);

const DecorateGame = ({ item, ornaments, onClose }) => {
  const storeKey = `deb-tree-${item.id}`;
  const missionCount = Math.min(item.content?.missionCount || 6, ornaments.length);
  const [placed, setPlaced] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch { return []; }
  });
  const [missions, setMissions] = useState(() => shuffle(ornaments).slice(0, missionCount));
  const [missionIdx, setMissionIdx] = useState(() => (placed.length ? missionCount : 0));
  const [drag, setDrag] = useState(null); // {orn, x, y}
  const [msg, setMsg] = useState(null);
  const treeRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(placed)); } catch { /* ignore */ }
  }, [placed, storeKey]);

  const mission = missionIdx < missions.length ? missions[missionIdx] : null;
  const freePlay = !mission;

  const showMsg = (text, good) => {
    setMsg({ text, good, key: Date.now() });
    setTimeout(() => setMsg(null), 1600);
  };

  const startDrag = (orn, e) => {
    e.preventDefault();
    setDrag({ orn, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!drag) return undefined;
    const move = (e) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    const up = (e) => {
      const rect = treeRef.current.getBoundingClientRect();
      // convert to the SVG's 400x480 space (preserveAspectRatio xMidYMax meet)
      const scale = Math.min(rect.width / 400, rect.height / 480);
      const offX = (rect.width - 400 * scale) / 2;
      const offY = rect.height - 480 * scale;
      const sx = (e.clientX - rect.left - offX) / scale;
      const sy = (e.clientY - rect.top - offY) / scale;
      const orn = drag.orn;
      setDrag(null);
      if (!onTree(sx, sy)) return;

      if (mission && orn.en !== mission.en) {
        showMsg(`That's ${article(orn.en)} ${orn.en}! Try again.`, false);
        return;
      }
      setPlaced((p) => [...p, { pic: orn.pic, en: orn.en, x: sx, y: sy, id: Date.now() }]);
      if (mission) {
        const next = missionIdx + 1;
        setMissionIdx(next);
        if (next === missions.length) {
          awardSticker(item);
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
          showMsg('Beautiful tree! すてきなツリー！', true);
        } else {
          showMsg('Good job! ✨', true);
        }
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, mission, missionIdx, missions.length, item]);

  const reset = () => {
    setPlaced([]);
    setMissions(shuffle(ornaments).slice(0, missionCount));
    setMissionIdx(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col select-none" style={{ background: 'radial-gradient(circle at 50% 30%, #2c3e70, #0d1530)', touchAction: 'none' }}>
      <div className="flex items-center gap-3 px-4 py-2 text-white font-handwriting text-2xl">
        <span>🎄 Decorate the Tree</span>
        <span className="text-base opacity-80">
          {freePlay ? 'Free decorating! じゆうにかざろう' : `${missionIdx + 1} / ${missions.length}`}
        </span>
        <div className="ml-auto flex gap-2">
          <button onClick={reset} className="p-2 rounded-full hover:bg-white/20" title="Start again"><RotateCcw size={22} /></button>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20" title="Close"><X size={24} /></button>
        </div>
      </div>

      {/* mission sentence */}
      <div className="text-center h-16">
        {mission && (
          <div className="inline-block bg-white rounded-2xl px-6 py-2 shadow-xl">
            <span className="font-handwriting text-4xl text-gray-900">
              Put {article(mission.en)} <b className="text-red-600">{mission.en}</b> on the tree.
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex min-h-0 px-4 pb-4 gap-4">
        {/* tree */}
        <div ref={treeRef} className="relative flex-1 min-w-0">
          <TreeSvg />
          {/* placed ornaments are positioned in SVG space too */}
          <PlacedLayer treeRef={treeRef} placed={placed} showWords={freePlay} />
        </div>

        {/* ornament tray */}
        <div className="w-72 bg-white/10 rounded-2xl p-3 grid grid-cols-3 gap-2 content-start overflow-y-auto">
          {ornaments.map((o) => (
            <button
              key={o.en}
              onPointerDown={(e) => startDrag(o, e)}
              className="aspect-square bg-white/90 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-grab"
              style={{ touchAction: 'none' }}
            >
              <Pic pic={o.pic} size={44} />
              {/* during the mission the words are hidden so students have to read */}
              {freePlay && <span className="text-[11px] font-bold text-gray-700 mt-0.5">{o.en}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* message bubble */}
      {msg && (
        <div className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-[75] rounded-2xl px-6 py-3 text-3xl font-handwriting shadow-2xl pointer-events-none ${msg.good ? 'bg-green-400 text-white' : 'bg-yellow-300 text-gray-900'}`}>
          {msg.text}
        </div>
      )}

      {/* dragged ornament follows the pointer */}
      {drag && (
        <div className="fixed z-[80] pointer-events-none" style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -50%) scale(1.3)' }}>
          <Pic pic={drag.orn.pic} size={50} />
        </div>
      )}
    </div>,
    document.body
  );
};

const PlacedLayer = ({ treeRef, placed, showWords }) => {
  const [box, setBox] = useState(null);
  useEffect(() => {
    const update = () => {
      const el = treeRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const scale = Math.min(r.width / 400, r.height / 480);
      setBox({ scale, offX: (r.width - 400 * scale) / 2, offY: r.height - 480 * scale });
    };
    update();
    const ro = new ResizeObserver(update);
    if (treeRef.current) ro.observe(treeRef.current);
    return () => ro.disconnect();
  }, [treeRef]);
  if (!box) return null;
  return placed.map((p) => (
    <div
      key={p.id}
      className="absolute flex flex-col items-center pointer-events-none"
      style={{ left: box.offX + p.x * box.scale, top: box.offY + p.y * box.scale, transform: 'translate(-50%, -50%)' }}
    >
      <Pic pic={p.pic} size={Math.max(30, 44 * box.scale)} />
      {showWords && <span className="text-[11px] font-bold text-white bg-black/40 rounded px-1 -mt-1">{p.en}</span>}
    </div>
  ));
};

const DecorateTreeCard = ({ item }) => {
  const { content = {} } = item;
  const ornaments = useMemo(
    () => (content.ornaments && content.ornaments.length ? content.ornaments : DEFAULT_ORNAMENTS),
    [content.ornaments]
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl shadow-xl overflow-hidden bg-white text-center" style={{ width: item.width || 220 }}>
        <div className="h-32 relative" style={{ background: 'linear-gradient(#1b2a55, #34508f)' }}>
          <div className="absolute inset-x-8 inset-y-2"><TreeSvg /></div>
          <span className="absolute left-[46%] top-1 text-xl">⭐</span>
        </div>
        <div className="p-3">
          <h3 className="font-handwriting text-2xl text-green-800 leading-none">{content.title || 'Decorate the Tree!'}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-handwriting text-xl px-5 py-1.5 rounded-full shadow"
          >
            Let&apos;s go!
          </button>
        </div>
      </div>
      {open && <DecorateGame item={item} ornaments={ornaments} onClose={() => setOpen(false)} />}
    </>
  );
};

export default DecorateTreeCard;
