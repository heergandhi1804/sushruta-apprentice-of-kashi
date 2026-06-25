// game.js - Simplified Sushruta Apprentice Game Logic

// Audio Synthesizer Interface
const Sound = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playTone(freq, duration, type = 'sine') {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.log("Audio Context play blocked.");
    }
  },
  click() { this.playTone(600, 0.05, 'sine'); },
  chime() {
    this.playTone(800, 0.1, 'sine');
    setTimeout(() => this.playTone(1200, 0.15, 'sine'), 50);
  },
  success() {
    this.playTone(523.25, 0.08, 'sine');
    setTimeout(() => this.playTone(659.25, 0.08, 'sine'), 60);
    setTimeout(() => this.playTone(783.99, 0.18, 'sine'), 120);
  },
  bump() { this.playTone(150, 0.1, 'triangle'); },
  pierce() { this.playTone(320, 0.06, 'sawtooth'); }
};

// Global Game State
const GameState = {
  currentScreen: 'screen-prologue',
  completedStations: [], // gourd, cloth, bamboo, doll
  lotusTokens: 0,
  unlockedBadges: [],
  activePatient: null, // 'potter', 'carpenter', 'dancer', 'messenger'
  activeProbe: 'straight',
  bambooSparks: 0,
  bambooSmoothness: 100,
  diagnosticsUsed: [], // 'look', 'stretch', 'ask'
  treatmentProfile: {
    needle: 'curved',
    thread: 'cotton',
    tension: 50
  },
  level3Attempts: 0,
  // Hint system: 0 = off, 1 = ghost overlay, 2 = ghost + Socratic nudge
  hints: {
    gourd: 0, cloth: 0, wire: 0, bamboo: 0, doll: 0,
    gallery: 0, level2: 0, treatment: 0
  }
};

// Hint nudges — Socratic questions (2nd press), never literal answers
const HINT_NUDGES = {
  gourd:     'Which tip survived the thick rind last time?',
  cloth:     'What happens to the gauge when you loosen the pull?',
  wire:      'Does slowing down change how often the ring buzzes?',
  bamboo:    'Which probe shape matches the curve of the channel?',
  doll:      'What does the status say when you test the movement?',
  gallery:   'What does the tool need to do — pierce, grip, cut, or hook?',
  level2:    'What clue did STRETCH reveal about this soldier\'s tissue?',
  treatment: 'Where are the ghost targets, and how close are your stitches?'
};

function toggleHint(levelId) {
  Sound.click();
  const prev = GameState.hints[levelId] || 0;
  GameState.hints[levelId] = Math.min(2, prev + 1);

  const level = GameState.hints[levelId];
  const nudgeEl = document.getElementById(`hint-nudge-${levelId}`);

  if (level === 2 && nudgeEl) {
    nudgeEl.textContent = `💭 ${HINT_NUDGES[levelId] || ''}`;
    nudgeEl.classList.remove('hidden');
  }

  triggerCanvasRedraw(GameState.currentScreen);
}

// Global Exam State
const ExamState = {
  currentCase: 0,
  timelineStep: 0,
  isCorrect: false,
  selections: {
    observation: '',
    category: '',
    tool: '',
    tension: '',
    support: '',
    priority: ''
  }
};

// Patients Data
const PATIENTS_DATA = {
  potter: {
    name: 'Madhava the Potter',
    wound: 'Wrist Cut',
    goal: 'Keep wrist flexible',
    lookClue: 'Scrape across elastic joint tendons.',
    stretchClue: 'High tension when wrist flexes.',
    askClue: 'Needs flexibility to turn the clay wheel.'
  },
  carpenter: {
    name: 'Devadatta the Carpenter',
    wound: 'Palm Cut',
    goal: 'Strong closure under load',
    lookClue: 'Deep split across tough palm muscle.',
    stretchClue: 'Very stiff tissue under high resistance.',
    askClue: 'Needs heavy strength to grip iron mallets.'
  },
  dancer: {
    name: 'Malati the Dancer',
    wound: 'Knee Scrape',
    goal: 'Smooth healing without scars',
    lookClue: 'Surface graze with micro-tears.',
    stretchClue: 'High elasticity over the knee cap.',
    askClue: 'Needs clean cosmetic healing to perform.'
  },
  messenger: {
    name: 'Vilas the Messenger',
    wound: 'Thigh Cut',
    goal: 'Fast repair & bleed control',
    lookClue: 'Puncture through vascular thigh muscle.',
    stretchClue: 'Loose skin edges with heavy oozing.',
    askClue: 'Needs quick closure to run long forest trails.'
  }
};

// ------------------------------------------
// STATE MACHINE ROUTING
// ------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  showScreen('screen-prologue');

  // Track mouse coordinates for dynamic background glow
  window.addEventListener('mousemove', (e) => {
    document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
  });
});

function showScreen(screenId) {
  const screens = [
    'screen-prologue', 'screen-courtyard', 'screen-gourd', 
    'screen-cloth', 'screen-bamboo', 'screen-doll', 
    'screen-gallery', 'screen-level2', 'screen-treatment', 
    'screen-healing', 'screen-graduation', 'screen-exam'
  ];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const active = document.getElementById(screenId);
  if (active) active.classList.remove('hidden');
  GameState.currentScreen = screenId;

  // Sync canvas size
  setTimeout(() => {
    const canvas = active ? active.querySelector('canvas') : null;
    if (canvas) {
      canvas.width = canvas.clientWidth || 600;
      canvas.height = canvas.clientHeight || 400;
      triggerCanvasRedraw(screenId);
    }
  }, 60);
}

function triggerCanvasRedraw(screenId) {
  const canvas = document.getElementById(screenId)?.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (screenId === 'screen-gourd') drawGourdScene(ctx, canvas);
  else if (screenId === 'screen-cloth') drawClothScene(ctx, canvas);
  else if (screenId === 'screen-bamboo') drawBambooScene(ctx, canvas);
  else if (screenId === 'screen-doll') drawDollScene(ctx, canvas);
  else if (screenId === 'screen-gallery') drawToolMatchScene(ctx, canvas);
  else if (screenId === 'screen-level2') drawDiagnosisScene(ctx, canvas);
  else if (screenId === 'screen-treatment') drawTreatmentScene(ctx, canvas);
  else if (screenId === 'screen-healing') updateHealingTimeStep();
  else if (screenId === 'screen-exam') drawExamWoundScene(ctx, canvas, ExamState.currentCase, ExamState.timelineStep, ExamState.isCorrect);
}

// ------------------------------------------
// PROLOGUE
// ------------------------------------------
function beginApprenticeship() {
  Sound.chime();
  showScreen('screen-courtyard');
  updateCourtyardProgress();
}

// ------------------------------------------
// LEVEL 1: PRACTICE COURTYARD
// ------------------------------------------
function updateCourtyardProgress() {
  const count = GameState.completedStations.length;
  document.getElementById('courtyard-progress-text').textContent = `${count} / 4 Yards Complete`;

  ['gourd', 'cloth', 'bamboo', 'doll'].forEach(id => {
    const el = document.getElementById(`badge-${id}`);
    const shelfEl = document.getElementById(`shelf-badge-${id}`);
    if (GameState.completedStations.includes(id)) {
      el.textContent = "Complete";
      el.className = "station-status-badge complete";
      if (shelfEl) shelfEl.className = "shelf-badge unlocked";
    } else {
      el.textContent = "Unlocked";
      el.className = "station-status-badge";
      if (shelfEl) shelfEl.className = "shelf-badge locked";
    }
  });

  const btn = document.getElementById('btn-gallery-transition');
  if (count === 4) {
    btn.disabled = false;
    btn.style.animation = "pulse 1.8s infinite";
  } else {
    btn.disabled = true;
    btn.style.animation = "";
  }
}

function enterStation(stationId) {
  Sound.click();
  // Reset hint state for this station
  if (GameState.hints[stationId] !== undefined) {
    GameState.hints[stationId] = 0;
    const nudgeEl = document.getElementById(`hint-nudge-${stationId}`);
    if (nudgeEl) nudgeEl.classList.add('hidden');
  }
  showScreen(`screen-${stationId}`);

  if (stationId === 'gourd') initGourdLab();
  if (stationId === 'cloth') initClothBoard();
  if (stationId === 'bamboo') initBambooTunnel();
  if (stationId === 'doll') initDollStation();
}

function backToCourtyard() {
  Sound.click();
  showScreen('screen-courtyard');
  updateCourtyardProgress();
}

function completeStation(stationId) {
  Sound.success();
  if (!GameState.completedStations.includes(stationId)) {
    GameState.completedStations.push(stationId);
  }
  
  // Unlock Sticker Book badges
  if (stationId === 'gourd') unlockBadge('gourd', 'badge-stk-gourd');
  if (stationId === 'cloth') unlockBadge('cloth', 'badge-stk-cloth');
  if (stationId === 'bamboo') unlockBadge('bamboo', 'badge-stk-bamboo');
  if (stationId === 'doll') unlockBadge('doll', 'badge-stk-doll');

  backToCourtyard();
}

// ------------------------------------------
// STICKER BOOK MANAGER
// ------------------------------------------
function toggleStickerBook() {
  Sound.click();
  const sidebar = document.getElementById('journal-sidebar');
  sidebar.classList.toggle('translate-x-0');
  document.getElementById('sticker-alert-dot').classList.add('hidden');
}

function unlockBadge(badgeKey, elementId) {
  if (!GameState.unlockedBadges.includes(badgeKey)) {
    GameState.unlockedBadges.push(badgeKey);
    const el = document.getElementById(elementId);
    if (el) {
      el.className = "sticker-card unlocked";
    }
    // Glow notification
    document.getElementById('sticker-alert-dot').classList.remove('hidden');
  }
}

function restartSimulation() {
  Sound.chime();
  window.location.reload();
}

function updatePathway(badge, progressWidth) {
  const badgeEl = document.getElementById('current-pathway-badge');
  if (badgeEl) badgeEl.textContent = badge;
  const progressEl = document.getElementById('pathway-progress');
  if (progressEl) progressEl.style.width = progressWidth;
}

function goHome() {
  Sound.click();
  showScreen('screen-courtyard');
  updateCourtyardProgress();
}

// ------------------------------------------
// YARD 1: GOURD POP
// ------------------------------------------
const GourdLab = {
  material: 'soft', 
  needle: 'curved',
  isDrawing: false,
  dragPoints: [],
  outcome: "",
  squashY: 0,
  bendAngle: 0,
  matchedItems: [] // track successfully matched items: 'soft', 'thick', 'melon'
};

function initGourdLab() {
  const canvas = document.getElementById('canvas-gourd');
  const ctx = canvas.getContext('2d');
  GourdLab.dragPoints = [];
  GourdLab.isDrawing = false;
  GourdLab.outcome = "";
  GourdLab.squashY = 0;
  GourdLab.bendAngle = 0;
  
  document.getElementById('gourd-mentor-tip').textContent = "Observe item thickness first.";
  updateGourdUI();
  drawGourdScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    GourdLab.isDrawing = true;
    GourdLab.dragPoints = [];
    GourdLab.squashY = 0;
    GourdLab.bendAngle = 0;
    GourdLab.outcome = ""; // clear outcome bubble on new drag
    const rect = canvas.getBoundingClientRect();
    GourdLab.dragPoints.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  canvas.onmousemove = (e) => {
    if (!GourdLab.isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    GourdLab.dragPoints.push({ x, y });

    // Gourd squash / wobble animation
    const midY = canvas.height * 0.55;
    if (y > midY - 25 && y < midY + 25) {
      GourdLab.squashY = Math.min(25, GourdLab.squashY + 1.2);
    }
    drawGourdScene(ctx, canvas);
  };

  canvas.onmouseup = () => {
    if (GourdLab.isDrawing) {
      GourdLab.isDrawing = false;
      evaluateGourdPuncture();
      // Reset squash/bend if the needle isn't stuck/bent
      if (GourdLab.outcome !== "STUCK!") {
        GourdLab.squashY = 0;
      }
      if (GourdLab.outcome !== "BENT!") {
        GourdLab.bendAngle = 0;
      }
      drawGourdScene(ctx, canvas);
    }
  };
}

function selectGourdMaterial(mat) {
  Sound.click();
  GourdLab.material = mat;
  ['soft', 'thick', 'melon'].forEach(id => {
    document.getElementById(`btn-mat-${id}`).classList.toggle('active', id === mat);
  });
  resetGourdLab();
}

function selectGourdNeedle(ndl) {
  Sound.click();
  GourdLab.needle = ndl;
  ['curved', 'straight', 'triangular'].forEach(id => {
    document.getElementById(`btn-ndl-${id}`).classList.toggle('active', id === ndl);
  });
  resetGourdLab();
}

function resetGourdLab() {
  initGourdLab();
}

function evaluateGourdPuncture() {
  const mat = GourdLab.material;
  const ndl = GourdLab.needle;
  let word = "";
  let tip = "";

  if (mat === 'soft') {
    if (ndl === 'curved') {
      word = "SMOOTH!";
      tip = "Curved slides through soft skin.";
      Sound.success();
      recordGourdMatch('soft');
    }
    else if (ndl === 'straight') {
      word = "SMOOTH!";
      tip = "Straight needles push cleanly through soft tissue.";
      Sound.pierce();
      recordGourdMatch('soft');
    }
    else { word = "TEAR!"; tip = "Triangular tips cut soft tissue too easily."; Sound.bump(); }
  } else if (mat === 'thick') {
    if (ndl === 'curved') { word = "STUCK!"; tip = "Curved needles struggle with thickness."; Sound.bump(); GourdLab.squashY = 12; }
    else if (ndl === 'straight') { word = "BENT!"; tip = "Straight needles bend under heavy pressure."; Sound.bump(); GourdLab.bendAngle = 0.5; }
    else {
      word = "SMOOTH!";
      tip = "Triangular needles cut cleanly through tough skin.";
      Sound.pierce();
      recordGourdMatch('thick');
    }
  } else { // melon
    if (ndl === 'curved') {
      word = "SMOOTH!";
      tip = "Curved glides along melon roundness.";
      Sound.success();
      recordGourdMatch('melon');
    }
    else if (ndl === 'straight') { word = "BENT!"; tip = "Straight needle bends against melon curves."; Sound.bump(); GourdLab.bendAngle = -0.4; }
    else { word = "TEAR!"; tip = "Triangular edges split brittle melons."; Sound.bump(); }
  }

  GourdLab.outcome = word;
  document.getElementById('gourd-mentor-tip').textContent = tip;
}

function recordGourdMatch(item) {
  if (!GourdLab.matchedItems.includes(item)) {
    GourdLab.matchedItems.push(item);
  }
  updateGourdUI();
}

function updateGourdUI() {
  const softEl = document.getElementById('btn-mat-soft');
  const thickEl = document.getElementById('btn-mat-thick');
  const melonEl = document.getElementById('btn-mat-melon');
  
  if (softEl) softEl.textContent = "Soft Gourd" + (GourdLab.matchedItems.includes('soft') ? " ✓" : "");
  if (thickEl) thickEl.textContent = "Thick Gourd" + (GourdLab.matchedItems.includes('thick') ? " ✓" : "");
  if (melonEl) melonEl.textContent = "Curved Melon" + (GourdLab.matchedItems.includes('melon') ? " ✓" : "");
  
  const progressEl = document.getElementById('gourd-matching-progress');
  if (progressEl) {
    progressEl.textContent = `Matched: ${GourdLab.matchedItems.length} / 3 Items`;
  }
  
  const completeBtn = document.getElementById('btn-complete-gourd');
  if (completeBtn) {
    if (GourdLab.matchedItems.length === 3) {
      completeBtn.disabled = false;
      completeBtn.style.animation = "pulse 1.5s infinite";
    } else {
      completeBtn.disabled = true;
      completeBtn.style.animation = "";
    }
  }
}

// ------------------------------------------
// YARD 2: THREAD MASTER
// ------------------------------------------
const WOUNDS = {
  clean:  { name:'Clean Cut',         rows:5, optimum:3, optTension:[40,65], jitter:0,
            lesson:'Clean edges close with FEW, evenly spaced stitches.' },
  jagged: { name:'Jagged Tear',        rows:7, optimum:5, optTension:[40,60], jitter:14,
            lesson:'Irregular edges need MORE support points to align.' },
  scrape: { name:'Scraped / Shallow',  rows:6, optimum:1, optTension:[20,45], jitter:0, shallow:true,
            lesson:'Surface grazes need protection, not many stitches.' }
};

const ClothBoard = {
  woundType: 'clean',
  anchors: [],      // [{y, lx, rx}] computed per wound on init
  placed: [],       // indices of anchors with a stitch
  tension: 50,
  analyzed: false
};

function initClothBoard() {
  const canvas = document.getElementById('canvas-cloth');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth || 600;
  canvas.height = canvas.clientHeight || 360;

  const W = canvas.width, H = canvas.height, midX = W / 2;
  const cfg = WOUNDS[ClothBoard.woundType];
  ClothBoard.placed = [];
  ClothBoard.analyzed = false;

  // anchor rows evenly spaced down the wound; jagged offsets left/right lips
  ClothBoard.anchors = [];
  const top = H * 0.18, bot = H * 0.82, step = (bot - top) / (cfg.rows - 1);
  for (let i = 0; i < cfg.rows; i++) {
    const y = top + i * step;
    const j = cfg.jitter ? (Math.sin(i * 2.3) * cfg.jitter) : 0;
    ClothBoard.anchors.push({ y, lx: midX - 16 - Math.abs(j), rx: midX + 16 + Math.abs(j) });
  }

  document.getElementById('cloth-stitch-count').textContent = 0;
  const optHint = document.getElementById('cloth-optimum-hint');
  if (optHint) optHint.textContent = '';
  document.getElementById('cloth-mentor-tip').textContent =
    `${cfg.name}: place stitches by clicking the anchor dots on the forearm. Press Analyze Repair when ready.`;

  drawClothScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    if (ClothBoard.analyzed) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = -1, bd = 26;
    ClothBoard.anchors.forEach((a, i) => {
      const d = Math.abs(my - a.y) + Math.abs(mx - (a.lx + a.rx) / 2) * 0.3;
      if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0) {
      const at = ClothBoard.placed.indexOf(best);
      if (at >= 0) { ClothBoard.placed.splice(at, 1); Sound.bump(); }
      else { ClothBoard.placed.push(best); Sound.pierce(); }
      document.getElementById('cloth-stitch-count').textContent = ClothBoard.placed.length;
      drawClothScene(ctx, canvas);
    }
  };
  canvas.onmousemove = null;
  canvas.onmouseup = null;
}

function selectWoundType(type) {
  Sound.click();
  ClothBoard.woundType = type;
  ['clean', 'jagged', 'scrape'].forEach(t =>
    document.getElementById(`btn-wound-${t}`)?.classList.toggle('active', t === type));
  const nameEl = document.getElementById('cloth-wound-name');
  if (nameEl) nameEl.textContent = WOUNDS[type].name;
  initClothBoard();
}

function updateClothTension() {
  ClothBoard.tension = parseInt(document.getElementById('cloth-tension-slider').value);
  document.getElementById('cloth-tension-val').textContent = `${ClothBoard.tension}%`;
  const canvas = document.getElementById('canvas-cloth');
  drawClothScene(canvas.getContext('2d'), canvas);
}

function analyzeRepair() {
  const canvas = document.getElementById('canvas-cloth');
  const ctx = canvas.getContext('2d');
  const cfg = WOUNDS[ClothBoard.woundType];
  const n = ClothBoard.placed.length;

  if (ClothBoard.analyzed) { completeStation('cloth'); return; }

  // spacing evenness: variance of gaps between sorted placed rows
  const idx = [...ClothBoard.placed].sort((a, b) => a - b);
  let evenness = 1;
  if (idx.length > 1) {
    const gaps = idx.slice(1).map((v, i) => v - idx[i]);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const varc = gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length;
    evenness = Math.max(0, 1 - varc / 4);
  }
  const tOK = ClothBoard.tension >= cfg.optTension[0] && ClothBoard.tension <= cfg.optTension[1];
  const countDelta = Math.abs(n - cfg.optimum);

  let msg;
  if (n === 0) {
    msg = `Evidence: No stitches placed. Try adding some before analyzing — optimum for ${cfg.name} is ${cfg.optimum} stitches.`;
  } else if (cfg.shallow && n > 2) {
    msg = `Evidence: ${n} stitches is too many for a shallow graze. Optimum is 1 — extra stitches only pinch healing tissue.`;
  } else if (n > cfg.optimum + 2) {
    msg = `Evidence: ${n} stitches placed, but optimum for ${cfg.name} is ${cfg.optimum}. More stitches beyond optimum creates tension and restricts circulation.`;
  } else if (n > cfg.optimum) {
    msg = `Pattern Noticed: ${n} stitches is ${n - cfg.optimum} more than the optimum of ${cfg.optimum} for this ${cfg.name}. Even spacing matters more than extra stitches.`;
  } else if (n < cfg.optimum - 1) {
    msg = `Evidence: Only ${n} ${n === 1 ? 'stitch' : 'stitches'} placed. This ${cfg.name} needs ${cfg.optimum} — too few leaves gaps and lets edges pull apart.`;
  } else if (!tOK && ClothBoard.tension > cfg.optTension[1]) {
    msg = `Pattern Noticed: Tension at ${ClothBoard.tension}% is too high (optimum: ${cfg.optTension[0]}–${cfg.optTension[1]}%). High tension puckers the skin and slows healing.`;
  } else if (!tOK) {
    msg = `Pattern Noticed: Tension at ${ClothBoard.tension}% is too low (optimum: ${cfg.optTension[0]}–${cfg.optTension[1]}%). Low tension leaves gaps between wound edges.`;
  } else if (countDelta === 0 && evenness > 0.6) {
    msg = `Principle Learned: ${n} evenly-spaced stitches at ${ClothBoard.tension}% tension — exactly optimum. Balanced support without pinching.`;
  } else {
    msg = `Pattern Noticed: ${n} stitches at ${ClothBoard.tension}% tension. Optimum is ${cfg.optimum} stitches in the ${cfg.optTension[0]}–${cfg.optTension[1]}% range.`;
  }

  document.getElementById('cloth-mentor-tip').textContent = msg;
  ClothBoard.analyzed = true;
  drawClothScene(ctx, canvas);
}

function clearStitches() {
  Sound.bump();
  initClothBoard();
}

// ------------------------------------------
// YARD 3: BAMBOO MAZE
// ------------------------------------------
const BambooTunnel = {
  probeX: 50, probeY: 0,        // probeY set on init relative to canvas
  probeRadius: 8,
  isDragging: false,
  collisions: 0,
  smoothness: 100,
  lotuses: [],                  // generated by spawnBambooLotuses()
  trail: [],                    // recent positions for the smooth curved-probe trail
  sparkTimer: 0, sparkX: 0, sparkY: 0,
  shake: 0,                     // brief screen-shake counter on collision
  reached: false
};

function spawnBambooLotuses() {
  const canvas = document.getElementById('canvas-bamboo');
  if (!canvas) return;
  const W = canvas.width || 600, H = canvas.height || 360;
  const lumen = H * 0.12;
  const xs = [];
  while (xs.length < 3) {
    const x = 130 + Math.random() * (W - 240);
    if (xs.every(px => Math.abs(px - x) > 90)) xs.push(x);
  }
  BambooTunnel.lotuses = xs.map(x => {
    const cy = bambooCenterY(x, canvas);
    const off = (Math.random() * 0.7 + 0.1) * lumen * (Math.random() < 0.5 ? 1 : -1);
    return { x, y: cy + off, collected: false };
  });
}

function initBambooTunnel() {
  const canvas = document.getElementById('canvas-bamboo');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth || 600;
  canvas.height = canvas.clientHeight || 360;

  BambooTunnel.probeX = 50;
  BambooTunnel.probeY = bambooCenterY(50, canvas);
  BambooTunnel.collisions = 0;
  BambooTunnel.smoothness = 100;
  BambooTunnel.isDragging = false;
  BambooTunnel.sparkTimer = 0;
  BambooTunnel.shake = 0;
  BambooTunnel.trail = [];
  BambooTunnel.reached = false;
  if (!BambooTunnel.lotuses.length) spawnBambooLotuses();

  document.getElementById('bamboo-collisions').textContent = 0;
  document.getElementById('bamboo-tokens-val').textContent = "0 / 3";
  document.getElementById('bamboo-smoothness').textContent = "100%";
  document.getElementById('bamboo-mentor-tip').textContent =
    "Choose a probe shape, then guide the tip from START to EXIT.";

  drawBambooScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    if (Math.hypot(mx - BambooTunnel.probeX, my - BambooTunnel.probeY) < BambooTunnel.probeRadius + 18)
      BambooTunnel.isDragging = true;
  };

  canvas.onmousemove = (e) => {
    if (!BambooTunnel.isDragging) return;
    const r = canvas.getBoundingClientRect();
    let mx = e.clientX - r.left, my = e.clientY - r.top;
    const p = GameState.activeProbe;

    if (p === 'straight') {
      mx = BambooTunnel.probeX + (mx - BambooTunnel.probeX) * 1.0;
      my = BambooTunnel.probeY + (my - BambooTunnel.probeY) * 0.35;
    } else if (p === 'curved') {
      mx = BambooTunnel.probeX + (mx - BambooTunnel.probeX) * 0.6;
      my = BambooTunnel.probeY + (my - BambooTunnel.probeY) * 0.6;
    } else {
      mx = BambooTunnel.probeX + (mx - BambooTunnel.probeX) * 0.28;
      my = BambooTunnel.probeY + (my - BambooTunnel.probeY) * 0.28;
    }

    if (checkBambooCollision(mx, my, canvas)) {
      BambooTunnel.collisions++;
      BambooTunnel.sparkTimer = 9; BambooTunnel.sparkX = mx; BambooTunnel.sparkY = my;
      BambooTunnel.shake = 6;
      Sound.bump();
      BambooTunnel.smoothness = Math.max(10, 100 - BambooTunnel.collisions * 4);
      document.getElementById('bamboo-collisions').textContent = BambooTunnel.collisions;
      document.getElementById('bamboo-smoothness').textContent = `${BambooTunnel.smoothness}%`;
      document.getElementById('bamboo-mentor-tip').textContent =
        p === 'straight' ? "Straight probe is fast, but bends cause wall contact."
        : p === 'curved' ? "Even curved tips scrape if you rush the bend — ease off."
        : "Hooked probe needs slower, deliberate control.";
    }

    BambooTunnel.probeX = mx; BambooTunnel.probeY = my;
    BambooTunnel.trail.push({ x: mx, y: my });
    if (BambooTunnel.trail.length > 22) BambooTunnel.trail.shift();

    const reach = (p === 'hooked') ? 32 : 16;
    BambooTunnel.lotuses.forEach(l => {
      if (!l.collected && Math.hypot(mx - l.x, my - l.y) < reach) {
        l.collected = true; Sound.success();
        const n = BambooTunnel.lotuses.filter(x => x.collected).length;
        document.getElementById('bamboo-tokens-val').textContent = `${n} / 3`;
        if (p === 'hooked')
          document.getElementById('bamboo-mentor-tip').textContent =
            "Hooked probe can reach lotus tokens from farther away.";
      }
    });

    const exitY = bambooCenterY(canvas.width, canvas);
    if (!BambooTunnel.reached && mx > canvas.width - 58 && Math.abs(my - exitY) < canvas.height * 0.12) {
      BambooTunnel.reached = true; BambooTunnel.isDragging = false; Sound.chime();
      document.getElementById('bamboo-mentor-tip').textContent =
        "Pattern noticed: tool shape decides how a path is best navigated. Complete to advance.";
    }
    drawBambooScene(ctx, canvas);
  };

  canvas.onmouseup = () => { BambooTunnel.isDragging = false; };
}

function resetBambooTunnel() {
  spawnBambooLotuses();
  initBambooTunnel();
}

function selectBambooProbe(probe) {
  Sound.click();
  GameState.activeProbe = probe;
  ['straight', 'curved', 'hooked'].forEach(id =>
    document.getElementById(`btn-probe-${id}`).classList.toggle('active', id === probe));
  document.getElementById('bamboo-mentor-tip').textContent =
    probe === 'straight' ? "Straight probe: fast in open paths, wide turns."
    : probe === 'curved' ? "Curved probe: follows the channel smoothly."
    : "Hooked probe: reaches side lotuses, but slower to steer.";
  const canvas = document.getElementById('canvas-bamboo');
  drawBambooScene(canvas.getContext('2d'), canvas);
}

function checkBambooCollision(x, y, canvas) {
  const lumen = canvas.height * 0.12;
  return Math.abs(y - bambooCenterY(x, canvas)) > (lumen - BambooTunnel.probeRadius);
}

// ------------------------------------------
// YARD 4: WRAP RACE
// ------------------------------------------
const DollWrap = {
  bodyPart: 'finger',
  layers: 0,
  tightness: 5,
  isDrawing: false,
  angleProgress: 0,
  lastAngle: null,
  centerX: 250, centerY: 150,
  radius: 20,
  history: [],
  testAction: null, // 'walk', 'bend', 'turn'
  testTimer: 0
};

function initDollStation() {
  const canvas = document.getElementById('canvas-doll');
  const ctx = canvas.getContext('2d');
  
  DollWrap.layers = 0;
  DollWrap.angleProgress = 0;
  DollWrap.lastAngle = null;
  DollWrap.isDrawing = false;
  DollWrap.history = [];
  DollWrap.testAction = null;
  DollWrap.testTimer = 0;

  document.getElementById('doll-layers').textContent = 0;
  updateDollCalculations();
  drawDollScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dist = Math.hypot(mx - DollWrap.centerX, my - DollWrap.centerY);
    
    // Drag around joint boundaries
    if (dist > DollWrap.radius - 15 && dist < DollWrap.radius + 60) {
      DollWrap.isDrawing = true;
      DollWrap.lastAngle = Math.atan2(my - DollWrap.centerY, mx - DollWrap.centerX);
    }
  };

  canvas.onmousemove = (e) => {
    if (!DollWrap.isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const curAngle = Math.atan2(my - DollWrap.centerY, mx - DollWrap.centerX);
    let diff = curAngle - DollWrap.lastAngle;

    if (diff < -Math.PI) diff += 2 * Math.PI;
    if (diff > Math.PI) diff -= 2 * Math.PI;

    DollWrap.angleProgress += Math.abs(diff);
    DollWrap.lastAngle = curAngle;
    
    DollWrap.history.push({ x: mx, y: my });
    if (DollWrap.history.length > 30) DollWrap.history.shift();

    const newLayers = Math.floor(DollWrap.angleProgress / (2 * Math.PI));
    if (newLayers > DollWrap.layers) {
      DollWrap.layers = newLayers;
      document.getElementById('doll-layers').textContent = DollWrap.layers;
      Sound.pierce();
      updateDollCalculations();
    }
    drawDollScene(ctx, canvas);
  };

  canvas.onmouseup = () => {
    DollWrap.isDrawing = false;
  };
}

function selectDollBody(part) {
  Sound.click();
  DollWrap.bodyPart = part;
  ['finger', 'arm', 'knee', 'head'].forEach(id => {
    document.getElementById(`btn-doll-${id}`).classList.toggle('active', id === part);
  });

  if (part === 'finger') { DollWrap.radius = 20; DollWrap.centerY = 150; }
  else if (part === 'arm') { DollWrap.radius = 35; DollWrap.centerY = 150; }
  else if (part === 'knee') { DollWrap.radius = 50; DollWrap.centerY = 160; }
  else if (part === 'head') { DollWrap.radius = 65; DollWrap.centerY = 170; }

  resetDollStation();
}

function resetDollStation() {
  initDollStation();
}

function updateDollCalculations() {
  DollWrap.tightness = parseInt(document.getElementById('doll-tightness').value);
  document.getElementById('doll-tightness-val').textContent = DollWrap.tightness;

  let status = "Unwrapped";
  if (DollWrap.layers > 0) {
    if (DollWrap.tightness > 7) {
      status = "Pinch! (Too tight, restricts joint)";
    } else if (DollWrap.tightness < 3) {
      status = "Loose! (Bandage slips off)";
    } else {
      status = "Secure wrap holds joint stably.";
    }
  }

  const el = document.getElementById('doll-compression-status');
  el.textContent = status;
  if (status.includes("Pinch")) el.style.color = "var(--color-rose)";
  else if (status.includes("Loose")) el.style.color = "var(--color-orange)";
  else el.style.color = "var(--color-teal)";

  // §1c: redraw canvas immediately so visual updates with slider
  const canvas = document.getElementById('canvas-doll');
  if (canvas) drawDollScene(canvas.getContext('2d'), canvas);
}

function testDollMovement(action) {
  if (DollWrap.layers === 0) {
    alert("Apply wraps first to test movement!");
    return;
  }
  Sound.click();
  DollWrap.testAction = action;
  DollWrap.testTimer = 25; // animation cycles

  // Update mentor note
  if (DollWrap.tightness > 7) {
    document.getElementById('doll-mentor-tip').textContent = "Pinch! High tension constricts the limb.";
    Sound.bump();
  } else if (DollWrap.tightness < 3) {
    document.getElementById('doll-mentor-tip').textContent = "Slip! Bandages unravel under movement.";
    Sound.bump();
  } else {
    document.getElementById('doll-mentor-tip').textContent = "Secure wrap supports natural articulation!";
    Sound.success();
  }

  animateDollMovement();
}

function animateDollMovement() {
  if (DollWrap.testTimer > 0) {
    DollWrap.testTimer--;
    const canvas = document.getElementById('canvas-doll');
    drawDollScene(canvas.getContext('2d'), canvas);
    requestAnimationFrame(animateDollMovement);
  } else {
    DollWrap.testAction = null;
  }
}

// ------------------------------------------
// LEVEL 1.5: TOOL GALLERY (TOOL MATCH)
// ------------------------------------------
const ToolGallery = {
  activeTool: 'probe',
  matched: { probe: 'none', forceps: 'none', scalpel: 'none', needle: 'none' }
};

function transitionToGallery() {
  Sound.success();
  showScreen('screen-gallery');
  initToolGallery();
}

function initToolGallery() {
  ToolGallery.activeTool = 'probe';
  ToolGallery.matched = { probe: 'none', forceps: 'none', scalpel: 'none', needle: 'none' };
  
  document.getElementById('match-probe').value = 'none';
  document.getElementById('match-forceps').value = 'none';
  document.getElementById('match-scalpel').value = 'none';
  document.getElementById('match-needle').value = 'none';
  document.getElementById('btn-gallery-next').disabled = true;
  document.getElementById('match-mentor-tip').textContent = "Shape helps grip.";

  const canvas = document.getElementById('canvas-gallery');
  drawToolMatchScene(canvas.getContext('2d'), canvas);
}

function selectGalleryTool(tool) {
  Sound.click();
  ToolGallery.activeTool = tool;
  ['probe', 'forceps', 'scalpel', 'needle'].forEach(id => {
    document.getElementById(`btn-gtool-${id}`).classList.toggle('active', id === tool);
  });
  const canvas = document.getElementById('canvas-gallery');
  drawToolMatchScene(canvas.getContext('2d'), canvas);
}

function checkBiomimicry() {
  ToolGallery.matched.probe = document.getElementById('match-probe').value;
  ToolGallery.matched.forceps = document.getElementById('match-forceps').value;
  ToolGallery.matched.scalpel = document.getElementById('match-scalpel').value;
  ToolGallery.matched.needle = document.getElementById('match-needle').value;

  let correctCount = 0;
  if (ToolGallery.matched.probe === 'fish') correctCount++;
  if (ToolGallery.matched.forceps === 'lion') correctCount++;
  if (ToolGallery.matched.scalpel === 'crane') correctCount++;
  if (ToolGallery.matched.needle === 'claw') correctCount++;

  const tip = document.getElementById('match-mentor-tip');
  if (correctCount === 4) {
    Sound.success();
    tip.textContent = "All tools match! Beak shapes pinch, claws hook.";
    document.getElementById('btn-gallery-next').disabled = false;
    document.getElementById('btn-gallery-next').style.animation = "pulse 1.5s infinite";
    unlockBadge('tool', 'badge-stk-tool');
  } else {
    tip.textContent = `${correctCount} / 4 animal alignments identified.`;
    document.getElementById('btn-gallery-next').disabled = true;
    document.getElementById('btn-gallery-next').style.animation = "";
  }
}

function resetToolMatch() {
  initToolGallery();
}

// ------------------------------------------
// LEVEL 2: FIRST PATIENTS (PATIENT INTAKE)
// ------------------------------------------
function advanceToLevel2() {
  Sound.success();
  showScreen('screen-level2');
}

function selectLevel2Patient(key) {
  Sound.click();
  GameState.activePatient = key;
  GameState.diagnosticsUsed = [];
  
  ['potter', 'carpenter', 'dancer', 'messenger'].forEach(id => {
    document.getElementById(`btn-pat-${id}`).classList.toggle('active', id === key);
  });

  document.getElementById('level2-diagnosis-panel').classList.remove('hidden');
  document.getElementById('diag-clue-feed').textContent = "Select LOOK, STRETCH, or ASK to inspect the patient.";
  document.getElementById('btn-diagnosis-next').classList.add('hidden');
  document.getElementById('patient-mentor-tip').textContent = "Observe the patient's need.";

  // Reset tool active button states
  document.getElementById('btn-diag-look').classList.remove('active');
  document.getElementById('btn-diag-stretch').classList.remove('active');

  initDiagnosisCanvas();
}

function triggerDiagTool(tool) {
  if (!GameState.activePatient) {
    alert("Select a patient first!");
    return;
  }
  Sound.click();
  
  if (!GameState.diagnosticsUsed.includes(tool)) {
    GameState.diagnosticsUsed.push(tool);
  }

  const pData = PATIENTS_DATA[GameState.activePatient];
  let clue = "";

  document.getElementById('btn-diag-look').classList.toggle('active', tool === 'look');
  document.getElementById('btn-diag-stretch').classList.toggle('active', tool === 'stretch');

  if (tool === 'look') {
    clue = `LOOK: ${pData.lookClue}`;
    Sound.pierce();
  } else if (tool === 'stretch') {
    clue = `STRETCH: ${pData.stretchClue}`;
    Sound.success();
  } else {
    clue = `ASK: "${pData.askClue}"`;
    Sound.chime();
  }

  document.getElementById('diag-clue-feed').textContent = clue;

  // Check if all 3 used
  if (GameState.diagnosticsUsed.length === 3) {
    document.getElementById('btn-diagnosis-next').classList.remove('hidden');
    document.getElementById('btn-diagnosis-next').style.animation = "pulse 1.5s infinite";
    document.getElementById('patient-mentor-tip').textContent = "Clues gathered! Begin suture repair.";
    unlockBadge('patient', 'badge-stk-patient');
  }

  const canvas = document.getElementById('canvas-diagnosis');
  drawDiagnosisScene(canvas.getContext('2d'), canvas);
}

function initDiagnosisCanvas() {
  const canvas = document.getElementById('canvas-diagnosis');
  drawDiagnosisScene(canvas.getContext('2d'), canvas);
}

function resetIntake() {
  if (GameState.activePatient) {
    selectLevel2Patient(GameState.activePatient);
  }
}

// ------------------------------------------
// LEVEL 3: SUTURE CHALLENGE
// ------------------------------------------
const TreatmentState = {
  stitches: [],
  needleLife: 100,
  isDrawing: false,
  startX: 0, startY: 0,
  curX: 0, curY: 0
};

function enterSutureChallenge() {
  Sound.chime();
  showScreen('screen-treatment');
  
  const key = GameState.activePatient;
  const pData = PATIENTS_DATA[key];
  document.getElementById('treatment-patient-tag').textContent = pData.name;
  
  // Set default tools
  document.getElementById('active-needle-selector').value = 'curved';
  document.getElementById('active-thread-selector').value = 'cotton';
  document.getElementById('treat-tension-slider').value = 50;
  document.getElementById('treat-tension-val').textContent = '50%';

  initTreatmentCanvas();
}

function initTreatmentCanvas() {
  const canvas = document.getElementById('canvas-treatment');
  const ctx = canvas.getContext('2d');
  
  TreatmentState.stitches = [];
  TreatmentState.needleLife = 100;
  TreatmentState.isDrawing = false;

  updateTreatmentCalculations();
  drawTreatmentScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    TreatmentState.startX = e.clientX - rect.left;
    TreatmentState.startY = e.clientY - rect.top;
    TreatmentState.isDrawing = true;
  };

  canvas.onmousemove = (e) => {
    if (!TreatmentState.isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    TreatmentState.curX = e.clientX - rect.left;
    TreatmentState.curY = e.clientY - rect.top;
    drawTreatmentScene(ctx, canvas);
  };

  canvas.onmouseup = () => {
    if (TreatmentState.isDrawing) {
      TreatmentState.isDrawing = false;
      const midY = canvas.height / 2;
      const crossed = (TreatmentState.startY < midY && TreatmentState.curY > midY) || (TreatmentState.startY > midY && TreatmentState.curY < midY);

      if (crossed && Math.abs(TreatmentState.startY - TreatmentState.curY) > 20) {
        if (TreatmentState.stitches.length >= 5) {
          Sound.bump();
          alert("Suture limit of 5 stitches reached!");
          return;
        }

        Sound.pierce();
        const tens = parseInt(document.getElementById('treat-tension-slider').value);
        TreatmentState.stitches.push({
          x1: TreatmentState.startX, y1: TreatmentState.startY,
          x2: TreatmentState.curX, y2: TreatmentState.curY,
          tension: tens
        });

        // Needle wear
        const needle = document.getElementById('active-needle-selector').value;
        let wear = 12;
        if (tens > 75) wear = 30; // tight tension wears needle faster
        if (needle === 'curved') wear *= 0.8; // curved wears slower
        
        TreatmentState.needleLife = Math.max(0, TreatmentState.needleLife - wear);
        updateTreatmentCalculations();
      }
      drawTreatmentScene(ctx, canvas);
    }
  };
}

function updateActiveTools() {
  Sound.click();
  updateTreatmentCalculations();
  const canvas = document.getElementById('canvas-treatment');
  if (canvas) drawTreatmentScene(canvas.getContext('2d'), canvas);
}

function updateTreatmentTension() {
  const val = parseInt(document.getElementById('treat-tension-slider').value);
  document.getElementById('treat-tension-val').textContent = `${val}%`;
  
  TreatmentState.stitches.forEach(st => {
    st.tension = val;
  });

  updateTreatmentCalculations();
  const canvas = document.getElementById('canvas-treatment');
  drawTreatmentScene(canvas.getContext('2d'), canvas);
}

function updateTreatmentCalculations() {
  const count = TreatmentState.stitches.length;
  document.getElementById('res-thread').textContent = `${count} / 5 Stitches`;
  document.getElementById('res-needle').textContent = `${Math.round(TreatmentState.needleLife)}%`;

  const needle = document.getElementById('active-needle-selector').value;
  const thread = document.getElementById('active-thread-selector').value;
  const tension = parseInt(document.getElementById('treat-tension-slider').value);

  // Playful cause-and-effect indicators
  let strength = 0;
  let speed = 0;
  let smoothness = 0;

  if (count > 0) {
    // Strength is high when thread is hemp (strong) or tension is high
    let baseStr = thread === 'hemp' ? 80 : (thread === 'cotton' ? 40 : 60);
    strength = Math.min(100, Math.round(baseStr * (tension / 50)));

    // Speed is high when needle is straight (fast) and tension is balanced
    let baseSpd = needle === 'straight' ? 85 : 55;
    speed = Math.min(100, Math.round(baseSpd * (1 - Math.abs(50 - tension)/100)));

    // Smoothness is high when needle is curved (bends well) and thread is soft (cotton/horsehair), and tension is NOT too tight
    let baseSm = needle === 'curved' ? 80 : 50;
    let threadMod = thread === 'cotton' ? 1.2 : (thread === 'horsehair' ? 1.4 : 0.7);
    smoothness = Math.max(10, Math.min(100, Math.round(baseSm * threadMod * (1 - Math.abs(50 - tension)/80))));
  }

  document.getElementById('gauge-closure').textContent = `${strength}%`;
  document.getElementById('gauge-bleed').textContent = `${speed}%`;
  document.getElementById('gauge-comfort').textContent = `${smoothness}%`;

  // Mentor line
  let tip = "Strong holds tension, curved allows movement.";
  if (tension > 75) tip = "Too much pull wrinkles.";
  else if (tension < 30) tip = "Loose holds slip.";
  else if (needle === 'straight') tip = "Straight needles speed up direct lines.";
  else if (needle === 'curved') tip = "Curved needles flow smoothly across bends.";

  document.getElementById('mentor-treatment-tip').textContent = `"${tip}"`;
}

function clearTreatmentStitches() {
  Sound.bump();
  initTreatmentCanvas();
}

// ------------------------------------------
// LEVEL 4: HEALING TIME MACHINE
// ------------------------------------------
function completeTreatment() {
  if (TreatmentState.stitches.length === 0) {
    alert("Wound margins must be sutured first!");
    return;
  }
  Sound.success();
  showScreen('screen-healing');
  
  // Set day slider to 0
  document.getElementById('healing-slider').value = 0;
  updateHealingTimeStep();
}

function backToSutureChallenge() {
  Sound.click();
  showScreen('screen-treatment');
}

function updateHealingTimeStep() {
  const step = parseInt(document.getElementById('healing-slider').value);
  const canvas = document.getElementById('canvas-healing');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const days = ["Day 0: Suture Deployed", "Day 7: Re-epithelial Stage", "Day 30: Remodeled Tissue"];
  document.getElementById('time-machine-day').textContent = days[step];

  // Calculate visual consequences based on Suture Challenge parameters
  const tension = TreatmentState.stitches[0]?.tension || 50;
  const thread = document.getElementById('active-thread-selector').value;
  
  let outcome = "Visual consequence: Scar remodeling depends on suture tension.";
  if (tension > 75) {
    outcome = "Consequence: Tension too tight. Wide, hypertrophic scar forms due to skin stress.";
  } else if (tension < 35) {
    outcome = "Consequence: Suture too loose. Wound margins gaped and reopened under joint movement.";
  } else {
    outcome = "Consequence: Balanced tension. Clean, thin closed line with minimal scarring.";
  }

  document.getElementById('healing-reflective-tip').textContent = outcome;
  document.getElementById('healing-mentor-tip').textContent = "Day 30 reveals your balance.";

  drawHealingStep(ctx, canvas, step, tension);
}

function advanceFromHealing() {
  Sound.success();
  
  // Transition logic
  if (GameState.level3Attempts === 0) {
    // Return to Courtyard but configure for Level 3: Sushruta's Challenge scenarios
    GameState.level3Attempts = 1;
    GameState.completedStations = []; // clear so they can play scenarios
    showScreen('screen-courtyard');

    document.getElementById('courtyard-progress-text').textContent = "Level 3: Master's Challenge";
    updatePathway("Investigator", "70%");

    setupLevel3Scenarios();
  } else {
    // Advance to Graduation badge screen
    showScreen('screen-graduation');
    updatePathway("Sushruta's Apprentice", "100%");
    unlockBadge('apprentice', 'badge-stk-apprentice');
  }
}

function setupLevel3Scenarios() {
  document.getElementById('badge-gourd').textContent = "Scenario A";
  document.getElementById('badge-cloth').textContent = "Scenario B";
  document.getElementById('badge-bamboo').textContent = "Scenario C";
  document.getElementById('badge-doll').textContent = "Scenario D";

  const hGourd = document.getElementById('badge-gourd').closest('.station-card').querySelector('h3');
  hGourd.textContent = "The Hand Potter";
  hGourd.nextElementSibling.textContent = "Goal: Potter requires wrist flexibility. Balance tension.";

  const hCloth = document.getElementById('badge-cloth').closest('.station-card').querySelector('h3');
  hCloth.textContent = "The Carpenter";
  hCloth.nextElementSibling.textContent = "Goal: Carpenter requires palm load strength. High tension support.";

  const hBamboo = document.getElementById('badge-bamboo').closest('.station-card').querySelector('h3');
  hBamboo.textContent = "The Temple Dancer";
  hBamboo.nextElementSibling.textContent = "Goal: Dancer requires smooth cosmetic healing. Balanced tension.";

  const hDoll = document.getElementById('badge-doll').closest('.station-card').querySelector('h3');
  hDoll.textContent = "The Forest Messenger";
  hDoll.nextElementSibling.textContent = "Goal: Messenger requires fast repair for trail treks. Balanced speed.";

  // Redirect courtyard cards to Patients screen (Level 2/3)
  const cards = document.querySelectorAll('#screen-courtyard .courtyard-grid > div');
  const patientKeys = ['potter', 'carpenter', 'dancer', 'messenger'];
  cards.forEach((card, idx) => {
    card.onclick = () => {
      Sound.click();
      showScreen('screen-level2');
      selectLevel2Patient(patientKeys[idx]);
    };
  });

  const btn = document.getElementById('btn-gallery-transition');
  btn.textContent = "Graduate Gurukul";
  btn.disabled = false;
  btn.onclick = () => {
    Sound.success();
    showScreen('screen-graduation');
    updatePathway("Sushruta's Apprentice", "100%");
    unlockBadge('apprentice', 'badge-stk-apprentice');
  };
}

// ------------------------------------------
// LEVEL 1.75: FINAL APPRENTICE EXAMINATION
// ------------------------------------------
const EXAM_CASES = [
  {
    title: "Case 1 of 6: Clean Cut",
    isFullReasoning: true,
    correctObservation: "clean_edge",
    correctCategory: "Chinna",
    correctTool: "curved",
    correctTension: "moderate",
    correctSupport: "surface",
    correctPriority: "cosmetic",
    successTip: "Excellent! The skin edges are neatly aligned with moderate tension using a curved needle. The skin layers heal with minimal raised scar tissue.",
    day30Outcome: "Optimal Healing: Skin layers show a clean, thin scar line."
  },
  {
    title: "Case 2 of 6: Narrow Penetration",
    isFullReasoning: true,
    correctObservation: "puncture_opening",
    correctCategory: "Bhinna",
    correctTool: "straight",
    correctTension: "low",
    correctSupport: "deep",
    correctPriority: "cavity",
    successTip: "Excellent! By utilizing a straight probe to explore the deep narrow channel, and closing the deep skin layers with support while keeping surface tension low, you prevent a deep cavity closure failure. The pocket heals cleanly.",
    day30Outcome: "Optimal Healing: Deep pocket closed, surface skin layers resolved with a small scar point."
  },
  {
    title: "Case 3 of 6: Flattened Impact",
    isFullReasoning: true,
    correctObservation: "crushed_area",
    correctCategory: "Pichchita",
    correctTool: "dressing",
    correctTension: "none",
    correctSupport: "surface",
    correctPriority: "necrosis",
    successTip: "Excellent! Bruised and crushed skin layers are too fragile for sutures. By avoiding stitches, choosing a medicated dressing, and applying no tension, you protect the surface skin and avoid edge damage. The tissue recovers viable blood flow.",
    day30Outcome: "Optimal Healing: Crushed skin layers recover shape and surface heals smoothly without edge damage."
  },
  {
    title: "Case 4 of 6: Transfixing Channel",
    isFullReasoning: false,
    correctObservation: "deep_narrow_path",
    correctCategory: "Viddha",
    successTip: "Correct classification! This is a pierced wound (Viddha) traversing all the way through. The channel path and exit must be verified before surface dressing.",
    day30Outcome: "Optimal Healing: Internal path resolved cleanly."
  },
  {
    title: "Case 5 of 6: Ragged Margins",
    isFullReasoning: false,
    correctObservation: "jagged_edge",
    correctCategory: "Kshata",
    successTip: "Correct classification! This is a lacerated wound (Kshata) with jagged margins. Suture must bridge uneven edges with care to prevent tearing.",
    day30Outcome: "Optimal Healing: Jagged margins aligned and skin layers healed with a slightly wavy line."
  },
  {
    title: "Case 6 of 6: Grazed Surface",
    isFullReasoning: false,
    correctObservation: "scraped_surface",
    correctCategory: "Ghrishta",
    successTip: "Correct classification! This is an abraded wound (Ghrishta) where only the outer skin layers are scraped. Medicated paste dressing and protective wrap heal it cleanly without any sutures.",
    day30Outcome: "Optimal Healing: Scraped skin layers regenerate fully with no scarring."
  }
];

function transitionToExam() {
  Sound.chime();
  showScreen('screen-exam');
  initExam();
}

function initExam() {
  ExamState.currentCase = 0;
  loadExamCase();
}

function loadExamCase() {
  const caseData = EXAM_CASES[ExamState.currentCase];
  
  document.getElementById('exam-case-title').textContent = caseData.title;
  
  // Reset fields
  document.getElementById('exam-select-observation').value = "";
  document.getElementById('exam-select-category').value = "";
  document.getElementById('exam-select-tool').value = "";
  document.getElementById('exam-select-tension').value = "";
  document.getElementById('exam-select-support').value = "";
  document.getElementById('exam-select-priority').value = "";
  
  // Reset preview
  document.getElementById('exam-sentence-preview').textContent = 'Because I observe ____, I conclude ____.';
  
  // Show/hide sections
  const treatSec = document.getElementById('exam-treatment-section');
  if (caseData.isFullReasoning) {
    treatSec.classList.remove('hidden');
  } else {
    treatSec.classList.add('hidden');
  }
  
  // Reset buttons & timeline
  document.getElementById('exam-timeline-container').classList.add('hidden');
  document.getElementById('btn-exam-verify').classList.remove('hidden');
  document.getElementById('btn-exam-next').classList.add('hidden');
  
  ExamState.timelineStep = 0;
  ExamState.isCorrect = false;
  
  document.getElementById('exam-mentor-tip').textContent = "A healer observes first. Look closely at the wound margins and depth before deciding.";
  
  const canvas = document.getElementById('canvas-exam');
  if (canvas) {
    drawExamWoundScene(canvas.getContext('2d'), canvas, ExamState.currentCase, 0, 'none', false);
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function updateExamReasoningSentence() {
  const obsSelect = document.getElementById('exam-select-observation');
  const catSelect = document.getElementById('exam-select-category');
  
  const obsVal = obsSelect.value;
  const catVal = catSelect.value;
  
  const obsText = obsSelect.options[obsSelect.selectedIndex]?.text || "____";
  const catText = catSelect.options[catSelect.selectedIndex]?.text || "____";
  
  const preview = document.getElementById('exam-sentence-preview');
  if (obsVal && catVal) {
    preview.textContent = `Because I observe that ${obsText}, I conclude it resembles a ${catText} wound.`;
  } else {
    preview.textContent = `Because I observe ____, I conclude ____.`;
  }
}

function verifyExamHypothesis() {
  const caseData = EXAM_CASES[ExamState.currentCase];
  
  const obs = document.getElementById('exam-select-observation').value;
  const cat = document.getElementById('exam-select-category').value;
  
  if (!obs || !cat) {
    alert("Please select your clinical observation and diagnostic category first!");
    return;
  }
  
  let isCorrect = true;
  
  // Check basic alignment
  if (obs !== caseData.correctObservation || cat !== caseData.correctCategory) {
    isCorrect = false;
  }
  
  // Check treatment if it's full reasoning
  let tool = "";
  let tension = "";
  let support = "";
  let priority = "";
  
  if (caseData.isFullReasoning) {
    tool = document.getElementById('exam-select-tool').value;
    tension = document.getElementById('exam-select-tension').value;
    support = document.getElementById('exam-select-support').value;
    priority = document.getElementById('exam-select-priority').value;
    
    if (!tool || !tension || !support || !priority) {
      alert("Please complete all treatment strategy selections!");
      return;
    }
    
    if (tool !== caseData.correctTool || tension !== caseData.correctTension || 
        support !== caseData.correctSupport || priority !== caseData.correctPriority) {
      isCorrect = false;
    }
  }
  
  const mentorTip = document.getElementById('exam-mentor-tip');
  
  if (isCorrect) {
    Sound.success();
    mentorTip.textContent = caseData.successTip;
    
    // Unlock timeline
    document.getElementById('exam-timeline-container').classList.remove('hidden');
    document.getElementById('btn-exam-verify').classList.add('hidden');
    document.getElementById('btn-exam-next').classList.remove('hidden');
    
    ExamState.isCorrect = true;
    setExamTimelineStep(0);
  } else {
    Sound.bump();
    // Soft corrective language:
    mentorTip.textContent = "Evidence Check: review the wound edge and depth.";
    
    // Redraw case with failed parameters (e.g. draws complication)
    const canvas = document.getElementById('canvas-exam');
    if (canvas) {
      drawExamWoundScene(canvas.getContext('2d'), canvas, ExamState.currentCase, 0, tension || 'moderate', false);
    }
  }
}

function setExamTimelineStep(step) {
  ExamState.timelineStep = step;
  
  // Update button active classes
  ['btn-exam-day0', 'btn-exam-day7', 'btn-exam-day30'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle('active', idx === step);
    }
  });
  
  // Redraw
  const canvas = document.getElementById('canvas-exam');
  if (canvas) {
    const caseData = EXAM_CASES[ExamState.currentCase];
    const tension = document.getElementById('exam-select-tension').value || 'moderate';
    drawExamWoundScene(canvas.getContext('2d'), canvas, ExamState.currentCase, step, tension, true);
  }
}

function advanceExamCase() {
  ExamState.currentCase++;
  if (ExamState.currentCase >= EXAM_CASES.length) {
    Sound.success();
    showScreen('screen-graduation');
    unlockBadge('apprentice', 'badge-stk-apprentice');
  } else {
    Sound.chime();
    loadExamCase();
  }
}
