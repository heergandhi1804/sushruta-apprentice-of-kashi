// canvas.js - Premium Graphics and Animations for Apprentice of Kashi

// =============================================================
// §1a SHARED CANVAS HELPERS
// =============================================================

// Stylized dusk battlefield backdrop — reused on all clinical screens
function drawBattlefield(ctx, canvas) {
  const W = canvas.width, H = canvas.height;
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#7c3f1a');
  sky.addColorStop(0.5, '#d4762a');
  sky.addColorStop(1, '#f0b060');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.55, 0, H);
  ground.addColorStop(0, '#c8973a');
  ground.addColorStop(1, '#8b6220');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  // Distant tent silhouettes
  ctx.fillStyle = 'rgba(60,30,10,0.55)';
  [[0.08, 0.52, 0.07], [0.22, 0.50, 0.06], [0.65, 0.51, 0.08], [0.82, 0.49, 0.05]].forEach(([rx, ry, rw]) => {
    const tx = rx * W, ty = ry * H, tw = rw * W;
    ctx.beginPath();
    ctx.moveTo(tx - tw, ty + tw * 0.9);
    ctx.lineTo(tx, ty - tw * 1.6);
    ctx.lineTo(tx + tw, ty + tw * 0.9);
    ctx.closePath();
    ctx.fill();
  });

  // Faint spears/standards
  ctx.strokeStyle = 'rgba(60,30,10,0.35)';
  ctx.lineWidth = 1.5;
  [[0.15, 0.30], [0.40, 0.28], [0.72, 0.29], [0.88, 0.32]].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.moveTo(rx * W, ry * H);
    ctx.lineTo(rx * W, H * 0.56);
    ctx.stroke();
    // pennant
    ctx.fillStyle = 'rgba(180,60,20,0.4)';
    ctx.beginPath();
    ctx.moveTo(rx * W, ry * H);
    ctx.lineTo(rx * W + 10, ry * H + 6);
    ctx.lineTo(rx * W, ry * H + 12);
    ctx.closePath();
    ctx.fill();
  });
}

// Expressive soldier face — mood 0=agony, 100=relief
function drawSoldierFace(ctx, x, y, r, mood) {
  const t = Math.max(0, Math.min(1, mood / 100));

  // Head circle
  ctx.save();
  const skinGrad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  skinGrad.addColorStop(0, '#f5d0a0');
  skinGrad.addColorStop(1, '#c8923a');
  ctx.fillStyle = skinGrad;
  ctx.strokeStyle = '#7c4a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill(); ctx.stroke();

  // Eyes
  const eyeY = y - r * 0.15;
  const eyeOpenH = 2 + t * 4; // narrow in pain, open in relief
  ctx.fillStyle = '#292524';
  [-0.35, 0.35].forEach(ex => {
    ctx.beginPath();
    ctx.ellipse(x + ex * r, eyeY, r * 0.12, eyeOpenH, 0, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Brows — furrowed (pain) → relaxed (relief)
  const browY = eyeY - r * 0.22;
  const browAngle = (1 - t) * 0.35; // steep in pain
  ctx.strokeStyle = '#5a3010';
  ctx.lineWidth = 2;
  [-0.38, 0.38].forEach((ex, i) => {
    const sign = i === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x + ex * r - r * 0.12, browY + sign * browAngle * r * 0.5);
    ctx.lineTo(x + ex * r + r * 0.12, browY - sign * browAngle * r * 0.5);
    ctx.stroke();
  });

  // Mouth — gritted (pain) → soft smile (relief)
  const mouthY = y + r * 0.35;
  ctx.strokeStyle = '#7c3010';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  if (t < 0.4) {
    // gritted — straight line with teeth
    ctx.moveTo(x - r * 0.28, mouthY);
    ctx.lineTo(x + r * 0.28, mouthY);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - r * 0.22, mouthY - 3, r * 0.44, 4);
  } else {
    // gentle curve toward smile
    const curve = (t - 0.4) / 0.6 * r * 0.12;
    ctx.moveTo(x - r * 0.28, mouthY);
    ctx.quadraticCurveTo(x, mouthY + curve, x + r * 0.28, mouthY);
    ctx.stroke();
  }

  // Sweat drops in pain
  if (t < 0.35) {
    ctx.fillStyle = 'rgba(100,160,220,0.7)';
    [[0.55, -0.4], [0.6, 0.1]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.ellipse(x + ex * r, y + ey * r, 2.5, 4, 0.3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
  ctx.restore();
}

// Anatomically readable limb — type: hand|forearm|knee|head|thigh
function drawLimb(ctx, type, x, y, opts = {}) {
  const { wound = false, woundPct = 0.5, scale = 1 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const skin1 = '#f5c898', skin2 = '#d4883a', skin3 = '#b36020';

  if (type === 'forearm') {
    // Forearm horizontal — tapered cylinder
    const grad = ctx.createLinearGradient(0, -30, 0, 30);
    grad.addColorStop(0, skin1); grad.addColorStop(0.5, skin2); grad.addColorStop(1, skin3);
    ctx.fillStyle = grad; ctx.strokeStyle = skin3; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-60, 0, 12, 22, 0, -Math.PI/2, Math.PI/2);
    ctx.bezierCurveTo(-40, -22, 40, -24, 60, -18);
    ctx.lineTo(60, 18);
    ctx.bezierCurveTo(40, 24, -40, 22, -60, 22);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Wrist crease
    ctx.strokeStyle = 'rgba(100,50,10,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(45, -14); ctx.lineTo(45, 14); ctx.stroke();
  }

  else if (type === 'hand') {
    // Palm + 4 fingers
    const grad = ctx.createLinearGradient(0, -20, 0, 50);
    grad.addColorStop(0, skin1); grad.addColorStop(1, skin2);
    ctx.fillStyle = grad; ctx.strokeStyle = skin3; ctx.lineWidth = 2;
    // Palm
    ctx.beginPath(); ctx.roundRect(-28, -10, 56, 48, 8); ctx.fill(); ctx.stroke();
    // Fingers
    [[-20, -28], [-7, -32], [6, -32], [19, -28]].forEach(([fx, fy]) => {
      ctx.beginPath(); ctx.roundRect(fx - 7, fy, 14, 26, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(100,50,10,0.2)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(fx - 5, fy + 9); ctx.lineTo(fx + 5, fy + 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx - 5, fy + 17); ctx.lineTo(fx + 5, fy + 17); ctx.stroke();
      ctx.strokeStyle = skin3; ctx.lineWidth = 2;
      // nail
      ctx.fillStyle = 'rgba(255,240,220,0.9)';
      ctx.beginPath(); ctx.roundRect(fx - 5, fy + 1, 10, 7, 3); ctx.fill();
      ctx.fillStyle = grad;
    });
    // Thumb
    ctx.beginPath(); ctx.roundRect(-42, 4, 14, 22, 6); ctx.fill(); ctx.stroke();
  }

  else if (type === 'knee') {
    // Leg with patella bump
    const grad = ctx.createLinearGradient(0, -60, 0, 60);
    grad.addColorStop(0, skin1); grad.addColorStop(0.5, skin2); grad.addColorStop(1, skin3);
    ctx.fillStyle = grad; ctx.strokeStyle = skin3; ctx.lineWidth = 2;
    // Upper leg
    ctx.beginPath(); ctx.roundRect(-22, -60, 44, 50, 10); ctx.fill(); ctx.stroke();
    // Patella
    ctx.fillStyle = '#f0c080';
    ctx.beginPath(); ctx.ellipse(0, -8, 20, 14, 0, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle = grad;
    // Lower leg
    ctx.beginPath(); ctx.roundRect(-18, 6, 36, 54, 8); ctx.fill(); ctx.stroke();
  }

  else if (type === 'head') {
    // Head with ear and jawline
    const grad = ctx.createRadialGradient(-15, -15, 5, 0, 0, 65);
    grad.addColorStop(0, skin1); grad.addColorStop(1, skin2);
    ctx.fillStyle = grad; ctx.strokeStyle = skin3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 55, 65, 0, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
    // Ear
    ctx.beginPath(); ctx.ellipse(56, 5, 10, 16, 0.3, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-56, 5, 10, 16, -0.3, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
  }

  else if (type === 'thigh') {
    // Thick thigh cylinder
    const grad = ctx.createLinearGradient(0, -60, 0, 60);
    grad.addColorStop(0, skin1); grad.addColorStop(0.5, skin2); grad.addColorStop(1, skin3);
    ctx.fillStyle = grad; ctx.strokeStyle = skin3; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(-32, -70, 64, 140, 18); ctx.fill(); ctx.stroke();
    // Quad line
    ctx.strokeStyle = 'rgba(100,50,10,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(-10, 60); ctx.stroke();
  }

  // Wound line
  if (wound) {
    const wy = woundPct * 40 - 20;
    ctx.strokeStyle = '#e11d48'; ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    if (type === 'forearm') {
      ctx.moveTo(-10, -16); ctx.lineTo(14, 16);
    } else if (type === 'hand') {
      ctx.moveTo(-12, 15); ctx.lineTo(12, 25);
    } else if (type === 'knee') {
      ctx.moveTo(-14, -5); ctx.lineTo(14, 5);
    } else if (type === 'thigh') {
      ctx.moveTo(-20, wy - 10); ctx.lineTo(20, wy + 10);
    } else {
      ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
    }
    ctx.stroke();
    // wound glow
    ctx.strokeStyle = 'rgba(225,29,72,0.2)'; ctx.lineWidth = 6;
    ctx.stroke();
  }

  ctx.restore();
}

// Faint guide overlay for hint system
function drawHintPath(ctx, points, opts = {}) {
  const { dashed = true, alpha = 0.25, color = '#06b6d4', width = 3 } = opts;
  if (!points || points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dashed) ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// Big percent badge — draws centered at (x,y)
function roundedScore(ctx, x, y, pct) {
  const r = 32;
  ctx.save();
  // Circle bg — color by score
  const col = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  ctx.fillStyle = col;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.shadowColor = col;
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  // Text
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${pct === 100 ? 14 : 16}px Outfit`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(pct)}%`, x, y);
  ctx.restore();
}

// Helper: draw arrow head
function drawArrow(ctx, fromx, fromy, tox, toy) {
  const headlen = 7;
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

// ------------------------------------------
// YARD 1: GOURD POP
// ------------------------------------------

// Helper to check if a point (x, y) is inside the realistic vegetable body
function isInsideGourd(x, y, canvas) {
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.5;
  const w = canvas.width * 0.8;
  const h = 95; // height of gourd body

  if (GourdLab.material === 'melon') {
    // Check if inside melon crescent (semi-circle on flat line cy-25)
    const dist = Math.hypot(x - cx, y - (cy - 25));
    return dist >= 0 && dist <= 150 && y >= cy - 25;
  } else {
    // Check if inside bottle gourd body
    const startX = cx - w/2;
    const endX = cx + w/2;
    if (x < startX || x > endX) return false;

    // Gourd upper/lower profile height approximation
    const pct = (x - startX) / w;
    let localH = 25;
    if (pct > 0.4) {
      // Bulbous body
      const bulbPct = (pct - 0.4) / 0.6; // 0 to 1
      localH = 25 + Math.sin(bulbPct * Math.PI) * (h - 25);
    }
    return y >= cy - localH && y <= cy + localH;
  }
}

function drawGourdScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background grid
  ctx.fillStyle = '#faf9f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#eae6dc';
  ctx.lineWidth = 1;
  const spacing = 20;
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  const cx = canvas.width / 2;
  const cy = canvas.height * 0.5; // Perfect vertical centering
  const w = canvas.width * 0.8; // 20% wider gourd
  const h = 95; // 20% thicker gourd body
  const squash = GourdLab.squashY;

  ctx.save();
  
  if (GourdLab.material === 'melon') {
    // Symmetrical squash for Melon: scale vertically by (1 - squash/140)
    const scaleY = 1 - squash / 140;
    
    // Draw outer green rind
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 25, 150, 150 * scaleY, 0, 0, Math.PI);
    ctx.lineTo(cx - 150, cy - 25);
    ctx.closePath();
    ctx.fill();

    // Draw inner light rind layer
    ctx.fillStyle = '#ccfbf1';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 25, 138, 138 * scaleY, 0, 0, Math.PI);
    ctx.lineTo(cx - 138, cy - 25);
    ctx.closePath();
    ctx.fill();

    // Draw melon flesh
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 25, 125, 125 * scaleY, 0, 0, Math.PI);
    ctx.lineTo(cx - 125, cy - 25);
    ctx.closePath();
    ctx.fill();

    // Draw flat top slice face
    ctx.fillStyle = '#fecdd3';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 25, 108, 108 * scaleY, 0, 0, Math.PI);
    ctx.lineTo(cx - 108, cy - 25);
    ctx.closePath();
    ctx.fill();

    // Draw melon seeds
    ctx.fillStyle = '#451a03'; // brown seeds
    for (let angle = 0.2; angle < Math.PI - 0.2; angle += 0.4) {
      const sx = cx + 82 * Math.cos(angle);
      const sy = (cy - 25) + 82 * Math.sin(angle) * scaleY;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4, 6 * scaleY, angle, 0, 2*Math.PI);
      ctx.fill();
    }
  } else {
    // Draw realistic bottle gourd horizontally
    const startX = cx - w/2;
    const endX = cx + w/2;

    // Symmetrical squash: reduce height as squash increases
    const currentH = h - squash * 0.5;

    // Create a 3D cylindrical lighting gradient
    const grad = ctx.createLinearGradient(0, cy - currentH, 0, cy + currentH);
    if (GourdLab.material === 'thick') {
      // Thick Gourd: Darker green, tougher skin
      grad.addColorStop(0, '#166534');
      grad.addColorStop(0.3, '#22c55e');
      grad.addColorStop(0.5, '#4ade80');
      grad.addColorStop(0.8, '#166534');
      grad.addColorStop(1, '#14532d');
    } else {
      // Soft Gourd: Light lime-green, soft skin
      grad.addColorStop(0, '#3f6212');
      grad.addColorStop(0.2, '#84cc16');
      grad.addColorStop(0.5, '#bef264');
      grad.addColorStop(0.8, '#65a30d');
      grad.addColorStop(1, '#3f6212');
    }

    ctx.fillStyle = grad;
    ctx.strokeStyle = GourdLab.material === 'thick' ? '#14532d' : '#3f6212';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(startX, cy - 15);
    ctx.quadraticCurveTo(startX + w*0.3, cy - 20, startX + w*0.4, cy - 22);
    ctx.bezierCurveTo(startX + w*0.6, cy - currentH*0.8, startX + w*0.95, cy - currentH*0.8, endX, cy);
    ctx.bezierCurveTo(startX + w*0.95, cy + currentH*0.8, startX + w*0.6, cy + currentH*0.8, startX + w*0.4, cy + 22);
    ctx.quadraticCurveTo(startX + w*0.3, cy + 20, startX, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw stem at the left neck tip (remains stable)
    ctx.strokeStyle = '#78350f'; // brown stem
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, cy);
    ctx.quadraticCurveTo(startX - 25, cy - 10, startX - 35, cy - 5);
    ctx.stroke();

    // Draw small dried flower node on the right body end (remains stable)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(endX, cy, 4, 0, 2*Math.PI);
    ctx.fill();
  }

  ctx.restore();

  // TEAR scar drawn ON the food surface (after food body, before needle overlay)
  if (GourdLab.outcome === 'TEAR!' && GourdLab.tearPath && GourdLab.tearPath.length > 1) {
    const tp = GourdLab.tearPath;
    ctx.save();
    // Wide exposed flesh channel
    ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#fde68a';
    ctx.beginPath();
    tp.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();
    // Darker interior of split
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#92400e';
    ctx.beginPath();
    tp.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();
    // Jagged torn edges (left side)
    ctx.lineWidth = 2; ctx.strokeStyle = '#1c0a00';
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    tp.forEach((p, i) => { const dx = i % 2 === 0 ? -4 : -2; i ? ctx.lineTo(p.x + dx, p.y) : ctx.moveTo(p.x + dx, p.y); });
    ctx.stroke();
    // Jagged torn edges (right side)
    ctx.beginPath();
    tp.forEach((p, i) => { const dx = i % 2 === 0 ? 5 : 3; i ? ctx.lineTo(p.x + dx, p.y) : ctx.moveTo(p.x + dx, p.y); });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Draw drag path and needle
  if (GourdLab.dragPoints.length > 1) {
    ctx.lineWidth = 3.5;
    
    // Draw segment by segment to mix needle and rind visually (solid thread inside, dashed outside)
    for (let i = 1; i < GourdLab.dragPoints.length; i++) {
      const p1 = GourdLab.dragPoints[i - 1];
      const p2 = GourdLab.dragPoints[i];
      
      // Check if both ends are inside the vegetable skin
      const inside1 = isInsideGourd(p1.x, p1.y, canvas);
      const inside2 = isInsideGourd(p2.x, p2.y, canvas);
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      
      if (inside1 && inside2) {
        // Inside flesh: Draw solid bright orange suture thread
        ctx.strokeStyle = '#ea580c';
        ctx.setLineDash([]);
        ctx.stroke();
      } else if (!inside1 && !inside2) {
        // In the air: Draw standard dashed guideline thread
        ctx.strokeStyle = '#78716c';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      } else {
        // Crossing boundary: draw transition thread and small entry/exit puncture holes!
        ctx.strokeStyle = '#ea580c';
        ctx.setLineDash([]);
        ctx.stroke();
        
        ctx.save();
        ctx.fillStyle = '#451a03'; // dark hole
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 4.5, 0, 2*Math.PI);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.setLineDash([]);

    // Draw active needle shape at tip
    const last = GourdLab.dragPoints[GourdLab.dragPoints.length - 1];
    ctx.save();
    ctx.translate(last.x, last.y);
    ctx.rotate(GourdLab.bendAngle);

    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    if (GourdLab.needle === 'triangular') {
      ctx.moveTo(0, -12);
      ctx.lineTo(-6, 4);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (GourdLab.needle === 'straight') {
      ctx.moveTo(0, -15);
      ctx.lineTo(-2, 5);
      ctx.lineTo(2, 5);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else { // curved
      ctx.arc(-4, 0, 10, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.restore();

  }

  // Big outcome banner + dynamic effects at needle tip
  if (GourdLab.outcome) {
    const W = canvas.width, H = canvas.height;
    const isWin = GourdLab.outcome === 'SMOOTH!';
    const col = isWin ? '#10b981' : '#ef4444';
    // Get needle tip position (last drag point, or canvas center as fallback)
    const tipPt = GourdLab.dragPoints.length > 0 ? GourdLab.dragPoints[GourdLab.dragPoints.length - 1] : { x: W/2, y: H*0.5 };
    const tx = tipPt.x, ty = tipPt.y;

    ctx.save();
    ctx.fillStyle = isWin ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.11)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.roundRect(W*0.18, H*0.06, W*0.64, H*0.17, 12); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Outfit';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((isWin ? '✓ ' : '✗ ') + GourdLab.outcome, W/2, H*0.06 + H*0.085);

    if (GourdLab.outcome === 'TEAR!') {
      // Jagged tear lines radiating from the needle tip on the food surface
      ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      const tearLines = [[-8,-32,6,-52],[10,-28,28,-48],[14,8,32,22],[-12,10,-28,28],[2,-18,20,-38]];
      tearLines.forEach(([dx1,dy1,dx2,dy2]) => {
        ctx.beginPath(); ctx.moveTo(tx+dx1, ty+dy1); ctx.lineTo(tx+dx2, ty+dy2); ctx.stroke();
      });
      // Radiating crack splinters around tip
      ctx.strokeStyle = 'rgba(150,30,10,0.5)'; ctx.lineWidth = 1.5;
      for (let a = 0; a < Math.PI*2; a += Math.PI/5) {
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(a)*12, ty + Math.sin(a)*10);
        ctx.lineTo(tx + Math.cos(a)*30, ty + Math.sin(a)*26);
        ctx.stroke();
      }
    }

    if (GourdLab.outcome === 'STUCK!') {
      // Resistance indicator: concentric halos around the stuck needle tip
      for (let r = 18; r <= 44; r += 13) {
        ctx.strokeStyle = `rgba(245,158,11,${0.7 - r*0.01})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(tx, ty, r, 0, 2*Math.PI); ctx.stroke();
      }
      // Small inward arrows showing the material pushing back
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      for (let a = 0; a < Math.PI*2; a += Math.PI/3) {
        const r1 = 52, r2 = 34;
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(a)*r1, ty + Math.sin(a)*r1);
        ctx.lineTo(tx + Math.cos(a)*r2, ty + Math.sin(a)*r2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // All-matched celebration
  if (GourdLab.matchedItems.length === 3) {
    const W = canvas.width, H = canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(5,150,105,0.20)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#065f46'; ctx.font = 'bold 20px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('ALL 3 MATERIALS MATCHED!', W/2, H*0.03);
    ctx.fillStyle = '#047857'; ctx.font = 'bold 13px Outfit';
    ctx.fillText('Click "Complete Challenge" below to advance', W/2, H*0.12);
    ctx.restore();
  }
}

// ------------------------------------------
// YARD 2: THREAD MASTER
// ------------------------------------------
function drawClothScene(ctx, canvas) {
  const W = canvas.width, H = canvas.height, midX = W / 2;
  const cfg = WOUNDS[ClothBoard.woundType];
  const tension = ClothBoard.tension;
  ctx.clearRect(0, 0, W, H);

  // Battlefield backdrop
  drawBattlefield(ctx, canvas);

  // Forearm — cylinder gradient (3-D roundness)
  const aL = W * 0.10, aR = W * 0.90, aT = H * 0.04, aB = H * 0.88;
  const skinGrad = ctx.createLinearGradient(aL, 0, aR, 0);
  skinGrad.addColorStop(0.00, '#a04818');
  skinGrad.addColorStop(0.12, '#d88040');
  skinGrad.addColorStop(0.38, '#f5c090');
  skinGrad.addColorStop(0.55, '#f8d8b0');
  skinGrad.addColorStop(0.80, '#d88040');
  skinGrad.addColorStop(1.00, '#9a4010');
  ctx.fillStyle = skinGrad;
  ctx.strokeStyle = '#7c3010'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(aL, aT, aR - aL, aB - aT, 30); ctx.fill(); ctx.stroke();

  // Gloss highlight
  const gloss = ctx.createLinearGradient(aL + (aR-aL)*0.28, 0, aL + (aR-aL)*0.58, 0);
  gloss.addColorStop(0, 'rgba(255,255,255,0)');
  gloss.addColorStop(0.4, 'rgba(255,255,255,0.22)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gloss;
  ctx.beginPath(); ctx.roundRect(aL, aT, aR - aL, (aB - aT) * 0.28, [30, 30, 0, 0]); ctx.fill();

  // Anatomy creases
  ctx.strokeStyle = 'rgba(100,45,10,0.14)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(aL+35, H*0.33); ctx.lineTo(aR-35, H*0.31); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(aL+45, H*0.67); ctx.lineTo(aR-45, H*0.69); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 9px Cinzel'; ctx.textAlign = 'left';
  ctx.fillText('SOLDIER FOREARM — ' + cfg.name.toUpperCase(), aL + 10, aT + 16);

  // Wound geometry — computed inline (no anchors)
  const wY1 = H * 0.15, wY2 = H * 0.85;
  const gap = tension < 30 ? 11 : tension > 75 ? -3 : 3;
  const nPts = cfg.rows * 4;

  if (cfg.shallow) {
    // Scraped — surface abrasion patch
    ctx.fillStyle = 'rgba(200,80,50,0.26)';
    ctx.fillRect(midX - 28, wY1, 56, wY2 - wY1);
    ctx.fillStyle = 'rgba(155,45,25,0.55)';
    for (let i = 0; i < 130; i++)
      ctx.fillRect(midX - 26 + Math.random() * 52, wY1 + Math.random() * (wY2 - wY1), 1.6, 1.6);
  } else {
    // Deep wound channel
    const wPts = [];
    for (let i = 0; i < nPts; i++) {
      const t = i / (nPts - 1);
      const y = wY1 + t * (wY2 - wY1);
      const j = cfg.jitter ? Math.sin(i * 2.1) * cfg.jitter * 0.6 : 0;
      wPts.push({ y, lx: midX - Math.abs(gap) - Math.abs(j), rx: midX + Math.abs(gap) + Math.abs(j) });
    }
    ctx.fillStyle = '#5a1008';
    ctx.beginPath();
    wPts.forEach((a, i) => { i ? ctx.lineTo(a.lx, a.y) : ctx.moveTo(a.lx, a.y); });
    for (let i = wPts.length - 1; i >= 0; i--) ctx.lineTo(wPts[i].rx, wPts[i].y);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#8a3020';
    for (const side of ['lx', 'rx']) {
      ctx.beginPath();
      wPts.forEach((a, i) => { i ? ctx.lineTo(a[side], a.y) : ctx.moveTo(a[side], a.y); });
      ctx.stroke();
    }
    // Blood beads
    ctx.fillStyle = 'rgba(140,20,20,0.70)';
    wPts.filter((_, i) => i % Math.max(1, (nPts / 5 | 0)) === 0).forEach(a => {
      ctx.beginPath(); ctx.arc(midX, a.y, 2.2, 0, 2*Math.PI); ctx.fill();
    });
  }

  // Placed free-hand stitches
  const stitchCol = tension > 75 ? '#ef4444' : tension < 30 ? '#eab308' : '#10b981';
  ClothBoard.placed.forEach(s => {
    ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.strokeStyle = stitchCol;
    ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    ctx.fillStyle = stitchCol;
    [[s.x1, s.y1], [s.x2, s.y2]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 2*Math.PI); ctx.fill();
    });
  });

  // In-progress stitch preview while dragging
  if (ClothBoard.drawStart && ClothBoard.drawCurrent) {
    ctx.strokeStyle = 'rgba(200,200,200,0.6)'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ClothBoard.drawStart.x, ClothBoard.drawStart.y);
    ctx.lineTo(ClothBoard.drawCurrent.x, ClothBoard.drawCurrent.y);
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Stitch count badge (no optimum revealed before Analyze)
  if (ClothBoard.placed.length > 0 && !ClothBoard.analyzed) {
    const n = ClothBoard.placed.length;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.50)'; ctx.beginPath(); ctx.roundRect(aR - 130, aB + 4, 128, 22, 6); ctx.fill();
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px Outfit'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(`${n} ${n === 1 ? 'stitch' : 'stitches'} placed`, aR - 6, aB + 8);
    ctx.restore();
  }

  // Optimum Guide — only revealed after Analyze
  if (ClothBoard.analyzed) {
    const step = (wY2 - wY1) / (cfg.optimum + 1);
    for (let i = 1; i <= cfg.optimum; i++) {
      const y = wY1 + i * step;
      ctx.strokeStyle = 'rgba(13,148,136,0.88)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(aL + 8, y); ctx.lineTo(aR - 8, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(13,148,136,0.8)';
      [[aL + 4, y], [aR - 4, y]].forEach(([x, y2]) => { ctx.beginPath(); ctx.arc(x, y2, 3, 0, 2*Math.PI); ctx.fill(); });
    }
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(aL, aB + 4, aR - aL, 22, 6); ctx.fill();
    ctx.fillStyle = '#2dd4bf'; ctx.font = 'bold 11px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(`Optimum: ${cfg.optimum} stitches · tension ${cfg.optTension[0]}–${cfg.optTension[1]}%`, midX, aB + 8);
    ctx.restore();
  }

  // Hint overlay — ghost horizontal guides at ideal stitch positions
  if (typeof GameState !== 'undefined' && (GameState.hints?.['cloth'] || 0) >= 1 && !ClothBoard.analyzed) {
    const step = (wY2 - wY1) / (cfg.optimum + 1);
    for (let i = 1; i <= cfg.optimum; i++) {
      const y = wY1 + i * step;
      ctx.strokeStyle = 'rgba(13,148,136,0.32)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(midX - 50, y); ctx.lineTo(midX + 50, y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// ------------------------------------------
// YARD 3: BAMBOO MAZE
// ------------------------------------------

// shared channel centerline (1.5 gentle cycles), relative to canvas
function bambooCenterY(x, canvas) {
  const H = canvas.height || 360;
  return H / 2 + H * 0.20 * Math.sin((x / (canvas.width || 600)) * Math.PI * 2 * 1.5);
}

// a real lotus: layered petals + golden seed center
function drawLotus(ctx, x, y, scale, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.rotate(Math.sin(t || 0) * 0.05);
  const petal = (len, wid, fill, stroke) => {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(wid, -len * 0.55, 0, -len);
    ctx.quadraticCurveTo(-wid, -len * 0.55, 0, 0); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = stroke; ctx.stroke();
  };
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4 + Math.PI / 8); petal(13, 5, '#f9a8d4', '#db2777'); ctx.restore(); }
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); petal(11, 4.5, '#fde7f0', '#ec4899'); ctx.restore(); }
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 5); g.addColorStop(0, '#fde68a'); g.addColorStop(1, '#d97706');
  ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, 2 * Math.PI); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#92400e';
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.arc(Math.cos(a) * 2, Math.sin(a) * 2, 0.7, 0, 2 * Math.PI); ctx.fill(); }
  ctx.restore();
}

function drawBambooScene(ctx, canvas) {
  const W = canvas.width, H = canvas.height, t = performance.now() / 600;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (BambooTunnel.shake > 0) { ctx.translate((Math.random() - .5) * BambooTunnel.shake, (Math.random() - .5) * BambooTunnel.shake); BambooTunnel.shake -= 1; }

  // warm parchment surround
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f7efdf'); bg.addColorStop(1, '#efe2c8');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const lumen = H * 0.12, wall = H * 0.14;
  const pts = []; for (let x = 0; x <= W; x += 6) pts.push({ x, y: bambooCenterY(x, canvas) });

  // bamboo wall bands offset from centerline
  const bambooWall = (sign) => {
    ctx.beginPath();
    pts.forEach((p, i) => { const y = p.y + sign * (lumen + wall); i ? ctx.lineTo(p.x, y) : ctx.moveTo(p.x, y); });
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; ctx.lineTo(p.x, p.y + sign * lumen); }
    ctx.closePath();
    const wg = ctx.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, '#3f6212'); wg.addColorStop(0.5, '#65a30d'); wg.addColorStop(1, '#365314');
    ctx.fillStyle = wg; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#2f4310'; ctx.stroke();
    // node rings every ~70px
    ctx.strokeStyle = 'rgba(20,40,8,0.55)'; ctx.lineWidth = 2.5;
    for (let x = 40; x < W; x += 70) {
      const cy = bambooCenterY(x, canvas);
      ctx.beginPath(); ctx.moveTo(x, cy + sign * lumen); ctx.lineTo(x, cy + sign * (lumen + wall)); ctx.stroke();
    }
    // glossy highlight near lumen edge
    ctx.beginPath();
    pts.forEach((p, i) => { const y = p.y + sign * (lumen + 3); i ? ctx.lineTo(p.x, y) : ctx.moveTo(p.x, y); });
    ctx.strokeStyle = 'rgba(190,242,100,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  };
  bambooWall(-1); bambooWall(1);

  // inner channel floor (soft inner shadow — cutaway tube)
  ctx.beginPath();
  pts.forEach((p, i) => { const y = p.y - lumen; i ? ctx.lineTo(p.x, y) : ctx.moveTo(p.x, y); });
  for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y + lumen);
  ctx.closePath();
  const fg = ctx.createLinearGradient(0, H / 2 - lumen, 0, H / 2 + lumen);
  fg.addColorStop(0, 'rgba(0,0,0,0.10)'); fg.addColorStop(0.5, 'rgba(255,255,255,0.06)'); fg.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = fg; ctx.fill();

  // hint corridor (faint centerline when hint on)
  if (typeof GameState !== 'undefined' && (GameState.hints?.['bamboo'] || 0) >= 1) {
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(13,148,136,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
  }

  // START / EXIT pads
  const sy = bambooCenterY(40, canvas), ey = bambooCenterY(W, canvas);
  ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(40, sy, 16, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Outfit'; ctx.textAlign = 'center'; ctx.fillText('START', 40, sy + 3);
  ctx.fillStyle = '#db2777'; ctx.beginPath(); ctx.arc(W - 40, ey, 16, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('EXIT', W - 40, ey + 3);

  // lotuses (real layered flowers)
  BambooTunnel.lotuses.forEach(l => { if (!l.collected) drawLotus(ctx, l.x, l.y, 1, t + l.x); });

  // curved-probe smooth trail
  if (GameState.activeProbe === 'curved' && BambooTunnel.trail.length > 1) {
    ctx.beginPath(); BambooTunnel.trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(20,184,166,0.45)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  }

  // sparks
  if (BambooTunnel.sparkTimer > 0) {
    const { sparkX: sx, sparkY: sxy } = BambooTunnel; ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) { ctx.beginPath(); ctx.moveTo(sx, sxy); ctx.lineTo(sx + Math.cos(a) * 11, sxy + Math.sin(a) * 11); ctx.stroke(); }
    BambooTunnel.sparkTimer--;
  }

  // probe (metal base + shape-specific tip)
  const px = BambooTunnel.probeX, py = BambooTunnel.probeY;
  ctx.fillStyle = '#e5e7eb'; ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(px, py, BambooTunnel.probeRadius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(px, py); ctx.strokeStyle = '#be185d'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  if (GameState.activeProbe === 'straight') { ctx.moveTo(-12, 0); ctx.lineTo(13, 0); }
  else if (GameState.activeProbe === 'curved') { ctx.arc(2, 0, 9, -Math.PI / 2, Math.PI / 2); }
  else { ctx.moveTo(-10, 6); ctx.lineTo(6, 6); ctx.quadraticCurveTo(13, 6, 12, -3); }
  ctx.stroke(); ctx.restore();

  ctx.restore();
}

// ------------------------------------------
// YARD 4: WRAP RACE
// ------------------------------------------
function drawDollScene(ctx, canvas) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Battlefield backdrop
  drawBattlefield(ctx, canvas);

  let cx = DollWrap.centerX;
  let cy = DollWrap.centerY;
  let rad = DollWrap.radius;

  // Animation offsets
  if (DollWrap.testAction) {
    const cycle = Math.sin(DollWrap.testTimer * 0.4);
    if (DollWrap.testAction === 'walk') {
      cx += cycle * 12;
    } else if (DollWrap.testAction === 'bend') {
      cy += cycle * 10;
      rad += cycle * 3;
    } else if (DollWrap.testAction === 'turn') {
      cy += cycle * 5;
    }
  }

  // Slippage offset
  let slipOffset = 0;
  if (DollWrap.testAction && DollWrap.tightness < 3) {
    slipOffset = (25 - DollWrap.testTimer) * 1.6;
  }

  // Knee / joint cross-section — skin cylinder
  const ks = ctx.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, rad * 0.1, cx, cy, rad * 1.1);
  ks.addColorStop(0, '#f8d8b0');
  ks.addColorStop(0.55, '#d88040');
  ks.addColorStop(1, '#8a3a10');
  ctx.fillStyle = ks; ctx.strokeStyle = '#7c3010'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();

  // Knee cap highlight
  const hl = ctx.createRadialGradient(cx - rad * 0.22, cy - rad * 0.2, 2, cx - rad * 0.22, cy - rad * 0.2, rad * 0.55);
  hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fill();

  // Joint crease lines
  ctx.strokeStyle = 'rgba(100,40,10,0.18)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - rad, cy); ctx.lineTo(cx + rad, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - rad); ctx.lineTo(cx, cy + rad); ctx.stroke();

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = 'bold 9px Cinzel'; ctx.textAlign = 'center';
  ctx.fillText('SOLDIER KNEE JOINT', cx, cy + rad + 16);

  // Wound marker on kneecap (injury that needs bandaging)
  ctx.fillStyle = 'rgba(160,30,20,0.75)';
  ctx.beginPath(); ctx.ellipse(cx + rad * 0.25, cy - rad * 0.15, 7, 4, 0.4, 0, 2 * Math.PI); ctx.fill();

  // Bandage rings (linen color, slightly translucent)
  ctx.lineCap = 'round';
  for (let i = 1; i <= DollWrap.layers; i++) {
    const alpha = Math.max(0.35, 1 - i * 0.07);
    ctx.lineWidth = 7;
    ctx.strokeStyle = `rgba(240,220,170,${alpha})`;
    ctx.beginPath();
    ctx.arc(cx + slipOffset, cy + slipOffset * 0.5, rad + i * 5.5, 0, 2 * Math.PI);
    ctx.stroke();
    // linen texture stripe
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgba(200,175,120,${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(cx + slipOffset, cy + slipOffset * 0.5, rad + i * 5.5, -0.5, Math.PI + 0.5);
    ctx.stroke();
  }

  // Squeeze arrows when too tight
  if (DollWrap.tightness > 7 && DollWrap.layers > 0) {
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const sx = cx + (rad + DollWrap.layers * 5.5 + 14) * Math.cos(angle);
      const sy = cy + (rad + DollWrap.layers * 5.5 + 14) * Math.sin(angle);
      const tx = cx + (rad + DollWrap.layers * 5.5 + 3) * Math.cos(angle);
      const ty = cy + (rad + DollWrap.layers * 5.5 + 3) * Math.sin(angle);
      drawArrow(ctx, sx, sy, tx, ty);
    }
  }

  // Drag trail (gauze path)
  if (DollWrap.history.length > 1) {
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(240,220,170,0.45)';
    ctx.beginPath();
    ctx.moveTo(DollWrap.history[0].x, DollWrap.history[0].y);
    for (let i = 1; i < DollWrap.history.length; i++) ctx.lineTo(DollWrap.history[i].x, DollWrap.history[i].y);
    ctx.stroke();
  }
}

// ------------------------------------------
// SCREEN 1.5: TOOL GALLERY (TOOL MATCH)
// ------------------------------------------
function drawToolMatchScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#faf9f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Draw active tool representation
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'var(--color-pink)';
  ctx.fillStyle = '#cbd5e1';

  const tool = ToolGallery.activeTool;
  ctx.save();
  ctx.translate(cx, cy);

  if (tool === 'probe') {
    // Slender rod with small round head
    ctx.beginPath();
    ctx.roundRect(-4, -60, 8, 120, 4);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -60, 10, 0, 2*Math.PI);
    ctx.fill(); ctx.stroke();
  } else if (tool === 'forceps') {
    // Interlocking scissor jaw halves
    ctx.beginPath();
    ctx.moveTo(-15, 60); ctx.lineTo(-10, 0); ctx.lineTo(-5, -50);
    ctx.moveTo(15, 60); ctx.lineTo(10, 0); ctx.lineTo(5, -50);
    ctx.stroke();
    // jaw tips
    ctx.fillStyle = '#292524';
    ctx.fillRect(-12, -55, 6, 10);
    ctx.fillRect(6, -55, 6, 10);
  } else if (tool === 'scalpel') {
    // Handle + curved cutting edge
    ctx.beginPath();
    ctx.roundRect(-5, -10, 10, 70, 3);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-5, -10);
    ctx.bezierCurveTo(-15, -35, 10, -50, 0, -10);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else { // needle
    // Curved crescent needle shape
    ctx.beginPath();
    ctx.arc(-15, 0, 45, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.restore();

  // Draw simple text overlay
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText("TAP OR ROTATE CONTROLS BELOW TO CHOOSE A TOOL", cx, 30);
}

// ------------------------------------------
// SCREEN 2: FIRST PATIENTS (PATIENT INTAKE)
// ------------------------------------------
function drawDiagnosisScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mattres silhouette
  ctx.fillStyle = '#14b8a6';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(cx - 100, cy - 60, 200, 140, 16);
  ctx.fill(); ctx.stroke();

  // Patient limb
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.roundRect(cx - 30, cy - 40, 60, 100, 20);
  ctx.fill(); ctx.stroke();

  // Draw injury bruise
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 18, 10, 0, 0, 2*Math.PI);
  ctx.fill();

  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 10); ctx.lineTo(cx + 12, cy + 10);
  ctx.stroke();

  // Look scan pink lens overlay
  const lookActive = document.getElementById('btn-diag-look').classList.contains('active');
  if (lookActive) {
    ctx.fillStyle = 'rgba(217, 70, 239, 0.1)';
    ctx.strokeStyle = 'var(--color-pink)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 40, 0, 2 * Math.PI);
    ctx.fill(); ctx.stroke();

    // Look Clue readout
    ctx.fillStyle = '#292524';
    ctx.font = 'bold 8px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText("INSPECTION ACTIVE", cx, cy - 45);
  }
}

// ------------------------------------------
// SCREEN 3: TREATMENT CHALLENGE
// ------------------------------------------
function drawTreatmentScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const midY = canvas.height / 2;

  // Skin background
  ctx.fillStyle = '#fcd34d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(0, midY - 50, canvas.width, 100);

  // Suture lips
  ctx.fillStyle = '#fda4af';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, midY - 15);
  ctx.bezierCurveTo(canvas.width/4, midY - 28, 3*canvas.width/4, midY - 28, canvas.width, midY - 15);
  ctx.lineTo(canvas.width, midY + 15);
  ctx.bezierCurveTo(3*canvas.width/4, midY + 28, canvas.width/4, midY + 28, 0, midY + 15);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  const tension = parseInt(document.getElementById('treat-tension-slider').value);

  // Placed sutures
  TreatmentState.stitches.forEach(st => {
    ctx.lineWidth = 5;
    ctx.strokeStyle = tension > 75 ? '#ef4444' : (tension < 30 ? '#eab308' : '#10b981');
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(st.x1, st.y1);
    ctx.quadraticCurveTo((st.x1 + st.x2)/2, (st.y1 + st.y2)/2 - 12, st.x2, st.y2);
    ctx.stroke();

    // Knot circles
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(st.x1, st.y1, 5, 0, 2 * Math.PI);
    ctx.arc(st.x2, st.y2, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Pull tension vectors
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    drawArrow(ctx, st.x1, st.y1, st.x1, st.y1 + tension/4.5);
    drawArrow(ctx, st.x2, st.y2, st.x2, st.y2 - tension/4.5);
  });

  // Active drag line
  if (TreatmentState.isDrawing) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78716c';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(TreatmentState.startX, TreatmentState.startY);
    ctx.lineTo(TreatmentState.curX, TreatmentState.curY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ------------------------------------------
// SCREEN 4: HEALING TIME MACHINE
// ------------------------------------------
function drawHealingStep(ctx, canvas, step, tension) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const midY = canvas.height / 2;

  // Skin base
  ctx.fillStyle = '#fcd34d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let gap = 16;
  if (step === 0) gap = 12;
  if (step === 1) gap = tension < 35 ? 20 : 4;
  if (step === 2) gap = tension < 35 ? 28 : 0;

  // Draw flesh gap
  if (gap > 0) {
    ctx.fillStyle = '#fda4af';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, midY - gap/2);
    ctx.bezierCurveTo(canvas.width/4, midY - gap/2 - 3, 3*canvas.width/4, midY - gap/2 - 3, canvas.width, midY - gap/2);
    ctx.lineTo(canvas.width, midY + gap/2);
    ctx.bezierCurveTo(3*canvas.width/4, midY + gap/2 + 3, canvas.width/4, midY + gap/2 + 3, 0, midY + gap/2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  // Day 7 Inflammation glow
  if (step === 1) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(0, midY - 24, canvas.width, 48);
  }

  // Day 30 Scar Remodeling
  if (step === 2) {
    if (tension >= 35) {
      ctx.strokeStyle = tension > 75 ? 'var(--color-rose)' : '#ffffff';
      ctx.lineWidth = tension > 75 ? 7 : 2.5;
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY); ctx.stroke();
      
      // Tight wrinkles vectors on Day 30
      if (tension > 75) {
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.3)';
        ctx.lineWidth = 1.5;
        for (let x = 30; x < canvas.width; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, midY - 8); ctx.lineTo(x + 5, midY + 8); ctx.stroke();
        }
      }
    }
  }

  // Draw stitches if before Day 30 removal (step < 2)
  if (step < 2) {
    TreatmentState.stitches.forEach(st => {
      ctx.lineWidth = 5;
      ctx.strokeStyle = tension > 75 ? '#ef4444' : (tension < 30 ? '#eab308' : '#10b981');
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(st.x1, st.y1);
      ctx.quadraticCurveTo((st.x1 + st.x2)/2, (st.y1 + st.y2)/2 - 12, st.x2, st.y2);
      ctx.stroke();

      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.arc(st.x1, st.y1, 4.5, 0, 2*Math.PI);
      ctx.arc(st.x2, st.y2, 4.5, 0, 2*Math.PI);
      ctx.fill();
    });
  }
}

// ------------------------------------------
// LEVEL 1.75: FINAL APPRENTICE EXAMINATION
// ------------------------------------------
function drawExamWoundScene(ctx, canvas, woundIndex, step, tension, isCorrect) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Parchment Background plate
  ctx.fillStyle = '#faf7ed';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Vintage anatomical plate double-line border
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  // 3. Plate Title Header
  ctx.fillStyle = '#78350f';
  ctx.font = 'bold 10px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('SUSHRUTA GURUKUL • CLINICAL STUDY PLATE ' + (woundIndex + 1), canvas.width / 2, 32);

  // 4. Draw stylized anatomical limb
  const cy = canvas.height * 0.52;
  const lx = 80;
  const lw = canvas.width - 160;
  const lh = 85;

  // Draw shadow first
  ctx.shadowColor = 'rgba(120, 53, 15, 0.08)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 10;

  // Limb cylinder linear shading gradient
  const limbGrad = ctx.createLinearGradient(0, cy - lh/2, 0, cy + lh/2);
  limbGrad.addColorStop(0, '#f9ebd2');
  limbGrad.addColorStop(0.3, '#f5dcb3');
  limbGrad.addColorStop(0.5, '#ebd1a0');
  limbGrad.addColorStop(0.8, '#d9be8b');
  limbGrad.addColorStop(1, '#caa774');

  ctx.fillStyle = limbGrad;
  ctx.beginPath();
  // Rounded ends cylinder
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(lx, cy - lh/2, lw, lh, 40);
  } else {
    ctx.rect(lx, cy - lh/2, lw, lh);
  }
  ctx.fill();

  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Draw subtle muscle/anatomy contour lines along the limb
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(lx + 40, cy - lh/3);
  ctx.lineTo(lx + lw - 40, cy - lh/3);
  ctx.moveTo(lx + 50, cy + lh/4);
  ctx.lineTo(lx + lw - 50, cy + lh/4);
  ctx.stroke();

  // 5. Draw specific wound/healing steps based on woundIndex and step
  const wx = canvas.width / 2;
  const wy = cy;

  // Helper: Draw sutures
  function drawSutures(x1, y1, x2, y2, count, styleTension) {
    ctx.strokeStyle = styleTension === 'high' ? '#b91c1c' : '#78350f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const sx = x1 + dx * t;
      const sy = y1 + dy * t;
      
      // Suture cross loop
      ctx.beginPath();
      if (styleTension === 'high') {
        // Tight, straight stitches pulling hard
        ctx.moveTo(sx - 4, sy - 8);
        ctx.lineTo(sx + 4, sy + 8);
      } else {
        // Nice curved loops
        ctx.arc(sx, sy, 6, -Math.PI/4, (5*Math.PI)/4);
      }
      ctx.stroke();

      // Stitch knot dots
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(sx - 3, sy - 4, 2, 0, 2*Math.PI);
      ctx.fill();
    }
  }

  // Helper: Draw linen wrap
  function drawLinenWrap() {
    ctx.fillStyle = '#faf8f5';
    ctx.strokeStyle = '#d9beb0';
    ctx.lineWidth = 1.5;
    
    // Draw 3 diagonal overlapping bandage strips
    for (let i = -1; i <= 1; i++) {
      const bx = wx + i * 22;
      ctx.beginPath();
      ctx.moveTo(bx - 15, wy - lh/2);
      ctx.lineTo(bx + 15, wy + lh/2);
      ctx.lineTo(bx + 30, wy + lh/2);
      ctx.lineTo(bx, wy - lh/2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Bandage texture lines
      ctx.strokeStyle = '#e6d3c9';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(bx - 8, wy - lh/2);
      ctx.lineTo(bx + 22, wy + lh/2);
      ctx.stroke();
      ctx.strokeStyle = '#d9beb0';
      ctx.lineWidth = 1.5;
    }
  }

  switch (woundIndex) {
    case 0: // Chinna (Incised) - Full Reasoning
      // Straight clean incision
      if (step === 0) {
        if (!isCorrect) {
          // Open wound gap (unverified or incorrect)
          ctx.fillStyle = '#991b1b'; // deep skin layer red
          ctx.beginPath();
          ctx.ellipse(wx, wy, 45, 12, 0, 0, 2*Math.PI);
          ctx.fill();
          
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Correctly closed Day 0
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(wx - 50, wy);
          ctx.lineTo(wx + 50, wy);
          ctx.stroke();
          
          drawSutures(wx - 45, wy, wx + 45, wy, 4, tension);
        }
      } else if (step === 1) {
        // Day 7
        if (tension === 'high') {
          // Inflammation and puckering
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; // inflammation glow
          ctx.beginPath(); ctx.ellipse(wx, wy, 60, 20, 0, 0, 2 * Math.PI); ctx.fill();
          
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(wx - 48, wy); ctx.lineTo(wx + 48, wy); ctx.stroke();
          
          // Puckering lines
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 1;
          for (let offset = -40; offset <= 40; offset += 15) {
            ctx.beginPath();
            ctx.moveTo(wx + offset - 2, wy - 8);
            ctx.lineTo(wx + offset + 2, wy + 8);
            ctx.stroke();
          }
        } else if (tension === 'low') {
          // Gaped slightly
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath(); ctx.ellipse(wx, wy, 40, 6, 0, 0, 2*Math.PI); ctx.fill();
        } else {
          // Optimal pink line
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(wx - 45, wy); ctx.lineTo(wx + 45, wy); ctx.stroke();
        }
      } else if (step === 2) {
        // Day 30
        if (tension === 'high') {
          // Raised scar
          ctx.fillStyle = '#f43f5e';
          ctx.strokeStyle = '#be123c';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(wx, wy, 48, 4, 0, 0, 2*Math.PI);
          ctx.fill(); ctx.stroke();
          
          // Subtle shading on raised scar
          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.ellipse(wx, wy - 1, 44, 1.5, 0, 0, 2*Math.PI);
          ctx.fill();
        } else if (tension === 'low') {
          // Gaped failed scar
          ctx.fillStyle = '#fca5a5';
          ctx.beginPath(); ctx.ellipse(wx, wy, 42, 8, 0, 0, 2*Math.PI); ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Optimal thin clean scar line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(wx - 45, wy); ctx.lineTo(wx + 45, wy); ctx.stroke();
        }
      }
      break;

    case 1: // Bhinna (Punctured) - Full Reasoning
      // Deep narrow puncture hole
      if (step === 0) {
        if (!isCorrect) {
          // Open dark puncture cavity
          ctx.fillStyle = '#451a03'; // deep pocket dark void
          ctx.beginPath(); ctx.ellipse(wx, wy, 15, 8, 0, 0, 2*Math.PI); ctx.fill();
          
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Neat single suture closing surface
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(wx - 10, wy); ctx.lineTo(wx + 10, wy); ctx.stroke();
          
          drawSutures(wx - 8, wy, wx + 8, wy, 1, 'moderate');
        }
      } else if (step === 1) {
        // Day 7
        const isPriorityCorrect = (tension === 'low' && isCorrect);
        if (!isPriorityCorrect) {
          // Swollen inflammation bump (healing issue / pocketing)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.beginPath(); ctx.arc(wx, wy, 25, 0, 2*Math.PI); ctx.fill();
          
          ctx.fillStyle = '#f87171';
          ctx.beginPath(); ctx.ellipse(wx, wy, 15, 8, 0, 0, 2*Math.PI); ctx.fill();
        } else {
          // Clean pink speck
          ctx.fillStyle = '#fda4af';
          ctx.beginPath(); ctx.arc(wx, wy, 5, 0, 2*Math.PI); ctx.fill();
        }
      } else if (step === 2) {
        // Day 30
        const isPriorityCorrect = (tension === 'low' && isCorrect);
        if (!isPriorityCorrect) {
          // Persistent raised nodule/bump (healing issue)
          ctx.fillStyle = '#fda4af';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(wx, wy, 12, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
        } else {
          // Clean, flat speck scar
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(wx, wy, 3, 0, 2*Math.PI); ctx.fill();
        }
      }
      break;

    case 2: // Pichchita (Crushed) - Full Reasoning
      // Bruised and crushed zone
      const drawBruise = (color) => {
        const bruiseGrad = ctx.createRadialGradient(wx, wy, 5, wx, wy, 45);
        bruiseGrad.addColorStop(0, color);
        bruiseGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bruiseGrad;
        ctx.beginPath(); ctx.ellipse(wx, wy, 55, 20, 0, 0, 2*Math.PI); ctx.fill();
      };

      if (step === 0) {
        if (isCorrect) {
          // Dress & wrap (bandage)
          drawBruise('rgba(88, 28, 135, 0.35)'); // purple bruise
          drawLinenWrap();
        } else {
          // Forced sutures in bruised skin
          drawBruise('rgba(127, 29, 29, 0.45)');
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(wx, wy, 35, 10, 0, 0, 2*Math.PI); ctx.fill();
          ctx.stroke();
          
          // Draw torn threads cutting skin
          drawSutures(wx - 30, wy, wx + 30, wy, 3, 'high');
        }
      } else if (step === 1) {
        // Day 7
        if (isCorrect) {
          // Bruise fading to yellow-green, under wrap
          drawBruise('rgba(161, 98, 7, 0.2)');
          drawLinenWrap();
        } else {
          // Edge damage: dark grey-black skin margins
          drawBruise('rgba(24, 24, 27, 0.6)'); // necrotic dark zone
          ctx.fillStyle = '#18181b';
          ctx.beginPath(); ctx.ellipse(wx, wy, 38, 12, 0, 0, 2*Math.PI); ctx.fill();
        }
      } else if (step === 2) {
        // Day 30
        if (isCorrect) {
          // Perfect recovery
          ctx.fillStyle = '#e8d8b8';
          // No scar, smooth skin
        } else {
          // Permanent edge damage scar (shriveled dark brown depression)
          ctx.fillStyle = '#451a03';
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(wx, wy, 35, 12, 0, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
          
          ctx.fillStyle = '#78350f';
          ctx.font = '8px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Edge Damage', wx, wy + 24);
        }
      }
      break;

    case 3: // Viddha (Pierced) - Quick
      // Transfixing holes
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.ellipse(wx - 40, wy - 15, 8, 4, Math.PI/6, 0, 2*Math.PI);
      ctx.ellipse(wx + 40, wy + 15, 8, 4, Math.PI/6, 0, 2*Math.PI);
      ctx.fill();

      // Dotted path
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(wx - 40, wy - 15);
      ctx.lineTo(wx + 40, wy + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      if (step === 1) {
        // Healing pink dots
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(wx - 40, wy - 15, 5, 0, 2*Math.PI);
        ctx.arc(wx + 40, wy + 15, 5, 0, 2*Math.PI);
        ctx.fill();
      } else if (step === 2) {
        // Flat dots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(wx - 40, wy - 15, 3, 0, 2*Math.PI);
        ctx.arc(wx + 40, wy + 15, 3, 0, 2*Math.PI);
        ctx.fill();
      }
      break;

    case 4: // Kshata (Lacerated) - Quick
      // Jagged torn margins
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(wx - 50, wy);
      ctx.lineTo(wx - 25, wy - 12);
      ctx.lineTo(wx, wy + 10);
      ctx.lineTo(wx + 25, wy - 10);
      ctx.lineTo(wx + 50, wy);
      ctx.lineTo(wx + 25, wy + 8);
      ctx.lineTo(wx, wy - 8);
      ctx.lineTo(wx - 25, wy + 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (step === 1) {
        // Closed wavy pink line
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wx - 50, wy);
        ctx.lineTo(wx - 25, wy - 4);
        ctx.lineTo(wx, wy + 3);
        ctx.lineTo(wx + 25, wy - 3);
        ctx.lineTo(wx + 50, wy);
        ctx.stroke();
      } else if (step === 2) {
        // Wavy white line scar
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wx - 50, wy);
        ctx.lineTo(wx - 25, wy - 4);
        ctx.lineTo(wx, wy + 3);
        ctx.lineTo(wx + 25, wy - 3);
        ctx.lineTo(wx + 50, wy);
        ctx.stroke();
      }
      break;

    case 5: // Ghrishta (Abraded) - Quick
      // Superficial scrape
      const scrapeGrad = ctx.createRadialGradient(wx, wy, 10, wx, wy, 45);
      scrapeGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      scrapeGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.25)');
      scrapeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scrapeGrad;
      ctx.beginPath(); ctx.ellipse(wx, wy, 50, 22, 0, 0, 2*Math.PI); ctx.fill();

      // Minor blood speckles
      ctx.fillStyle = '#b91c1c';
      for (let i = 0; i < 15; i++) {
        const sx = wx + (Math.random() - 0.5) * 60;
        const sy = wy + (Math.random() - 0.5) * 20;
        ctx.beginPath(); ctx.arc(sx, sy, 1 + Math.random()*1.5, 0, 2*Math.PI); ctx.fill();
      }

      if (step === 1) {
        // Drying protective crust
        ctx.fillStyle = 'rgba(180, 83, 9, 0.25)'; // brown scab tone
        ctx.beginPath(); ctx.ellipse(wx, wy, 42, 18, 0, 0, 2*Math.PI); ctx.fill();
      } else if (step === 2) {
        // Completely regenerated
        ctx.fillStyle = 'transparent';
      }
      break;
  }
}
