// canvas.js - Premium Graphics and Animations for Apprentice of Kashi

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

  const midY = canvas.height * 0.45;
  const squash = GourdLab.squashY;

  // Draw Gourd body
  ctx.fillStyle = GourdLab.material === 'melon' ? '#fecdd3' : (GourdLab.material === 'thick' ? '#fef3c7' : '#ffedd5');
  ctx.beginPath();
  ctx.moveTo(0, midY + squash);
  if (GourdLab.material === 'melon') {
    ctx.bezierCurveTo(canvas.width / 4, midY - 60 + squash, 3 * canvas.width / 4, midY - 60 + squash, canvas.width, midY + squash);
  } else {
    ctx.lineTo(canvas.width, midY + squash);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  // Draw Gourd rind/skin line
  ctx.lineWidth = 8;
  ctx.strokeStyle = GourdLab.material === 'melon' ? '#0d9488' : (GourdLab.material === 'thick' ? '#d97706' : '#ea580c');
  ctx.beginPath();
  ctx.moveTo(0, midY + squash);
  if (GourdLab.material === 'melon') {
    ctx.bezierCurveTo(canvas.width / 4, midY - 60 + squash, 3 * canvas.width / 4, midY - 60 + squash, canvas.width, midY + squash);
  } else {
    ctx.lineTo(canvas.width, midY + squash);
  }
  ctx.stroke();

  // Draw seeds for Melon
  if (GourdLab.material === 'melon') {
    ctx.fillStyle = '#44403c';
    const seedPoints = [
      {x: 80, y: midY + 40}, {x: 180, y: midY + 25}, {x: 280, y: midY + 45}, 
      {x: 380, y: midY + 30}, {x: 480, y: midY + 50}
    ];
    seedPoints.forEach(p => {
      if (p.x < canvas.width) {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + squash, 3, 6, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  // Draw drag path
  if (GourdLab.dragPoints.length > 1) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78716c';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(GourdLab.dragPoints[0].x, GourdLab.dragPoints[0].y);
    for (let i = 1; i < GourdLab.dragPoints.length; i++) {
      ctx.lineTo(GourdLab.dragPoints[i].x, GourdLab.dragPoints[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw active needle shape at tip
    const last = GourdLab.dragPoints[GourdLab.dragPoints.length - 1];
    ctx.save();
    ctx.translate(last.x, last.y);
    ctx.rotate(GourdLab.bendAngle); // apply bend if straight needle bent

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

    // Draw outcome bubble on canvas
    if (GourdLab.outcome) {
      ctx.fillStyle = GourdLab.outcome.includes("SMOOTH") || GourdLab.outcome.includes("POP") ? '#10b981' : '#ef4444';
      ctx.font = 'black 14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(GourdLab.outcome, last.x, last.y - 25);
    }
  }
}

// ------------------------------------------
// YARD 2: THREAD MASTER
// ------------------------------------------
function drawClothScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const midX = canvas.width / 2;

  // Background
  ctx.fillStyle = '#faf9f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#eae6dc';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 15) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 15) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Draw cloth tear gap
  ctx.fillStyle = '#f5f5f4';
  ctx.fillRect(midX - 12, 0, 24, canvas.height);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(midX - 12, 0); ctx.lineTo(midX - 12, canvas.height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(midX + 12, 0); ctx.lineTo(midX + 12, canvas.height); ctx.stroke();

  // Draw tension lines based on variables
  const tension = ClothBoard.tension;
  if (tension > 75 && ClothBoard.stitches.length > 0) {
    // Red wrinkled lines
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ClothBoard.stitches.forEach(st => {
      ctx.beginPath();
      ctx.moveTo(st.x1, st.y1 - 10);
      ctx.lineTo(st.x1 - 15, st.y1);
      ctx.lineTo(st.x1, st.y1 + 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(st.x2, st.y2 - 10);
      ctx.lineTo(st.x2 + 15, st.y2);
      ctx.lineTo(st.x2, st.y2 + 10);
      ctx.stroke();
    });
  }

  // Draw stitches
  ClothBoard.stitches.forEach(st => {
    // Stitch anchor holes
    ctx.fillStyle = '#292524';
    ctx.beginPath(); ctx.arc(st.x1, st.y1, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(st.x2, st.y2, 4, 0, 2 * Math.PI); ctx.fill();

    // Suture thread line
    ctx.lineWidth = 4.5;
    // color-code thread glow: tight = red, loose = yellow, balanced = green
    ctx.strokeStyle = tension > 75 ? '#ef4444' : (tension < 30 ? '#eab308' : '#10b981');
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(st.x1, st.y1);
    ctx.bezierCurveTo(st.x1 + 6, st.y1 - 8, st.x2 - 6, st.y2 - 8, st.x2, st.y2);
    ctx.stroke();

    // Force arrows
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    const arrowLen = (tension / 100) * 15;
    drawArrow(ctx, st.x1, st.y1, st.x1 + arrowLen, st.y1);
    drawArrow(ctx, st.x2, st.y2, st.x2 - arrowLen, st.y2);
  });

  // Combo count text
  if (ClothBoard.combo > 0) {
    ctx.fillStyle = 'var(--color-teal)';
    ctx.font = 'bold 12px Outfit';
    ctx.fillText(`Uniform Spacing Combo x${ClothBoard.combo}!`, 16, 25);
  }

  // Active stitching line
  if (ClothBoard.isDrawing) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'var(--color-pink)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ClothBoard.startX, ClothBoard.startY);
    ctx.lineTo(ClothBoard.curX, ClothBoard.curY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ------------------------------------------
// YARD 3: BAMBOO MAZE
// ------------------------------------------
function drawBambooScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background slate
  ctx.fillStyle = '#f5f5f4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }

  // Draw curved stalks
  const sineFreq = (Math.PI * 2) / canvas.width;
  ctx.fillStyle = '#a7f3d0';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3.5;

  // Upper Stalk
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= canvas.width; x += 10) {
    const y = 150 + 60 * Math.sin(x * sineFreq) - 30;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, 0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Lower Stalk
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width; x += 10) {
    const y = 150 + 60 * Math.sin(x * sineFreq) + 30;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // START & EXIT
  ctx.fillStyle = '#10b981';
  ctx.beginPath(); ctx.arc(45, 150, 18, 0, 2*Math.PI); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText("START", 45, 153);

  ctx.fillStyle = 'var(--color-pink)';
  ctx.beginPath(); ctx.arc(canvas.width - 45, 150, 18, 0, 2*Math.PI); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText("EXIT", canvas.width - 45, 153);

  // Draw Lotuses
  BambooTunnel.lotuses.forEach(l => {
    if (!l.collected) {
      // Golden lotus star
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(0, -10);
        ctx.rotate(Math.PI / 5);
        ctx.lineTo(0, -4);
        ctx.rotate(Math.PI / 5);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  });

  // Draw Probe spark particles
  if (BambooTunnel.sparkTimer > 0) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    const sx = BambooTunnel.sparkX;
    const sy = BambooTunnel.sparkY;
    ctx.beginPath();
    ctx.moveTo(sx - 10, sy - 10); ctx.lineTo(sx + 10, sy + 10);
    ctx.moveTo(sx + 10, sy - 10); ctx.lineTo(sx - 10, sy + 10);
    ctx.stroke();
    BambooTunnel.sparkTimer--;
  }

  // Draw Probe circle base
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(BambooTunnel.probeX, BambooTunnel.probeY, BambooTunnel.probeRadius, 0, 2 * Math.PI);
  ctx.fill(); ctx.stroke();

  // Custom Probe Shapes
  ctx.save();
  ctx.translate(BambooTunnel.probeX, BambooTunnel.probeY);
  ctx.strokeStyle = 'var(--color-pink)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (GameState.activeProbe === 'straight') {
    ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
  } else if (GameState.activeProbe === 'curved') {
    ctx.arc(0, 0, 8, -Math.PI / 2, Math.PI / 2);
  } else { // hooked
    ctx.moveTo(-8, 5); ctx.lineTo(4, 5); ctx.lineTo(8, -2);
  }
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------
// YARD 4: WRAP RACE
// ------------------------------------------
function drawDollScene(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#faf9f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    slipOffset = (25 - DollWrap.testTimer) * 1.6; // slips off boundary
  }

  // Draw peach linen limb cross section
  ctx.fillStyle = '#fed7aa';
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, 2 * Math.PI);
  ctx.fill(); ctx.stroke();

  // Draw joint seam lines
  ctx.strokeStyle = 'rgba(124, 45, 18, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - rad, cy); ctx.lineTo(cx + rad, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - rad); ctx.lineTo(cx, cy + rad); ctx.stroke();

  // Draw wrap rings
  ctx.strokeStyle = 'rgba(217, 70, 239, 0.8)';
  ctx.lineCap = 'round';
  for (let i = 1; i <= DollWrap.layers; i++) {
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    // if slipping, slide the concentric rings outward
    ctx.arc(cx + slipOffset, cy + slipOffset / 2, rad + i * 4.5, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Squeeze vectors for tight wraps
  if (DollWrap.tightness > 7 && DollWrap.layers > 0) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const sx = cx + (rad + 15) * Math.cos(angle);
      const sy = cy + (rad + 15) * Math.sin(angle);
      const tx = cx + (rad + 3) * Math.cos(angle);
      const ty = cy + (rad + 3) * Math.sin(angle);
      drawArrow(ctx, sx, sy, tx, ty);
    }
  }

  // Draw drag trail gauze
  if (DollWrap.history.length > 1) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.4)';
    ctx.beginPath();
    ctx.moveTo(DollWrap.history[0].x, DollWrap.history[0].y);
    for (let i = 1; i < DollWrap.history.length; i++) {
      ctx.lineTo(DollWrap.history[i].x, DollWrap.history[i].y);
    }
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
