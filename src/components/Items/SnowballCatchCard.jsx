import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, VolumeX, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { awardSticker } from '../../utils/stickers';

// ---------- word list helpers ----------
const strip = (t) => (t || '').replace(/\[[^\]]*\]/g, '').trim();

export const parseWordLines = (text) =>
  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [en, jp, image] = line.split(/\s*[=|]\s*/);
      return { en: (en || '').trim(), jp: (jp || '').trim(), image: (image || '').trim() };
    })
    .filter((w) => w.en && (w.jp || w.image));

const collectWords = (content, boardItems) => {
  const words = [...(content.words || [])];
  if (content.useFlashcards !== false) {
    boardItems
      .filter((i) => i.type === 'flashcard')
      .forEach((f) => {
        const en = strip(f.content?.front);
        const jp = strip(f.content?.back);
        if (en && jp) words.push({ en, jp });
      });
  }
  // de-duplicate by English word
  const seen = new Set();
  return words.filter((w) => {
    const k = w.en.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// ---------- tiny synth sounds (no speech) ----------
let audioCtx = null;
const beep = (freqs, dur = 0.12, type = 'sine') => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = f;
      const t0 = audioCtx.currentTime + i * dur;
      g.gain.setValueAtTime(0.15, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0);
      o.stop(t0 + dur);
    });
  } catch {
    /* audio not available */
  }
};

const GAME_SECONDS = 60;
const LIVES = 3;
const BALL = 92; // snowball diameter in px
const PLAYER_W = 150;

// ---------- the game itself ----------
const SnowballGame = ({ item, words, onClose }) => {
  const areaRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });
  const [, forceRender] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [muted, setMuted] = useState(() => localStorage.getItem('deb-muted') === '1');
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const bestKey = `deb-snowball-best-${item.id}`;
  const [best, setBest] = useState(() => parseInt(localStorage.getItem(bestKey) || '0', 10));

  const sound = (kind) => {
    if (mutedRef.current) return;
    if (kind === 'good') beep([660, 880], 0.09);
    if (kind === 'bad') beep([220, 160], 0.14, 'square');
    if (kind === 'end') beep([523, 659, 784, 1047], 0.12);
  };

  const pickTarget = (prev) => {
    if (words.length === 1) return words[0];
    let w;
    do {
      w = words[Math.floor(Math.random() * words.length)];
    } while (prev && w.en === prev.en);
    return w;
  };

  const start = () => {
    const area = areaRef.current.getBoundingClientRect();
    stateRef.current = {
      w: area.width,
      h: area.height,
      playerX: area.width / 2 - PLAYER_W / 2,
      balls: [],
      target: pickTarget(null),
      score: 0,
      lives: LIVES,
      timeLeft: GAME_SECONDS,
      lastTs: null,
      spawnIn: 0,
      flash: null, // {kind, until}
      pops: [], // little floating "+1" effects
      nextId: 1,
    };
    setPhase('playing');
  };

  const endGame = useCallback(() => {
    const s = stateRef.current;
    cancelAnimationFrame(rafRef.current);
    setPhase('over');
    sound('end');
    if (s.score > best) {
      setBest(s.score);
      try { localStorage.setItem(bestKey, String(s.score)); } catch { /* ignore */ }
    }
    if (s.score >= 3) {
      awardSticker(item);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    }
  }, [best, bestKey, item]);

  // game loop
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const tick = (ts) => {
      const s = stateRef.current;
      if (!s) return;
      const dt = s.lastTs == null ? 0 : Math.min(0.05, (ts - s.lastTs) / 1000);
      s.lastTs = ts;

      // time
      s.timeLeft -= dt;
      if (s.timeLeft <= 0 || s.lives <= 0) {
        s.timeLeft = Math.max(0, s.timeLeft);
        forceRender((n) => n + 1);
        endGame();
        return;
      }

      // difficulty ramps up over the minute
      const progress = 1 - s.timeLeft / GAME_SECONDS;
      const fallSpeed = 90 + progress * 110 + s.score * 3; // px per second
      const spawnEvery = 1.5 - progress * 0.6;

      // keyboard movement
      const k = keysRef.current;
      if (k.left) s.playerX -= 600 * dt;
      if (k.right) s.playerX += 600 * dt;
      s.playerX = Math.max(0, Math.min(s.w - PLAYER_W, s.playerX));

      // spawn
      s.spawnIn -= dt;
      if (s.spawnIn <= 0) {
        s.spawnIn = spawnEvery;
        const correctOnScreen = s.balls.some((b) => b.word.en === s.target.en);
        const makeCorrect = !correctOnScreen || Math.random() < 0.3;
        let word = s.target;
        if (!makeCorrect && words.length > 1) {
          const others = words.filter((w) => w.en !== s.target.en);
          word = others[Math.floor(Math.random() * others.length)];
        }
        // avoid stacking right on top of another ball near the top
        let x;
        let tries = 0;
        do {
          x = 10 + Math.random() * (s.w - BALL - 20);
          tries += 1;
        } while (tries < 8 && s.balls.some((b) => b.y < BALL * 1.5 && Math.abs(b.x - x) < BALL));
        s.balls.push({ id: s.nextId++, x, y: -BALL, word, spin: Math.random() * 360, vy: fallSpeed * (0.85 + Math.random() * 0.3) });
      }

      // move & catch
      const playerTop = s.h - 110;
      const remaining = [];
      s.balls.forEach((b) => {
        b.y += b.vy * dt;
        b.spin += 40 * dt;
        const cx = b.x + BALL / 2;
        const caught = b.y + BALL >= playerTop && b.y + BALL <= playerTop + 60 && cx >= s.playerX && cx <= s.playerX + PLAYER_W;
        if (caught) {
          if (b.word.en === s.target.en) {
            s.score += 1;
            s.flash = { kind: 'good', until: ts + 350 };
            s.pops.push({ id: b.id, x: cx, y: playerTop, text: '+1', until: ts + 700 });
            sound('good');
            s.target = pickTarget(s.target);
            // speed up other balls a touch so it feels lively
          } else {
            s.lives -= 1;
            s.flash = { kind: 'bad', until: ts + 400 };
            s.pops.push({ id: b.id, x: cx, y: playerTop, text: b.word.en + ' ✗', until: ts + 900 });
            sound('bad');
          }
          return;
        }
        if (b.y < s.h + 10) remaining.push(b);
      });
      s.balls = remaining;
      s.pops = s.pops.filter((p) => p.until > ts);
      if (s.flash && s.flash.until < ts) s.flash = null;

      forceRender((n) => (n + 1) % 1000000);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, endGame]); // eslint-disable-line react-hooks/exhaustive-deps

  // controls
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === 'Escape') onClose();
      if ((e.key === ' ' || e.key === 'Enter') && phase !== 'playing') start();
    };
    const up = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [phase, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  const movePointer = (clientX) => {
    const s = stateRef.current;
    if (!s || phase !== 'playing') return;
    const rect = areaRef.current.getBoundingClientRect();
    s.playerX = Math.max(0, Math.min(s.w - PLAYER_W, clientX - rect.left - PLAYER_W / 2));
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    try { localStorage.setItem('deb-muted', m ? '1' : '0'); } catch { /* ignore */ }
  };

  const s = stateRef.current;
  const flash = s?.flash?.kind;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col select-none" style={{ background: 'linear-gradient(#0b2a5b, #3a6fb5 70%, #dfefff)' }}>
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white/10 text-white font-handwriting text-2xl z-10">
        <span>⛄ Snowball Catch</span>
        {phase === 'playing' && s && (
          <>
            <span className="ml-4">⭐ {s.score}</span>
            <span>{'❤️'.repeat(Math.max(0, s.lives))}{'🤍'.repeat(LIVES - Math.max(0, s.lives))}</span>
            <span>⏱ {Math.ceil(s.timeLeft)}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleMute} className="p-2 rounded-full hover:bg-white/20" title={muted ? 'Sound on' : 'Sound off'}>
            {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20" title="Close">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Play area */}
      <div
        ref={areaRef}
        className={`relative flex-1 overflow-hidden ${flash === 'bad' ? 'animate-[shake_0.3s]' : ''}`}
        style={{ cursor: phase === 'playing' ? 'none' : 'default', touchAction: 'none' }}
        onMouseMove={(e) => movePointer(e.clientX)}
        onTouchMove={(e) => movePointer(e.touches[0].clientX)}
        onPointerDown={(e) => movePointer(e.clientX)}
      >
        {/* falling background snow */}
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="absolute text-white/60 pointer-events-none"
            style={{
              left: `${(i * 37) % 100}%`,
              top: '-5%',
              fontSize: 10 + (i % 4) * 6,
              animation: `deb-fall ${8 + (i % 5) * 3}s linear ${(i % 7) * -2}s infinite`,
            }}
          >
            ❄
          </span>
        ))}

        {/* Target prompt */}
        {phase === 'playing' && s && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div
              className={`bg-white rounded-2xl px-6 py-2 shadow-2xl text-center transition-transform ${flash === 'good' ? 'scale-110 bg-green-100' : ''}`}
            >
              <div className="text-xs font-bold text-blue-500 tracking-widest">CATCH! キャッチ！</div>
              <div className="flex items-center justify-center gap-3">
                {s.target.image && <img src={s.target.image} alt="" className="h-14 w-14 object-contain" />}
                {s.target.jp && <span className="text-4xl font-bold text-gray-800">{s.target.jp}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Snowballs */}
        {s?.balls.map((b) => (
          <div
            key={b.id}
            className="absolute flex items-center justify-center rounded-full pointer-events-none"
            style={{
              left: b.x,
              top: b.y,
              width: BALL,
              height: BALL,
              background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #eef6ff 55%, #b9d3f0 100%)',
              boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
            }}
          >
            <span
              className="font-bold text-blue-900 text-center leading-tight px-1"
              style={{ fontSize: b.word.en.length > 8 ? 15 : b.word.en.length > 5 ? 19 : 24, fontFamily: '"Open Sans", sans-serif' }}
            >
              {b.word.en}
            </span>
          </div>
        ))}

        {/* +1 / ✗ pops */}
        {s?.pops.map((p) => (
          <div
            key={`pop-${p.id}`}
            className={`absolute font-handwriting text-3xl font-bold pointer-events-none ${p.text === '+1' ? 'text-yellow-300' : 'text-red-400'}`}
            style={{ left: p.x, top: p.y - 60, transform: 'translateX(-50%)', animation: 'deb-pop 0.8s ease-out forwards' }}
          >
            {p.text}
          </div>
        ))}

        {/* Player: a mitten bucket */}
        {phase === 'playing' && s && (
          <div
            className="absolute pointer-events-none flex flex-col items-center"
            style={{ left: s.playerX, top: s.h - 115, width: PLAYER_W }}
          >
            <div
              className={`w-full h-16 rounded-b-[60px] rounded-t-lg border-4 ${flash === 'good' ? 'border-yellow-300' : flash === 'bad' ? 'border-red-400' : 'border-red-800'}`}
              style={{ background: 'repeating-linear-gradient(90deg,#d62828 0 18px,#f1f1f1 18px 26px)' }}
            />
            <div className="text-4xl -mt-2">🧒</div>
          </div>
        )}

        {/* snowy ground */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[50%] pointer-events-none" />

        {/* Ready / Game over screens */}
        {phase !== 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
              {phase === 'ready' ? (
                <>
                  <div className="text-6xl mb-2">⛄</div>
                  <h2 className="font-handwriting text-4xl text-blue-900 mb-2">Snowball Catch</h2>
                  <p className="text-gray-700 mb-1">Catch the snowball with the right English word!</p>
                  <p className="text-gray-500 text-sm mb-1">正しい英語の雪玉をキャッチしよう！</p>
                  <p className="text-gray-500 text-sm mb-5">🖱️ / 👆 / ⬅️ ➡️ でうごく</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-2">{s?.score >= best && s?.score > 0 ? '🏆' : '❄️'}</div>
                  <h2 className="font-handwriting text-4xl text-blue-900 mb-1">Score: {s?.score}</h2>
                  <p className="text-gray-600 mb-1">Best: {best}</p>
                  {s?.score >= 3 ? (
                    <p className="text-green-700 font-bold mb-5">Great job! よくできました！</p>
                  ) : (
                    <p className="text-gray-600 mb-5">Catch 3 to get a sticker! 3つキャッチでシール！</p>
                  )}
                </>
              )}
              <button
                onClick={start}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-handwriting px-8 py-3 rounded-full shadow-lg"
              >
                <Play size={24} /> {phase === 'ready' ? 'Start!' : 'Play again'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ---------- the card pinned on the board ----------
const SnowballCatchCard = ({ item, isEditing, boardItems = [] }) => {
  const { content = {} } = item;
  const [playing, setPlaying] = useState(false);
  const words = useMemo(() => collectWords(content, boardItems), [content, boardItems]);
  const best = parseInt(
    (typeof localStorage !== 'undefined' && localStorage.getItem(`deb-snowball-best-${item.id}`)) || '0',
    10
  );
  const canPlay = words.length >= 2;

  return (
    <>
      <div
        className="rounded-2xl shadow-xl overflow-hidden text-center"
        style={{ width: item.width || 240, background: 'linear-gradient(#123d7a, #4f86c6)' }}
      >
        <div className="relative h-28 flex items-end justify-center">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="absolute text-white/70" style={{ left: `${10 + i * 11}%`, top: `${(i * 23) % 60}%`, fontSize: 10 + (i % 3) * 5 }}>❄</span>
          ))}
          <span className="text-6xl relative">⛄</span>
        </div>
        <div className="bg-white px-3 py-3">
          <h3 className="font-handwriting text-2xl text-blue-900 leading-none">{strip(content.title) || 'Snowball Catch!'}</h3>
          <p className="text-xs text-gray-500 mt-1">{words.length} words{best > 0 ? ` · Best ⭐ ${best}` : ''}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canPlay) setPlaying(true);
            }}
            disabled={!canPlay}
            className="mt-2 inline-flex items-center gap-1 bg-blue-600 disabled:bg-gray-300 hover:bg-blue-700 text-white font-handwriting text-xl px-5 py-1.5 rounded-full shadow"
          >
            <Play size={18} /> Play!
          </button>
          {!canPlay && isEditing && (
            <p className="text-[11px] text-red-500 mt-1">Add at least 2 words (or flashcards on this board).</p>
          )}
        </div>
      </div>
      {playing && <SnowballGame item={item} words={words} onClose={() => setPlaying(false)} />}
    </>
  );
};

export default SnowballCatchCard;
