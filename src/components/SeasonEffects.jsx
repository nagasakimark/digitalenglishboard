import React, { useEffect, useRef, useState } from 'react';

/**
 * Seasonal effects that stay on screen while students scroll the board.
 * Turned on per month in the editor (Custom tab):
 *   effects: { snow: 'light' | 'gentle' | 'heavy' | false, lights: true, snowyFrame: true }
 */

const SNOW_AMOUNT = { light: 35, gentle: 70, heavy: 130 };

const SnowCanvas = ({ amount = 'gentle', right = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let count = SNOW_AMOUNT[amount] || SNOW_AMOUNT.gentle;
    if (reduce) count = Math.round(count / 3);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const make = (anywhere) => {
      const r = Math.random() < 0.15 ? 3 + Math.random() * 2.5 : 1.2 + Math.random() * 2;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -10,
        r,
        vy: (18 + r * 9) * (reduce ? 0.5 : 1), // bigger flakes are closer, so they fall faster
        sway: 10 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        a: 0.55 + Math.random() * 0.4,
      };
    };
    const flakes = Array.from({ length: count }, () => make(true));

    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (const f of flakes) {
        f.y += f.vy * dt;
        const x = f.x + Math.sin(t * 0.7 + f.phase) * f.sway;
        if (f.y > h + 10) Object.assign(f, make(false));
        ctx.globalAlpha = f.a;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Save battery: stop when the tab is hidden
    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', vis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [amount]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 bottom-0 pointer-events-none z-20"
      style={{ right, width: `calc(100% - ${right}px)`, height: '100%' }}
    />
  );
};

const BULB_COLORS = ['#ff3b3b', '#ffd23b', '#2ee06b', '#3bb3ff', '#ff6bd6', '#ff9a3b'];

const useWidth = (right) => {
  const [width, setWidth] = useState(() => window.innerWidth - right);
  useEffect(() => {
    const on = () => setWidth(window.innerWidth - right);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [right]);
  return width;
};

// A string of twinkly fairy lights swagged across the top of the board.
const LightString = ({ right = 0, snowyFrame, showLights = true }) => {
  const width = useWidth(right);
  const start = 72; // leave room for the menu button
  const end = width - 18;
  const swagW = 150;
  const swags = Math.max(1, Math.round((end - start) / swagW));
  const sw = (end - start) / swags;
  const top = 14;
  const sag = 22;
  const perSwag = 4;

  const paths = [];
  const bulbs = [];
  for (let i = 0; i < swags; i += 1) {
    const x0 = start + i * sw;
    const x1 = x0 + sw;
    paths.push(`M${x0},${top} Q${x0 + sw / 2},${top + sag * 2} ${x1},${top}`);
    for (let j = 1; j <= perSwag; j += 1) {
      const t = j / (perSwag + 1);
      // point on the quadratic curve
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * (x0 + sw / 2) + t * t * x1;
      const y = (1 - t) * (1 - t) * top + 2 * (1 - t) * t * (top + sag * 2) + t * t * top;
      const idx = i * perSwag + j;
      bulbs.push({ x, y, color: BULB_COLORS[idx % BULB_COLORS.length], delay: ((idx * 0.37) % 2.4).toFixed(2), tilt: (j - (perSwag + 1) / 2) * 7 });
    }
  }

  return (
    <svg
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-30"
      width={width}
      height={70}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="deb-glow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="deb-snowcap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbe9f7" />
        </linearGradient>
      </defs>

      {snowyFrame && (
        <path
          d={`M0,0 H${width} V12 ${Array.from({ length: Math.ceil(width / 46) + 1 }, (_, i) => {
            const x = width - i * 46;
            return `Q${x - 23},${i % 2 ? 26 : 20} ${x - 46},12`;
          }).join(' ')} Z`}
          fill="url(#deb-snowcap)"
          style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}
        />
      )}

      {showLights && paths.map((d, i) => (
        <path key={i} d={d} stroke="#1d3b1d" strokeWidth="2.2" fill="none" />
      ))}
      {showLights && bulbs.map((b, i) => (
        <g key={i} transform={`translate(${b.x},${b.y}) rotate(${b.tilt})`}>
          <circle cy="13" r="14" fill={b.color} opacity="0.55" className="deb-bulb-glow" style={{ animationDelay: `${b.delay}s` }} />
          <rect x="-3.5" y="-1" width="7" height="6" rx="1.5" fill="#2e4a2e" />
          <ellipse cy="13" rx="6" ry="9" fill={b.color} className="deb-bulb" style={{ animationDelay: `${b.delay}s` }} />
          <ellipse cx="-2" cy="9" rx="1.8" ry="3" fill="#fff" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
};

const SeasonEffects = ({ effects, right = 0 }) => {
  if (!effects) return null;
  return (
    <>
      {effects.snow && <SnowCanvas amount={effects.snow === true ? 'gentle' : effects.snow} right={right} />}
      {(effects.lights || effects.snowyFrame) && (
        <LightString right={right} snowyFrame={effects.snowyFrame} showLights={!!effects.lights} />
      )}
    </>
  );
};

export default SeasonEffects;
