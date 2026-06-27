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
// YARD 3: BUZZ WIRE CHALLENGE
// ------------------------------------------

function drawBuzzWireScene(ctx, canvas) {
  const W = canvas.width, H = canvas.height;
  const t = performance.now();
  ctx.clearRect(0, 0, W, H);

  // Dark workshop / lab bench background
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(113,113,122,0.10)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const vig = ctx.createRadialGradient(W/2, H/2, H*0.20, W/2, H/2, Math.hypot(W,H)*0.62);
  vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  const shape = WIRE_SHAPES[BuzzWire.shapeIdx];
  const pts = shape.pts;

  // Hint: safe corridor
  if (typeof GameState !== 'undefined' && (GameState.hints?.['bamboo'] || 0) >= 1) {
    ctx.save();
    ctx.lineWidth = (BuzzWire.wireR + BuzzWire.ringR) * 2;
    ctx.strokeStyle = 'rgba(13,148,136,0.18)';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => { i ? ctx.lineTo(p[0]*W, p[1]*H) : ctx.moveTo(p[0]*W, p[1]*H); });
    ctx.stroke();
    ctx.restore();
  }

  // Wire — 4-layer copper
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const wirePath = () => {
    ctx.beginPath();
    pts.forEach((p, i) => { i ? ctx.lineTo(p[0]*W, p[1]*H) : ctx.moveTo(p[0]*W, p[1]*H); });
  };
  ctx.lineWidth = 20; ctx.strokeStyle = 'rgba(0,0,0,0.50)'; wirePath(); ctx.stroke();
  ctx.lineWidth = 14; ctx.strokeStyle = '#92400e'; wirePath(); ctx.stroke();
  ctx.lineWidth = 8;  ctx.strokeStyle = '#b45309'; wirePath(); ctx.stroke();
  ctx.lineWidth = 4;  ctx.strokeStyle = '#f59e0b'; wirePath(); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,236,153,0.70)'; wirePath(); ctx.stroke();
  ctx.restore();

  // START zone — pulses until activated, then stays solid
  const sp = pts[0], sx = sp[0]*W, sy = sp[1]*H;
  const pulse = BuzzWire.active ? 1 : 0.55 + 0.45 * Math.sin(t / 260);
  ctx.save();
  // Beacon rings when mouse on canvas but not yet active
  if (!BuzzWire.active && BuzzWire.mouseOnCanvas) {
    for (let ring = 0; ring < 3; ring++) {
      const phase = ((t / 700 + ring * 0.33) % 1);
      const r2 = 22 + phase * 34;
      const al = (1 - phase) * 0.55;
      ctx.strokeStyle = `rgba(16,185,129,${al})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, r2, 0, 2*Math.PI); ctx.stroke();
    }
  }
  ctx.globalAlpha = pulse;
  ctx.fillStyle = BuzzWire.active ? 'rgba(16,185,129,0.45)' : '#10b981';
  ctx.strokeStyle = '#065f46'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(sx, sy, 22, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('START', sx, sy);
  ctx.restore();

  // END zone
  const ep = pts[pts.length - 1], ex = ep[0]*W, ey = ep[1]*H;
  const endCleared = BuzzWire.complete && BuzzWire.cleared.includes(BuzzWire.shapeIdx);
  ctx.save();
  ctx.fillStyle = endCleared ? '#10b981' : '#d97706';
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(ex, ey, 22, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('END', ex, ey);
  ctx.restore();

  // "Move cursor in" instruction overlay (before mouse enters)
  if (!BuzzWire.mouseOnCanvas) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.font = 'bold 15px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Move your cursor into this panel to begin', W/2, H/2 - 13);
    ctx.font = '11px Outfit'; ctx.fillStyle = 'rgba(255,255,255,0.50)';
    ctx.fillText('Navigate the ring: START → END without touching the wire', W/2, H/2 + 12);
    ctx.restore();
  }

  // Buzz flash
  if (BuzzWire.flashTimer > 0) {
    ctx.fillStyle = `rgba(239,68,68,${BuzzWire.flashTimer * 0.022})`;
    ctx.fillRect(0, 0, W, H);
  }

  // GO! flash (fades over 24 frames of mouse movement)
  if (BuzzWire.goFlash > 0) {
    const ga = BuzzWire.goFlash / 24;
    ctx.save();
    ctx.fillStyle = `rgba(16,185,129,${ga * 0.20})`; ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = '#10b981'; ctx.shadowBlur = 24;
    ctx.fillStyle = `rgba(255,255,255,${ga})`; ctx.font = 'bold 52px Outfit';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('GO!', W/2, H/2);
    ctx.restore();
    BuzzWire.goFlash--;
  }

  // Ring (only when mouse on canvas)
  if (BuzzWire.mouseOnCanvas && !BuzzWire.complete) {
    const rx = BuzzWire.ringX, ry = BuzzWire.ringY;
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = BuzzWire.isBuzzing ? '#ef4444' : '#e4e4e7';
    ctx.shadowColor  = BuzzWire.isBuzzing ? '#ef4444' : 'rgba(220,220,220,0.5)';
    ctx.shadowBlur   = BuzzWire.isBuzzing ? 18 : 6;
    ctx.beginPath(); ctx.arc(rx, ry, BuzzWire.ringR, 0, 2*Math.PI); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = BuzzWire.isBuzzing ? 'rgba(254,202,202,0.55)' : 'rgba(255,255,255,0.50)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx - BuzzWire.ringR*0.18, ry - BuzzWire.ringR*0.18, BuzzWire.ringR*0.45, 0.7, 1.9);
    ctx.stroke();
    ctx.restore();
  }

  // Labels
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.60)';
  ctx.font = 'bold 11px Cinzel'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(shape.name.toUpperCase(), 10, 8);
  if (BuzzWire.active) {
    const acc = Math.max(0, 100 - BuzzWire.buzzes * 10);
    ctx.fillStyle = acc >= 70 ? '#34d399' : acc >= 50 ? '#fbbf24' : '#f87171';
    ctx.font = 'bold 13px Outfit'; ctx.textAlign = 'right';
    ctx.fillText(`${acc}%`, W - 10, 8);
  }
  ctx.restore();

  // Completion banner
  if (BuzzWire.complete) {
    const acc = Math.max(0, 100 - BuzzWire.buzzes * 10);
    const passed = acc >= 70;
    ctx.save();
    ctx.fillStyle = passed ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.12)';
    ctx.fillRect(0, 0, W, H);
    const col = passed ? '#10b981' : '#ef4444';
    ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.fillStyle = col;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W*0.18, H*0.06, W*0.64, H*0.20, 10);
    else ctx.rect(W*0.18, H*0.06, W*0.64, H*0.20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((passed ? '✓ CLEARED   ' : '✗ TRY AGAIN   ') + acc + '%', W/2, H*0.06 + H*0.10);
    ctx.restore();
  }
}

// ------------------------------------------
// YARD 4: WRAP RACE — helpers
// ------------------------------------------
function _dollCloud(ctx, cx, cy, rw, rh, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(cx,        cy,        rw,      rh,      0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx-rw*0.4, cy+rh*0.3, rw*0.55, rh*0.7,  0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx+rw*0.4, cy+rh*0.2, rw*0.60, rh*0.65, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function _dollSpeech(ctx, x, y, text, color, sc) {
  ctx.save();
  ctx.font = `bold ${Math.round(13*sc)}px Outfit`;
  const tw = ctx.measureText(text).width;
  const pad = sc*12, bw = tw + pad*2, bh = sc*32;
  ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = color; ctx.lineWidth = sc*2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - bw/2, y - bh, bw, bh, sc*8);
  else ctx.rect(x - bw/2, y - bh, bw, bh);
  ctx.fill(); ctx.stroke();
  // Tail
  ctx.beginPath(); ctx.moveTo(x-sc*6,y); ctx.lineTo(x+sc*8,y); ctx.lineTo(x,y+sc*14); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y - bh/2);
  ctx.restore();
}

// Draw one leg from hip (0,0) downward; coords pre-translated & rotated at call site
function _dollLeg(ctx, sc, isLeft, skinC, unifD, bootC, hasBandage, layers, slip, wounded) {
  const LW = sc*14, legH = sc*80;
  const lowerStart = legH*0.44;
  // Thigh (uniform)
  ctx.fillStyle = '#5a6a32'; ctx.strokeStyle = unifD; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.roundRect(-LW/2, 0, LW, lowerStart, sc*4); ctx.fill(); ctx.stroke();
  // Lower leg (skin or bandaged)
  const bd = hasBandage && layers > 0;
  ctx.fillStyle = skinC; ctx.strokeStyle = '#c8a060'; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.roundRect(-LW/2, lowerStart, LW, legH*0.46, sc*3); ctx.fill(); ctx.stroke();
  if (wounded && !bd) {
    ctx.fillStyle = 'rgba(200,38,26,0.75)';
    ctx.beginPath(); ctx.ellipse(sc*2, lowerStart+legH*0.14, sc*5.5, sc*3.5, 0.3, 0, Math.PI*2); ctx.fill();
  }
  if (bd) {
    const slipPx = slip * legH * 0.65;
    ctx.lineCap = 'round';
    for (let i = 0; i < Math.min(layers, 5); i++) {
      const bY = lowerStart + sc*5 + i*sc*7 + slipPx;
      ctx.lineWidth = sc*7; ctx.strokeStyle = `rgba(240,226,181,${Math.max(0.32, 1-i*0.09)})`;
      ctx.beginPath(); ctx.rect(-LW/2-sc*2, bY, LW+sc*4, sc*5.5); ctx.stroke();
    }
    if (slip > 0.78) {
      ctx.fillStyle = 'rgba(200,38,26,0.75)';
      ctx.beginPath(); ctx.ellipse(sc*2, lowerStart+legH*0.14, sc*5.5, sc*3.5, 0.3, 0, Math.PI*2); ctx.fill();
    }
  }
  // Boot
  const bootY = legH*0.90;
  const dir = isLeft ? -1 : 1;
  ctx.fillStyle = bootC; ctx.strokeStyle = '#1a0e02'; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.roundRect(-LW/2-sc*2, bootY, LW+sc*4, sc*18, sc*4); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-LW/2+dir*sc*3, bootY+sc*9, LW*0.8, sc*9, sc*3); ctx.fill(); ctx.stroke();
}

// Draw one arm from shoulder (0,0); caller must translate to shoulder pos
function _dollArm(ctx, sc, isLeft, skinC, skinD, unifC, unifD,
                   hasBandage, bodyPart, layers, slip, state) {
  const AW = sc*13, uH = sc*40, fH = sc*36;
  const baseAngle = isLeft ? 0.18 : -0.18;
  ctx.save();
  ctx.rotate(baseAngle);
  // Upper arm (uniform sleeve)
  ctx.fillStyle = unifC; ctx.strokeStyle = unifD; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.roundRect(-AW/2, 0, AW, uH, sc*4); ctx.fill(); ctx.stroke();
  // Forearm + hand
  ctx.save();
  ctx.translate(0, uH);
  const elbowBend = isLeft ? 0.25 : -0.25;
  ctx.rotate(elbowBend);
  const bd = hasBandage && bodyPart === 'arm' && layers > 0;
  ctx.fillStyle = skinC; ctx.strokeStyle = skinD; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.roundRect(-AW/2, 0, AW, fH, sc*3); ctx.fill(); ctx.stroke();
  if (bd) {
    const slipPx = slip * fH * 0.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < Math.min(layers, 4); i++) {
      const bY = sc*4 + i*sc*8 + slipPx;
      ctx.lineWidth = sc*6.5; ctx.strokeStyle = `rgba(240,226,181,${Math.max(0.34, 1-i*0.1)})`;
      ctx.beginPath(); ctx.rect(-AW/2-sc*2, bY, AW+sc*4, sc*5); ctx.stroke();
    }
    if (slip > 0.82) {
      ctx.fillStyle = 'rgba(200,38,26,0.7)';
      ctx.beginPath(); ctx.ellipse(0, fH*0.28, sc*4.5, sc*3, 0, 0, Math.PI*2); ctx.fill();
    }
  }
  // Hand (oval)
  ctx.fillStyle = skinC; ctx.strokeStyle = skinD; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.ellipse(0, fH+sc*7, AW*0.55, AW*0.65, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Finger bandage
  if (hasBandage && bodyPart === 'finger' && layers > 0) {
    const slipPx = slip * sc*20;
    ctx.lineCap = 'round';
    for (let i = 0; i < Math.min(layers, 3); i++) {
      const bY = fH + sc*(2 + i*4) + slipPx;
      ctx.lineWidth = sc*4; ctx.strokeStyle = `rgba(240,226,181,${Math.max(0.4, 1-i*0.12)})`;
      ctx.beginPath(); ctx.ellipse(AW*0.35, bY, sc*5, sc*4, 0, 0, Math.PI*2); ctx.stroke();
    }
  }
  ctx.restore(); // elbow
  ctx.restore(); // shoulder
}

function _drawSoldierMain(ctx, bx, by, sc, state, ph, bodyPart, layers, slip) {
  const SKIN  = '#f5c285', SKIN_D = '#d9a060';
  const UNIF  = '#6b7c40', UNIF_D = '#4a5a2e';
  const HELM  = '#3e5020';
  const BOOT  = '#2b1a0a';

  const walk   = ph * (state === 'perfect' ? 0.22 : state === 'tight' ? 0.10 : 0);
  const lLeg   = Math.sin(walk) * 0.38;
  const rLeg   = Math.sin(walk + Math.PI) * 0.38;
  const lArm   = -lLeg * 0.55;
  const rArm   = -rLeg * 0.55;
  const bounce = state === 'perfect' ? Math.abs(Math.sin(walk)) * sc*4 : 0;

  // Idle injury limp (right leg slight raise)
  const limp = (state === 'idle' || state === 'loose') && bodyPart === 'leg'
    ? Math.sin(ph * 0.05) * sc * 3 : 0;

  const footY = by;
  const hipY  = by - sc*88 - bounce;
  const shY   = by - sc*150 - bounce;
  const neckY = by - sc*162 - bounce;
  const headCY= by - sc*192 - bounce;
  const headR = sc*30;
  const bw    = sc*36;   // body half-width at shoulders
  const bwH   = sc*28;   // body half-width at hips

  // Wounded-leg tracking: right leg gets injury marker when not bandaged
  const legWounded = bodyPart === 'leg';

  // ---- BACK ARM ----
  const rArmBack = rArm < 0;
  if (rArmBack) {
    ctx.save(); ctx.translate(bx+bw, shY); ctx.rotate(rArm*0.5);
    _dollArm(ctx, sc, false, SKIN, SKIN_D, UNIF, UNIF_D,
             bodyPart==='arm'||bodyPart==='finger', bodyPart, layers, slip, state);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(bx-bw, shY); ctx.rotate(lArm*0.5);
    _dollArm(ctx, sc, true, SKIN, SKIN_D, UNIF, UNIF_D, false, bodyPart, 0, 0, state);
    ctx.restore();
  }

  // ---- BACK LEG ----
  if (rLeg < 0) {
    ctx.save(); ctx.translate(bx+sc*16, hipY); ctx.rotate(rLeg);
    _dollLeg(ctx, sc, false, SKIN, UNIF_D, BOOT, legWounded, layers, slip,
             legWounded && layers===0);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(bx-sc*16, hipY); ctx.rotate(lLeg);
    _dollLeg(ctx, sc, true, SKIN, UNIF_D, BOOT, false, 0, 0, false);
    ctx.restore();
  }

  // ---- TORSO ----
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bx-bw, shY); ctx.lineTo(bx+bw, shY);
  ctx.lineTo(bx+bwH, hipY); ctx.lineTo(bx-bwH, hipY); ctx.closePath();
  const tg = ctx.createLinearGradient(bx-bw, shY, bx+bw, shY);
  tg.addColorStop(0, UNIF_D); tg.addColorStop(0.35, UNIF);
  tg.addColorStop(0.65, UNIF); tg.addColorStop(1, UNIF_D);
  ctx.fillStyle = tg; ctx.fill(); ctx.strokeStyle = UNIF_D; ctx.lineWidth = sc*2; ctx.stroke();
  // Pocket
  ctx.fillStyle = UNIF_D; ctx.fillRect(bx-bw*0.55, shY+sc*10, sc*16, sc*12);
  ctx.fillStyle = UNIF;   ctx.fillRect(bx-bw*0.55+sc*2, shY+sc*11, sc*12, sc*10);
  // Belt
  ctx.fillStyle = '#5a3e18'; ctx.fillRect(bx-bwH-sc*4, hipY-sc*13, bwH*2+sc*8, sc*11);
  ctx.fillStyle = '#c8a040'; ctx.fillRect(bx-sc*7, hipY-sc*12, sc*14, sc*9);
  ctx.restore();

  // ---- FRONT LEG ----
  if (rLeg >= 0) {
    ctx.save(); ctx.translate(bx+sc*16, hipY); ctx.rotate(rLeg);
    _dollLeg(ctx, sc, false, SKIN, UNIF_D, BOOT, legWounded, layers, slip,
             legWounded && layers===0);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(bx-sc*16, hipY); ctx.rotate(lLeg);
    _dollLeg(ctx, sc, true, SKIN, UNIF_D, BOOT, false, 0, 0, false);
    ctx.restore();
  }

  // ---- NECK ----
  ctx.save();
  ctx.fillStyle = SKIN; ctx.strokeStyle = SKIN_D; ctx.lineWidth = sc;
  ctx.beginPath(); ctx.ellipse(bx, (neckY+shY*0.92)/2, sc*9, sc*6, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // ---- HEAD ----
  ctx.save();
  const hg = ctx.createRadialGradient(bx-sc*8, headCY-sc*8, sc*2, bx, headCY, headR*1.1);
  hg.addColorStop(0, '#fdd9a2'); hg.addColorStop(0.6, SKIN); hg.addColorStop(1, SKIN_D);
  ctx.fillStyle = hg; ctx.strokeStyle = SKIN_D; ctx.lineWidth = sc*2;
  ctx.beginPath(); ctx.ellipse(bx, headCY+sc*4, headR, headR*1.05, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  // Head bandage
  if (bodyPart === 'head' && layers > 0) {
    const slipPx = slip * sc*32;
    ctx.lineCap = 'round';
    for (let i = 0; i < Math.min(layers, 4); i++) {
      ctx.lineWidth = sc*11;
      ctx.strokeStyle = `rgba(240,226,181,${Math.max(0.35, 1-i*0.08)})`;
      ctx.beginPath();
      ctx.ellipse(bx, headCY-sc*4+i*sc*3+slipPx, headR+sc*4, headR*0.58, 0, 0, Math.PI*2);
      ctx.stroke();
    }
  }

  // Helmet
  ctx.fillStyle = HELM; ctx.strokeStyle = '#2a3a14'; ctx.lineWidth = sc*2;
  ctx.beginPath(); ctx.ellipse(bx, headCY-sc*3, headR+sc*6, headR*0.60, 0, Math.PI, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(bx, headCY-sc*3, headR+sc*10, sc*6, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  // Helmet strap
  ctx.strokeStyle = '#2a3a14'; ctx.lineWidth = sc*2.5;
  ctx.beginPath(); ctx.arc(bx, headCY+sc*12, headR+sc*2, 0.1, Math.PI-0.1); ctx.stroke();

  // Eyes
  const eyeY = headCY+sc*2, eLX = bx-sc*10, eRX = bx+sc*10;
  ctx.lineWidth = sc*2.5; ctx.lineCap = 'round';
  if (state === 'tight' && ph > 15) {
    // Pain X eyes
    ctx.strokeStyle = '#2a1a0a';
    [eLX, eRX].forEach(ex => {
      ctx.beginPath(); ctx.moveTo(ex-sc*5,eyeY-sc*4); ctx.lineTo(ex+sc*5,eyeY+sc*4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex+sc*5,eyeY-sc*4); ctx.lineTo(ex-sc*5,eyeY+sc*4); ctx.stroke();
    });
  } else if (state === 'perfect') {
    // Happy ^ ^ eyes
    ctx.strokeStyle = '#2a1a0a';
    ctx.beginPath(); ctx.arc(eLX, eyeY+sc*3, sc*6, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(eRX, eyeY+sc*3, sc*6, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
  } else {
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath(); ctx.ellipse(eLX, eyeY, sc*4.5, sc*5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(eRX, eyeY, sc*4.5, sc*5, 0, 0, Math.PI*2); ctx.fill();
    // Sad brows
    ctx.strokeStyle = '#2a1a0a';
    ctx.beginPath(); ctx.moveTo(eLX-sc*6,eyeY-sc*8); ctx.lineTo(eLX+sc*6,eyeY-sc*5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(eRX-sc*6,eyeY-sc*5); ctx.lineTo(eRX+sc*6,eyeY-sc*8); ctx.stroke();
  }

  // Mouth
  const mY = headCY+sc*14;
  ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = sc*2.5; ctx.lineCap = 'round';
  if (state === 'tight' && ph > 15) {
    ctx.beginPath();
    ctx.moveTo(bx-sc*10,mY); ctx.lineTo(bx-sc*5,mY+sc*4);
    ctx.lineTo(bx,mY-sc*3); ctx.lineTo(bx+sc*5,mY+sc*4); ctx.lineTo(bx+sc*10,mY);
    ctx.stroke();
  } else if (state === 'perfect') {
    ctx.beginPath(); ctx.arc(bx, mY-sc*4, sc*12, 0.1, Math.PI-0.1); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(bx, mY-sc*4, sc*11, 0.12, Math.PI-0.12); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(bx, mY+sc*8, sc*9, Math.PI+0.3, -0.3); ctx.stroke();
  }

  // Cheeks — red if too tight
  if (state === 'tight' && ph > 10) {
    const rr = Math.min((ph-10)/15, 1) * 0.40;
    ctx.fillStyle = `rgba(255,80,80,${rr})`;
    ctx.beginPath(); ctx.ellipse(bx-sc*18, headCY+sc*9, sc*10, sc*7, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx+sc*18, headCY+sc*9, sc*10, sc*7, 0, 0, Math.PI*2); ctx.fill();
  }

  // Sweat drops
  if ((state === 'loose' && ph > 32) || (state === 'tight' && ph > 18)) {
    ctx.fillStyle = 'rgba(120,190,255,0.90)';
    ctx.beginPath(); ctx.ellipse(bx+headR+sc*2,  headCY-sc*12, sc*4,sc*7, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx+headR+sc*8,  headCY,       sc*3,sc*5,  0.2, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();

  // ---- FRONT ARM ----
  if (!rArmBack) {
    ctx.save(); ctx.translate(bx+bw, shY); ctx.rotate(rArm*0.5);
    _dollArm(ctx, sc, false, SKIN, SKIN_D, UNIF, UNIF_D,
             bodyPart==='arm'||bodyPart==='finger', bodyPart, layers, slip, state);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(bx-bw, shY); ctx.rotate(lArm*0.5);
    _dollArm(ctx, sc, true, SKIN, SKIN_D, UNIF, UNIF_D, false, bodyPart, 0, 0, state);
    ctx.restore();
  }

  // Red pain flash (tight)
  if (state === 'tight' && ph > 15 && ph < 32) {
    const fa = ((32-ph)/17)*0.30;
    ctx.save(); ctx.fillStyle = `rgba(255,50,50,${fa})`;
    ctx.beginPath(); ctx.ellipse(bx, headCY, headR+sc*4, headR*1.1, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // Stars/pain sparks (tight, after flash)
  if (state === 'tight' && ph > 28) {
    const starCount = 4;
    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#b45309'; ctx.lineWidth = sc;
    for (let i = 0; i < starCount; i++) {
      const ang = (i/starCount)*Math.PI*2 + ph*0.08;
      const sx = bx + Math.cos(ang) * (headR + sc*18);
      const sy = headCY + Math.sin(ang) * (headR + sc*18);
      const r = sc * 6;
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const a = p*(Math.PI*2/5) - Math.PI/2;
        const b = a + Math.PI/5;
        p===0 ? ctx.moveTo(sx+Math.cos(a)*r, sy+Math.sin(a)*r)
              : ctx.lineTo(sx+Math.cos(a)*r, sy+Math.sin(a)*r);
        ctx.lineTo(sx+Math.cos(b)*r*0.4, sy+Math.sin(b)*r*0.4);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  // Falling bandage strips (loose)
  if (state === 'loose' && slip > 0.15) {
    ctx.save();
    const strips = Math.min(layers, 4);
    for (let i = 0; i < strips; i++) {
      const fallY = by - sc*65 + slip * sc*90 + i*sc*14;
      const xOff  = Math.sin(ph*0.18 + i) * sc*10;
      const alpha = Math.max(0, 1 - (slip-0.15)/0.85 * (i*0.25+0.5));
      ctx.fillStyle = `rgba(240,226,181,${alpha})`;
      ctx.save();
      ctx.translate(bx+sc*20+xOff, fallY);
      ctx.rotate(ph*0.06 + i*0.8);
      ctx.fillRect(-sc*12, -sc*3, sc*24, sc*6);
      ctx.restore();
    }
    ctx.restore();
  }
}

// ------------------------------------------
// YARD 4: WRAP RACE
// ------------------------------------------
function drawDollScene(ctx, canvas) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const state = DollWrap.animState || 'idle';
  const ph    = DollWrap.animFrame;
  const slip  = DollWrap.bandageSlip || 0;

  // ── Sky / ground background ───────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.64);
  sky.addColorStop(0, '#9acfea'); sky.addColorStop(1, '#d4eef8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.64);

  const gnd = ctx.createLinearGradient(0, H * 0.62, 0, H);
  gnd.addColorStop(0, '#8ec940'); gnd.addColorStop(0.55, '#5da020'); gnd.addColorStop(1, '#3a7a10');
  ctx.fillStyle = gnd; ctx.fillRect(0, H * 0.62, W, H * 0.38);
  ctx.fillStyle = '#aad84a'; ctx.fillRect(0, H * 0.62, W, 3);

  _dollCloud(ctx, W*0.14, H*0.12, W*0.10, H*0.07, 0.6);
  _dollCloud(ctx, W*0.68, H*0.08, W*0.13, H*0.08, 0.7);
  _dollCloud(ctx, W*0.85, H*0.20, W*0.08, H*0.06, 0.5);

  // ── Soldier position ────────────────────────────────────────────────
  const sc = H / 380;
  const groundY = H * 0.86;
  let sX = W * 0.46;

  // Perfect: soldier runs from center toward right edge
  if (state === 'perfect') {
    const prog = Math.min(ph / 155, 1);
    sX = W * (0.28 + prog * 0.46);
  }
  // Tight: subtle wobble
  if (state === 'tight') {
    sX = W * 0.46 + Math.sin(ph * 0.35) * sc * 7 * Math.min(ph/20, 1);
  }

  _drawSoldierMain(ctx, sX, groundY, sc, state, ph, DollWrap.bodyPart, DollWrap.layers, slip);

  // ── Wrap drag trail ───────────────────────────────────────────────
  if (DollWrap.isDrawing && DollWrap.history.length > 1) {
    ctx.save();
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(240,220,170,0.55)';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(DollWrap.history[0].x, DollWrap.history[0].y);
    for (let i = 1; i < DollWrap.history.length; i++) ctx.lineTo(DollWrap.history[i].x, DollWrap.history[i].y);
    ctx.stroke();
    ctx.restore();
  }

  // ── Instruction label (idle, no wraps yet) ───────────────────────
  if (state === 'idle' && DollWrap.layers === 0) {
    const nm = {leg:'lower leg', arm:'forearm', finger:'finger', head:'head'};
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.font = `bold ${Math.round(12*sc)}px Outfit`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(`↕ Drag around the ${nm[DollWrap.bodyPart]||'wound'} to wrap`, W/2, 8);
    ctx.restore();
  }

  // ── Speech bubbles ───────────────────────────────────────────────
  if (state === 'tight' && ph > 18) {
    _dollSpeech(ctx, sX + sc*50, groundY - sc*200, 'OW! Too tight!!', '#ef4444', sc);
  }
  if (state === 'loose' && ph > 38) {
    _dollSpeech(ctx, sX + sc*52, groundY - sc*195, 'It fell off...!', '#f97316', sc);
  }
  if (state === 'perfect' && ph > 16) {
    _dollSpeech(ctx, sX + sc*48, groundY - sc*200, 'Thank you!', '#10b981', sc);
  }

  // ── Success banner (end of run) ──────────────────────────────────
  if (state === 'perfect' && ph > 148) {
    ctx.save();
    ctx.fillStyle = 'rgba(16,185,129,0.18)'; ctx.fillRect(0,0,W,H);
    ctx.shadowColor = '#10b981'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#10b981';
    if (ctx.roundRect) ctx.roundRect(W*0.14, H*0.08, W*0.72, H*0.18, 10);
    else ctx.rect(W*0.14, H*0.08, W*0.72, H*0.18);
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(18*sc)}px Outfit`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✓ HEALED — Perfect wrap!', W/2, H*0.08 + H*0.09);
    ctx.restore();
  }

  // ── Fail banner (tight/loose, end of animation) ──────────────────
  if ((state === 'tight' || state === 'loose') && ph > 95) {
    const msg = state === 'tight' ? '✗ Too tight — loosen it!' : '✗ Too loose — tighten up!';
    ctx.save();
    ctx.fillStyle = 'rgba(239,68,68,0.15)'; ctx.fillRect(0,0,W,H);
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 16;
    ctx.fillStyle = '#ef4444';
    if (ctx.roundRect) ctx.roundRect(W*0.14, H*0.08, W*0.72, H*0.18, 10);
    else ctx.rect(W*0.14, H*0.08, W*0.72, H*0.18);
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(16*sc)}px Outfit`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(msg, W/2, H*0.08 + H*0.09);
    ctx.restore();
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
