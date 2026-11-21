// Predefined themes and effects for months

export const MONTH_EFFECTS = {
  none: {
    id: 'none',
    name: 'None',
    description: 'No special effects',
    html: '',
    css: ''
  },
  snowflakes: {
    id: 'snowflakes',
    name: 'Falling Snowflakes',
    description: 'Gentle falling snowflakes',
    html: `<div class="snowflakes" aria-hidden="true">
  <div class="snowflake">❅</div>
  <div class="snowflake">❆</div>
  <div class="snowflake">❅</div>
  <div class="snowflake">❆</div>
  <div class="snowflake">❅</div>
  <div class="snowflake">❆</div>
  <div class="snowflake">❅</div>
  <div class="snowflake">❆</div>
  <div class="snowflake">❅</div>
  <div class="snowflake">❆</div>
</div>`,
    css: `.snowflakes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -10%;
  color: white;
  font-size: 1.5em;
  animation: fall linear infinite;
  text-shadow: 0 0 5px rgba(255,255,255,0.8);
}

.snowflake:nth-child(1) { left: 10%; animation-duration: 10s; animation-delay: 0s; }
.snowflake:nth-child(2) { left: 20%; animation-duration: 12s; animation-delay: 2s; }
.snowflake:nth-child(3) { left: 30%; animation-duration: 8s; animation-delay: 4s; }
.snowflake:nth-child(4) { left: 40%; animation-duration: 14s; animation-delay: 1s; }
.snowflake:nth-child(5) { left: 50%; animation-duration: 11s; animation-delay: 3s; }
.snowflake:nth-child(6) { left: 60%; animation-duration: 9s; animation-delay: 5s; }
.snowflake:nth-child(7) { left: 70%; animation-duration: 13s; animation-delay: 2s; }
.snowflake:nth-child(8) { left: 80%; animation-duration: 10s; animation-delay: 4s; }
.snowflake:nth-child(9) { left: 15%; animation-duration: 11s; animation-delay: 6s; }
.snowflake:nth-child(10) { left: 85%; animation-duration: 9s; animation-delay: 3s; }

@keyframes fall {
  to { top: 110%; }
}`
  },
  christmasLights: {
    id: 'christmasLights',
    name: 'Christmas Lights',
    description: 'Blinking festive lights',
    html: `<div class="christmas-lights">
  <div class="light red"></div>
  <div class="light green"></div>
  <div class="light blue"></div>
  <div class="light yellow"></div>
  <div class="light red"></div>
  <div class="light green"></div>
  <div class="light blue"></div>
  <div class="light yellow"></div>
  <div class="light red"></div>
  <div class="light green"></div>
</div>`,
    css: `.christmas-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  pointer-events: none;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
}

.light {
  width: 20px;
  height: 30px;
  border-radius: 50% 50% 40% 40%;
  animation: blink 1.5s infinite;
}

.light.red { background: #ff0000; box-shadow: 0 0 10px #ff0000; }
.light.green { background: #00ff00; box-shadow: 0 0 10px #00ff00; animation-delay: 0.3s; }
.light.blue { background: #0000ff; box-shadow: 0 0 10px #0000ff; animation-delay: 0.6s; }
.light.yellow { background: #ffff00; box-shadow: 0 0 10px #ffff00; animation-delay: 0.9s; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}`
  },
  fallingLeaves: {
    id: 'fallingLeaves',
    name: 'Falling Leaves',
    description: 'Autumn leaves falling',
    html: `<div class="falling-leaves">
  <div class="leaf">🍂</div>
  <div class="leaf">🍁</div>
  <div class="leaf">🍂</div>
  <div class="leaf">🍁</div>
  <div class="leaf">🍂</div>
  <div class="leaf">🍁</div>
  <div class="leaf">🍂</div>
  <div class="leaf">🍁</div>
</div>`,
    css: `.falling-leaves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.leaf {
  position: absolute;
  top: -10%;
  font-size: 2em;
  animation: fall-rotate linear infinite;
}

.leaf:nth-child(1) { left: 10%; animation-duration: 12s; animation-delay: 0s; }
.leaf:nth-child(2) { left: 25%; animation-duration: 10s; animation-delay: 2s; }
.leaf:nth-child(3) { left: 40%; animation-duration: 14s; animation-delay: 4s; }
.leaf:nth-child(4) { left: 55%; animation-duration: 11s; animation-delay: 1s; }
.leaf:nth-child(5) { left: 70%; animation-duration: 13s; animation-delay: 3s; }
.leaf:nth-child(6) { left: 85%; animation-duration: 9s; animation-delay: 5s; }
.leaf:nth-child(7) { left: 15%; animation-duration: 15s; animation-delay: 2s; }
.leaf:nth-child(8) { left: 60%; animation-duration: 10s; animation-delay: 4s; }

@keyframes fall-rotate {
  to { 
    top: 110%; 
    transform: rotate(360deg);
  }
}`
  },
  hearts: {
    id: 'hearts',
    name: 'Floating Hearts',
    description: 'Hearts for Valentine\'s Day',
    html: `<div class="hearts-container">
  <div class="heart">❤️</div>
  <div class="heart">💕</div>
  <div class="heart">💖</div>
  <div class="heart">💗</div>
  <div class="heart">❤️</div>
  <div class="heart">💕</div>
</div>`,
    css: `.hearts-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.heart {
  position: absolute;
  font-size: 2em;
  animation: float-up 10s linear infinite;
  opacity: 0.8;
}

.heart:nth-child(1) { left: 15%; animation-delay: 0s; }
.heart:nth-child(2) { left: 30%; animation-delay: 2s; }
.heart:nth-child(3) { left: 50%; animation-delay: 4s; }
.heart:nth-child(4) { left: 70%; animation-delay: 1s; }
.heart:nth-child(5) { left: 85%; animation-delay: 3s; }
.heart:nth-child(6) { left: 40%; animation-delay: 5s; }

@keyframes float-up {
  from { 
    top: 110%; 
    transform: scale(0.5);
  }
  to { 
    top: -10%; 
    transform: scale(1.2);
  }
}`
  },
  confetti: {
    id: 'confetti',
    name: 'Confetti',
    description: 'Celebration confetti',
    html: `<div class="confetti-container">
  <div class="confetti" style="background: #ff6b6b;"></div>
  <div class="confetti" style="background: #4ecdc4;"></div>
  <div class="confetti" style="background: #45b7d1;"></div>
  <div class="confetti" style="background: #f9ca24;"></div>
  <div class="confetti" style="background: #6c5ce7;"></div>
  <div class="confetti" style="background: #ff6b6b;"></div>
  <div class="confetti" style="background: #4ecdc4;"></div>
  <div class="confetti" style="background: #45b7d1;"></div>
  <div class="confetti" style="background: #f9ca24;"></div>
  <div class="confetti" style="background: #6c5ce7;"></div>
</div>`,
    css: `.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10%;
  animation: confetti-fall linear infinite;
}

.confetti:nth-child(1) { left: 10%; animation-duration: 3s; animation-delay: 0s; }
.confetti:nth-child(2) { left: 20%; animation-duration: 3.5s; animation-delay: 0.5s; }
.confetti:nth-child(3) { left: 30%; animation-duration: 2.8s; animation-delay: 1s; }
.confetti:nth-child(4) { left: 40%; animation-duration: 3.2s; animation-delay: 0.3s; }
.confetti:nth-child(5) { left: 50%; animation-duration: 3s; animation-delay: 0.8s; }
.confetti:nth-child(6) { left: 60%; animation-duration: 3.3s; animation-delay: 0.2s; }
.confetti:nth-child(7) { left: 70%; animation-duration: 2.9s; animation-delay: 0.6s; }
.confetti:nth-child(8) { left: 80%; animation-duration: 3.1s; animation-delay: 0.4s; }
.confetti:nth-child(9) { left: 15%; animation-duration: 3.4s; animation-delay: 0.7s; }
.confetti:nth-child(10) { left: 85%; animation-duration: 2.7s; animation-delay: 0.9s; }

@keyframes confetti-fall {
  to { 
    top: 110%; 
    transform: rotate(720deg);
  }
}`
  },
  sparkles: {
    id: 'sparkles',
    name: 'Sparkles',
    description: 'Twinkling sparkles',
    html: `<div class="sparkles-container">
  <div class="sparkle">✨</div>
  <div class="sparkle">⭐</div>
  <div class="sparkle">✨</div>
  <div class="sparkle">⭐</div>
  <div class="sparkle">✨</div>
  <div class="sparkle">⭐</div>
</div>`,
    css: `.sparkles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.sparkle {
  position: absolute;
  font-size: 1.5em;
  animation: twinkle 2s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 20%; left: 15%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 40%; left: 80%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { top: 60%; left: 30%; animation-delay: 1s; }
.sparkle:nth-child(4) { top: 80%; left: 70%; animation-delay: 1.5s; }
.sparkle:nth-child(5) { top: 30%; left: 50%; animation-delay: 0.8s; }
.sparkle:nth-child(6) { top: 70%; left: 60%; animation-delay: 1.2s; }

@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
}`
  }
};

export const getEffectById = (id) => {
  return MONTH_EFFECTS[id] || MONTH_EFFECTS.none;
};

export const getAllEffects = () => {
  return Object.values(MONTH_EFFECTS);
};
