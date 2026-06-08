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
  level3Attempts: 0
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
});

function showScreen(screenId) {
  const screens = [
    'screen-prologue', 'screen-courtyard', 'screen-gourd', 
    'screen-cloth', 'screen-bamboo', 'screen-doll', 
    'screen-gallery', 'screen-level2', 'screen-treatment', 
    'screen-healing', 'screen-graduation'
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
  bendAngle: 0
};

function initGourdLab() {
  const canvas = document.getElementById('canvas-gourd');
  const ctx = canvas.getContext('2d');
  GourdLab.dragPoints = [];
  GourdLab.isDrawing = false;
  GourdLab.outcome = "";
  GourdLab.squashY = 0;
  GourdLab.bendAngle = 0;
  
  document.getElementById('gourd-mentor-tip').textContent = "Observe rind thickness first.";
  drawGourdScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    GourdLab.isDrawing = true;
    GourdLab.dragPoints = [];
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
    const midY = canvas.height * 0.45;
    if (y > midY - 20 && y < midY + 10) {
      GourdLab.squashY = Math.min(25, GourdLab.squashY + 1.2);
    }
    drawGourdScene(ctx, canvas);
  };

  canvas.onmouseup = () => {
    if (GourdLab.isDrawing) {
      GourdLab.isDrawing = false;
      evaluateGourdPuncture();
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
    if (ndl === 'curved') { word = "SMOOTH!"; tip = "Curved slides through soft skin."; Sound.success(); }
    else if (ndl === 'straight') { word = "POP!"; tip = "Straight needles pop soft rinds quickly."; Sound.pierce(); }
    else { word = "TEAR!"; tip = "Triangular tips cut soft tissue too easily."; Sound.bump(); }
  } else if (mat === 'thick') {
    if (ndl === 'curved') { word = "STUCK!"; tip = "Curved needles struggle with thickness."; Sound.bump(); GourdLab.squashY = 15; }
    else if (ndl === 'straight') { word = "BENT!"; tip = "Straight needles bend under heavy pressure."; Sound.bump(); GourdLab.bendAngle = 0.5; }
    else { word = "POP!"; tip = "Triangular needles slice thick fibers cleanly."; Sound.pierce(); }
  } else { // melon
    if (ndl === 'curved') { word = "SMOOTH!"; tip = "Curved glides along melon roundness."; Sound.success(); }
    else if (ndl === 'straight') { word = "BENT!"; tip = "Straight needle bends against melon curves."; Sound.bump(); GourdLab.bendAngle = -0.4; }
    else { word = "TEAR!"; tip = "Triangular edges split brittle melons."; Sound.bump(); }
  }

  GourdLab.outcome = word;
  document.getElementById('gourd-mentor-tip').textContent = tip;
}

// ------------------------------------------
// YARD 2: THREAD MASTER
// ------------------------------------------
const ClothBoard = {
  stitches: [],
  isDrawing: false,
  startX: 0, startY: 0,
  curX: 0, curY: 0,
  tension: 50,
  combo: 0
};

function initClothBoard() {
  const canvas = document.getElementById('canvas-cloth');
  const ctx = canvas.getContext('2d');
  ClothBoard.stitches = [];
  ClothBoard.isDrawing = false;
  ClothBoard.combo = 0;
  
  document.getElementById('cloth-stitch-count').textContent = 0;
  document.getElementById('cloth-combo-streak').textContent = 0;
  document.getElementById('cloth-mentor-tip').textContent = "Too much pull wrinkles.";
  
  drawClothScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    ClothBoard.startX = e.clientX - rect.left;
    ClothBoard.startY = e.clientY - rect.top;
    ClothBoard.isDrawing = true;
  };

  canvas.onmousemove = (e) => {
    if (!ClothBoard.isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ClothBoard.curX = e.clientX - rect.left;
    ClothBoard.curY = e.clientY - rect.top;
    drawClothScene(ctx, canvas);
  };

  canvas.onmouseup = () => {
    if (ClothBoard.isDrawing) {
      ClothBoard.isDrawing = false;
      const midX = canvas.width / 2;
      const crossed = (ClothBoard.startX < midX && ClothBoard.curX > midX) || (ClothBoard.startX > midX && ClothBoard.curX < midX);

      if (crossed && Math.abs(ClothBoard.startX - ClothBoard.curX) > 25) {
        Sound.pierce();
        
        // Calculate spacing combo
        let spacingOkay = true;
        if (ClothBoard.stitches.length > 0) {
          const lastStitch = ClothBoard.stitches[ClothBoard.stitches.length - 1];
          const distY = Math.abs(ClothBoard.startY - lastStitch.y1);
          // Ideal spacing is 35px - 55px
          if (distY >= 30 && distY <= 60) {
            ClothBoard.combo++;
          } else {
            ClothBoard.combo = 0;
          }
        }
        
        ClothBoard.stitches.push({
          x1: ClothBoard.startX, y1: ClothBoard.startY,
          x2: ClothBoard.curX, y2: ClothBoard.curY
        });

        document.getElementById('cloth-stitch-count').textContent = ClothBoard.stitches.length;
        document.getElementById('cloth-combo-streak').textContent = ClothBoard.combo;

        // Mentor update
        if (ClothBoard.tension > 75) {
          document.getElementById('cloth-mentor-tip').textContent = "Too tight! Red wrinkles appear.";
          Sound.bump();
        } else if (ClothBoard.tension < 30) {
          document.getElementById('cloth-mentor-tip').textContent = "Too loose! Suture loops gap.";
        } else {
          document.getElementById('cloth-mentor-tip').textContent = "Balanced pull approximation holds smoothly.";
          if (ClothBoard.combo > 0) Sound.success();
        }
      }
      drawClothScene(ctx, canvas);
    }
  };
}

function updateClothTension() {
  ClothBoard.tension = parseInt(document.getElementById('cloth-tension-slider').value);
  document.getElementById('cloth-tension-val').textContent = `${ClothBoard.tension}%`;
  
  if (ClothBoard.stitches.length > 0) {
    if (ClothBoard.tension > 75) {
      document.getElementById('cloth-mentor-tip').textContent = "Too tight! Red wrinkles appear.";
    } else if (ClothBoard.tension < 30) {
      document.getElementById('cloth-mentor-tip').textContent = "Too loose! Suture loops gap.";
    } else {
      document.getElementById('cloth-mentor-tip').textContent = "Balanced pull approximation holds smoothly.";
    }
  }

  const canvas = document.getElementById('canvas-cloth');
  drawClothScene(canvas.getContext('2d'), canvas);
}

function clearStitches() {
  Sound.bump();
  initClothBoard();
}

// ------------------------------------------
// YARD 3: BAMBOO MAZE
// ------------------------------------------
const BambooTunnel = {
  probeX: 50, probeY: 150,
  probeRadius: 8,
  isDragging: false,
  collisions: 0,
  smoothness: 100,
  lotuses: [
    {x: 200, y: 150 + 60*Math.sin(200*Math.PI*2/600), collected: false},
    {x: 350, y: 150 + 60*Math.sin(350*Math.PI*2/600), collected: false},
    {x: 480, y: 150 + 60*Math.sin(480*Math.PI*2/600), collected: false}
  ],
  sparkTimer: 0,
  sparkX: 0, sparkY: 0
};

function initBambooTunnel() {
  const canvas = document.getElementById('canvas-bamboo');
  const ctx = canvas.getContext('2d');
  BambooTunnel.probeX = 50;
  BambooTunnel.probeY = 150;
  BambooTunnel.collisions = 0;
  BambooTunnel.smoothness = 100;
  BambooTunnel.isDragging = false;
  BambooTunnel.sparkTimer = 0;
  
  BambooTunnel.lotuses.forEach(l => l.collected = false);

  document.getElementById('bamboo-collisions').textContent = 0;
  document.getElementById('bamboo-tokens-val').textContent = "0 / 3";
  document.getElementById('bamboo-smoothness').textContent = "100%";
  document.getElementById('bamboo-mentor-tip').textContent = "Curved tools handle bends best.";

  drawBambooScene(ctx, canvas);

  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dist = Math.hypot(mx - BambooTunnel.probeX, my - BambooTunnel.probeY);
    if (dist < BambooTunnel.probeRadius + 15) {
      BambooTunnel.isDragging = true;
    }
  };

  canvas.onmousemove = (e) => {
    if (!BambooTunnel.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    // Movement modifications based on probe type
    if (GameState.activeProbe === 'straight') {
      // Straight probe slides with high horizontal momentum but is hard to adjust vertically
      my = 0.8 * BambooTunnel.probeY + 0.2 * my; 
    } else if (GameState.activeProbe === 'hooked') {
      // Hooked probe is slow and drags
      mx = 0.75 * BambooTunnel.probeX + 0.25 * mx;
      my = 0.75 * BambooTunnel.probeY + 0.25 * my;
    }

    const hit = checkBambooCollision(mx, my, canvas);
    if (hit) {
      BambooTunnel.collisions++;
      BambooTunnel.sparkTimer = 8;
      BambooTunnel.sparkX = mx;
      BambooTunnel.sparkY = my;
      Sound.bump();
      document.getElementById('bamboo-collisions').textContent = BambooTunnel.collisions;
      BambooTunnel.smoothness = Math.max(10, 100 - BambooTunnel.collisions * 3);
      document.getElementById('bamboo-smoothness').textContent = `${BambooTunnel.smoothness}%`;
    }

    BambooTunnel.probeX = mx;
    BambooTunnel.probeY = my;

    // Check lotus tokens collection
    // Hooked probe has 2.5x larger collection reach
    const collectReach = GameState.activeProbe === 'hooked' ? 30 : 15;
    BambooTunnel.lotuses.forEach(l => {
      if (!l.collected) {
        const d = Math.hypot(mx - l.x, my - l.y);
        if (d < collectReach) {
          l.collected = true;
          Sound.success();
          const collectedCount = BambooTunnel.lotuses.filter(x => x.collected).length;
          document.getElementById('bamboo-tokens-val').textContent = `${collectedCount} / 3`;
        }
      }
    });

    // Exit check
    if (mx > canvas.width - 65 && Math.abs(my - 150) < 30) {
      BambooTunnel.isDragging = false;
      Sound.chime();
      document.getElementById('bamboo-mentor-tip').textContent = "Goal reached! Click Complete Challenge to advance.";
    }

    drawBambooScene(ctx, canvas);
  };

  canvas.onmouseup = () => {
    BambooTunnel.isDragging = false;
  };
}

function selectBambooProbe(probe) {
  Sound.click();
  GameState.activeProbe = probe;
  ['straight', 'curved', 'hooked'].forEach(id => {
    document.getElementById(`btn-probe-${id}`).classList.toggle('active', id === probe);
  });
  
  if (probe === 'straight') {
    document.getElementById('bamboo-mentor-tip').textContent = "Straight slide has high inertia.";
  } else if (probe === 'curved') {
    document.getElementById('bamboo-mentor-tip').textContent = "Curved probe flows smoothly.";
  } else {
    document.getElementById('bamboo-mentor-tip').textContent = "Hooked grabs lotuses from further away.";
  }
  
  resetBambooTunnel();
}

function checkBambooCollision(x, y, canvas) {
  const sineFreq = (Math.PI * 2) / canvas.width;
  const pathY = 150 + 60 * Math.sin(x * sineFreq);
  const boundaryHeight = 32;
  return Math.abs(y - pathY) > (boundaryHeight - BambooTunnel.probeRadius);
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
    document.getElementById('current-pathway-badge').textContent = "Investigator";
    document.getElementById('pathway-progress').style.width = "70%";

    setupLevel3Scenarios();
  } else {
    // Advance to Graduation badge screen
    showScreen('screen-graduation');
    document.getElementById('current-pathway-badge').textContent = "Sushruta's Apprentice";
    document.getElementById('pathway-progress').style.width = "100%";
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
    document.getElementById('current-pathway-badge').textContent = "Sushruta's Apprentice";
    document.getElementById('pathway-progress').style.width = "100%";
    unlockBadge('apprentice', 'badge-stk-apprentice');
  };
}
