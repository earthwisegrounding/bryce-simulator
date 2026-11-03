const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const COLORS = { toner: "#000000", asphalt: "#38383b", concrete: "#8d8d8a", xerox: "#d9d9d3", paper: "#f3f3ef", stage: "#e0218a", cold: "#2442d6" };
const STEP = 1 / 60;
const LAST_DAY = 10;
const FRIENDS = 908;

// ---------- Hair ----------

class Rope {
  constructor(count, seg, x, y) {
    this.seg = seg;
    this.pts = Array.from({ length: count }, (_, i) => ({ x, y: y + i * seg, px: x, py: y + i * seg }));
  }
  step(ax, ay, gravity, wind) {
    const { pts, seg } = this;
    pts[0].x = pts[0].px = ax;
    pts[0].y = pts[0].py = ay;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const vx = (p.x - p.px) * 0.985;
      const vy = (p.y - p.py) * 0.985;
      p.px = p.x;
      p.py = p.y;
      p.x += vx + wind * (i / pts.length);
      p.y += vy + gravity;
    }
    for (let k = 0; k < 6; k++) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const shift = (dist - seg) / dist;
        if (i === 1) {
          b.x -= dx * shift;
          b.y -= dy * shift;
        } else {
          a.x += dx * shift * 0.5;
          a.y += dy * shift * 0.5;
          b.x -= dx * shift * 0.5;
          b.y -= dy * shift * 0.5;
        }
      }
    }
  }
  fling(vx, vy) {
    this.pts.forEach((p, i) => {
      const t = i / this.pts.length;
      p.px -= vx * t;
      p.py -= vy * t;
    });
  }
  draw(ctx, width, color) {
    const { pts } = this;
    const strands = 11;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let k = 0; k < strands; k++) {
      const side = (k / (strands - 1)) * 2 - 1;
      const end = pts.length - 1 - (k * 5) % 3;
      ctx.lineWidth = width * (Math.abs(side) > 0.8 ? 0.3 : 0.62);
      ctx.beginPath();
      for (let i = 0; i <= end; i++) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(pts.length - 1, i + 1)];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const t = i / (pts.length - 1);
        const spread = width * (0.55 + t * 1.5) * side;
        const x = pts[i].x - ((b.y - a.y) / len) * spread;
        const y = pts[i].y + ((b.x - a.x) / len) * spread;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
}

// A figure seen from the side. Returns where the hair attaches for the given head angle.
function hairAnchor(x, y, s, angle) {
  const headX = x + Math.sin(angle) * 34 * s;
  const headY = y - Math.cos(angle) * 34 * s;
  return { x: headX - Math.cos(angle) * 14 * s, y: headY - Math.sin(angle) * 14 * s - 6 * s, headX, headY };
}

function drawFigure(ctx, x, y, s, angle, rope) {
  const { headX, headY } = hairAnchor(x, y, s, angle);
  ctx.fillStyle = COLORS.toner;
  ctx.strokeStyle = COLORS.toner;
  ctx.lineCap = "round";
  // Wide stance, striped legs like the outfit in the photo
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * 13 * s, y + 90 * s);
    ctx.rotate(-side * 0.3);
    ctx.fillStyle = COLORS.toner;
    ctx.fillRect(-10 * s, 0, 20 * s, 102 * s);
    ctx.fillStyle = COLORS.paper;
    for (let i = 0; i < 6; i++) ctx.fillRect(-10 * s, (6 + i * 15) * s, 20 * s, 5 * s);
    ctx.fillStyle = COLORS.toner;
    ctx.fillRect(-11 * s, 96 * s, 30 * s * (side > 0 ? 1 : 0.8), 11 * s);
    ctx.restore();
  }
  // Tee
  ctx.save();
  ctx.translate(x, y + 92 * s);
  ctx.rotate(angle * 0.22);
  ctx.fillRect(-26 * s, -92 * s, 52 * s, 96 * s);
  ctx.fillStyle = COLORS.paper;
  ctx.font = `900 ${17 * s}px "Big Shoulders Stencil", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("HARD", 0, -48 * s);
  ctx.restore();
  // Horns up on one side, other hand on the hip
  const lift = Math.max(0, Math.sin(angle)) * 16 * s;
  const fistX = x + 74 * s;
  const fistY = y - 62 * s + lift;
  ctx.lineWidth = 15 * s;
  ctx.beginPath();
  ctx.moveTo(x + 18 * s, y + 12 * s);
  ctx.lineTo(x + 56 * s, y - 6 * s + lift * 0.5);
  ctx.lineTo(fistX, fistY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(fistX, fistY - 4 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4.5 * s;
  for (const off of [-6, 6]) {
    ctx.beginPath();
    ctx.moveTo(fistX + off * s, fistY - 8 * s);
    ctx.lineTo(fistX + off * 1.4 * s, fistY - 28 * s);
    ctx.stroke();
  }
  ctx.lineWidth = 15 * s;
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, y + 12 * s);
  ctx.lineTo(x - 50 * s, y + 46 * s);
  ctx.lineTo(x - 26 * s, y + 76 * s);
  ctx.stroke();
  // Neck and head
  ctx.beginPath();
  ctx.moveTo(x, y + 4 * s);
  ctx.lineTo(headX, headY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(headX, headY, 22 * s, 0, Math.PI * 2);
  ctx.fill();
  rope.draw(ctx, 13 * s, COLORS.toner);
}

function drawFloor(ctx, w, h, y) {
  ctx.fillStyle = "#1c0a33";
  ctx.fillRect(0, y, w, h - y);
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, y, w, 3);
}

function drawStage(ctx, w, h, time, beatPulse, glowX, glowY) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  // Backlight, so the silhouette and the hair read against it
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.5);
  glow.addColorStop(0, `rgba(224, 33, 138, ${0.95 + beatPulse * 0.05})`);
  glow.addColorStop(0.6, "rgba(120, 40, 190, .6)");
  glow.addColorStop(1, "rgba(36, 66, 214, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const sway = REDUCED ? 0 : Math.sin(time * 0.7) * w * 0.05;
  const cone = (color, topX, spread, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(topX - w * 0.015, 0);
    ctx.lineTo(topX + w * 0.015, 0);
    ctx.lineTo(topX + spread + w * 0.38, h);
    ctx.lineTo(topX + spread - w * 0.38, h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  ctx.globalCompositeOperation = "lighter";
  cone(COLORS.stage, w * 0.2, w * 0.28 + sway, 0.75 + beatPulse * 0.1);
  cone(COLORS.cold, w * 0.84, -w * 0.28 - sway, 0.85 + beatPulse * 0.1);
  ctx.globalCompositeOperation = "source-over";
}

function drawCrowd(ctx, w, h, time, energy) {
  ctx.fillStyle = "#000000";
  const count = 13;
  for (let i = 0; i < count; i++) {
    const x = ((i + 0.5) / count) * w;
    const bounce = REDUCED ? 0 : Math.abs(Math.sin(time * 5 + i * 1.9)) * h * 0.022 * (0.4 + energy);
    const y = h * (0.9 + (i % 3) * 0.022) - bounce;
    ctx.beginPath();
    ctx.arc(x, y, h * 0.042, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - h * 0.065, y + h * 0.035, h * 0.13, h * 0.2);
  }
}

// ---------- Sound ----------

const sound = {
  ctx: null,
  master: null,
  muted: false,
  init() {
    try {
      this.muted = localStorage.getItem("bryce-muted") === "1";
    } catch {}
    $("muteBtn").textContent = this.muted ? "Turn sound on" : "Mute sound";
  },
  toggle() {
    this.muted = !this.muted;
    try {
      localStorage.setItem("bryce-muted", this.muted ? "1" : "0");
    } catch {}
    $("muteBtn").textContent = this.muted ? "Turn sound on" : "Mute sound";
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.55;
  },
  start() {
    try {
      this.ctx = this.ctx || new AudioContext();
      this.ctx.resume();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
      this.noise = this.noise || this.makeNoise();
      return true;
    } catch {
      return false;
    }
  },
  stop() {
    if (!this.master) return;
    this.master.disconnect();
    this.master = null;
  },
  makeNoise() {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  },
  kick(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.09);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.18);
  },
  hiss(t, length, level, freq) {
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    src.buffer = this.noise;
    filter.type = "highpass";
    filter.frequency.value = freq;
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + length + 0.02);
  },
  chug(t, midi, length) {
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 7);
    }
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = curve;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1700;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    shaper.connect(filter).connect(gain).connect(this.master);
    for (const interval of [0, 7, 12]) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 440 * 2 ** ((midi + interval - 69) / 12);
      osc.detune.value = interval * 2;
      osc.connect(shaper);
      osc.start(t);
      osc.stop(t + length + 0.02);
    }
  },
};

// ---------- The show ----------

const EIGHTH = 60 / 116 / 2;
const COUNT_IN = 8; // eighths
const RIFF_PATTERNS = [
  [0, 2, 4, 6],
  [0, 2, 3, 4, 6],
  [0, 2, 4, 5, 6],
  [0, 1, 2, 4, 6, 7],
];
const RIFF_ORDER = [0, 0, 1, 0, 1, 2, 1, 3];
const RIFF_NOTES = [40, 40, 43, 40, 46, 45, 40, 38];

const show = {
  ctx: null,
  running: false,
  notes: [],
  rope: null,
  t0: 0,
  usesAudio: false,
  start(onDone) {
    this.onDone = onDone;
    this.ctx = $("showCanvas").getContext("2d");
    this.notes = [];
    RIFF_ORDER.forEach((pattern, bar) => {
      RIFF_PATTERNS[pattern].forEach((eighth) => {
        this.notes.push({ t: (COUNT_IN + bar * 8 + eighth) * EIGHTH, hit: false, missed: false, midi: RIFF_NOTES[eighth] });
      });
    });
    this.total = this.notes.length;
    this.hits = 0;
    this.perfect = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.word = "";
    this.wordAt = -10;
    this.headAngle = -0.25;
    this.headTarget = -0.25;
    this.pulse = 0;
    this.endAt = (COUNT_IN + RIFF_ORDER.length * 8) * EIGHTH + 0.9;
    this.rope = new Rope(14, 13, FIG.x, FIG.y);
    for (let i = 0; i < 120; i++) this.rope.step(FIG.x, FIG.y, 0.5, 0);
    this.band = pick(BANDS);
    this.usesAudio = sound.start();
    if (this.usesAudio) {
      this.t0 = sound.ctx.currentTime + 0.25;
      this.schedule();
    } else {
      this.t0 = performance.now() / 1000 + 0.25;
    }
    this.running = true;
    this.acc = 0;
    this.last = performance.now();
    $("show").showModal();
    requestAnimationFrame((now) => this.frame(now));
  },
  schedule() {
    const t0 = this.t0;
    for (let i = 0; i < COUNT_IN; i += 2) sound.hiss(t0 + i * EIGHTH, 0.05, 0.5, 6000);
    const end = COUNT_IN + RIFF_ORDER.length * 8;
    for (let e = COUNT_IN; e < end; e++) {
      const t = t0 + e * EIGHTH;
      const beat = (e - COUNT_IN) % 8;
      if (beat % 2 === 0) sound.kick(t);
      if (beat === 2 || beat === 6) sound.hiss(t, 0.14, 0.8, 1500);
      sound.hiss(t, 0.03, 0.14, 8000);
    }
    this.notes.forEach((n) => sound.chug(t0 + n.t, n.midi, EIGHTH * 0.9));
  },
  now() {
    if (this.usesAudio) return sound.ctx.currentTime - this.t0 - (sound.ctx.outputLatency || 0);
    return performance.now() / 1000 - this.t0;
  },
  bang() {
    if (!this.running) return;
    const t = this.now();
    let best = null;
    let bestGap = 0.14;
    for (const n of this.notes) {
      if (n.hit || n.missed) continue;
      const gap = Math.abs(n.t - t);
      if (gap < bestGap) {
        best = n;
        bestGap = gap;
      }
    }
    this.headTarget = 1.05;
    if (best) {
      best.hit = true;
      this.hits++;
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      const clean = bestGap < 0.06;
      if (clean) this.perfect++;
      this.word = clean ? "Clean" : "Close";
      this.wordAt = t;
      this.pulse = 1;
      this.rope.fling(-9, -15 - Math.min(this.combo, 12) * 0.45);
    } else {
      this.rope.fling(-3, -7);
    }
  },
  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    const t = this.now();
    while (this.acc >= STEP) {
      this.acc -= STEP;
      this.tick();
    }
    for (const n of this.notes) {
      if (!n.hit && !n.missed && t > n.t + 0.14) {
        n.missed = true;
        this.combo = 0;
        this.word = "Missed";
        this.wordAt = t;
      }
    }
    this.draw(t);
    if (t > this.endAt) {
      this.finish();
      return;
    }
    requestAnimationFrame((next) => this.frame(next));
  },
  tick() {
    this.headTarget += (-0.25 - this.headTarget) * 0.09;
    this.headAngle += (this.headTarget - this.headAngle) * 0.55;
    this.pulse *= 0.9;
    const anchor = hairAnchor(FIG.x, FIG.y, FIG.s, this.headAngle);
    this.rope.step(anchor.x, anchor.y, 0.55, -0.02);
  },
  draw(t) {
    const { ctx } = this;
    const W = 900;
    const H = 506;
    ctx.clearRect(0, 0, W, H);
    drawStage(ctx, W, H, t, this.pulse, FIG.x, FIG.y - 30);
    drawFloor(ctx, W, H, FIG_FLOOR);
    if (stage3d.ready) {
      stage3d.pose(this.headAngle);
      stage3d.draw(ctx, FIG.x, FIG_FLOOR + 4, 365);
    } else {
      drawFigure(ctx, FIG.x, FIG.y, FIG.s, this.headAngle, this.rope);
    }
    drawCrowd(ctx, W, H, Math.max(0, t), clamp(this.combo / 14, 0, 1));

    // Note track
    const trackY = 54;
    const hitX = 96;
    ctx.fillStyle = "rgba(0,0,0,.72)";
    ctx.fillRect(0, trackY - 32, W, 64);
    ctx.strokeStyle = COLORS.paper;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(hitX, trackY, 22 + this.pulse * 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.paper;
    for (const n of this.notes) {
      if (n.hit) continue;
      const x = hitX + (n.t - t) * 300;
      if (x < -20 || x > W + 20) continue;
      ctx.globalAlpha = n.missed ? 0.25 : 1;
      ctx.beginPath();
      ctx.arc(x, trackY, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.paper;
    ctx.font = '900 56px "Big Shoulders Stencil", Impact, sans-serif';
    if (this.combo > 2) ctx.fillText(`${this.combo} in a row`, W - 24, 176);
    ctx.font = '800 30px "Big Shoulders Stencil", Impact, sans-serif';
    ctx.fillText(`${this.band}, live at The Charleston`, W - 24, 120);

    ctx.textAlign = "left";
    if (t - this.wordAt < 0.45) {
      ctx.font = '900 42px "Big Shoulders Stencil", Impact, sans-serif';
      ctx.fillText(this.word, 40, 124);
    }
    if (t < 0) {
      ctx.font = '900 52px "Big Shoulders Stencil", Impact, sans-serif';
      ctx.fillText("Get ready", 40, 134);
    }
  },
  finish() {
    if (!this.running) return;
    this.running = false;
    sound.stop();
    if ($("show").open) $("show").close();
    const ratio = this.total ? this.hits / this.total : 0;
    this.onDone({ ratio, hits: this.hits, total: this.total, band: this.band, best: this.bestCombo });
  },
};
const FIG = { x: 400, y: 232, s: 1.05 };
const FIG_FLOOR = 438;

// ---------- The yard ----------

const yard = {
  ctx: null,
  rope: null,
  acc: 0,
  last: 0,
  running: false,
  time: 0,
  whip: 0,
  slots: [],
  init() {
    this.ctx = $("scene").getContext("2d");
    this.rope = new Rope(12, 3.4, 240, 220);
    for (let i = 0; i < 160; i++) this.rope.step(240, 220, 0.4, 0);
    // A heap: rows that narrow as they go up, filled from the middle out
    const rows = [3, 3, 3, 3, 2, 2, 2, 2, 1, 1];
    rows.forEach((n, r) => {
      const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => Math.abs(a - (n - 1) / 2) - Math.abs(b - (n - 1) / 2));
      order.forEach((i, j) => {
        this.slots.push({
          x: 410 + (i - (n - 1) / 2) * 72 + ((j * 13) % 9) - 4,
          y: 298 - r * 30,
          rot: (((i * 37 + r * 91) % 21) - 10) * 0.016,
          kind: (i * 3 + r * 5 + j) % ITEMS.length,
        });
      });
    });
  },
  play() {
    if (this.running) return;
    if (REDUCED) {
      this.draw();
      return;
    }
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame((now) => this.frame(now));
  },
  pause() {
    this.running = false;
  },
  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.acc += dt;
    while (this.acc >= STEP) {
      this.acc -= STEP;
      this.rope.step(240, 220, 0.42, Math.sin(this.time * 0.9) * 0.05 + 0.03);
    }
    this.draw();
    requestAnimationFrame((next) => this.frame(next));
  },
  draw() {
    const { ctx } = this;
    const W = 800;
    const H = 330;
    const night = game.phase === "evening";
    ctx.fillStyle = night ? COLORS.asphalt : COLORS.xerox;
    ctx.fillRect(0, 0, W, H);

    // Far treeline
    ctx.fillStyle = night ? "#1f1f22" : COLORS.concrete;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 172 + ((x * 37) % 41) - (x % 40 === 0 ? 16 : 0));
    ctx.lineTo(W, 300);
    ctx.fill();
    // Shipyard crane on the skyline
    ctx.fillRect(346, 60, 12, 130);
    ctx.fillRect(298, 54, 108, 8);
    ctx.fillRect(310, 62, 2, 40);

    // House and door, right side
    ctx.fillStyle = night ? COLORS.concrete : COLORS.paper;
    ctx.fillRect(610, 120, 190, 180);
    ctx.fillStyle = COLORS.toner;
    ctx.beginPath();
    ctx.moveTo(590, 124);
    ctx.lineTo(700, 62);
    ctx.lineTo(820, 124);
    ctx.fill();
    ctx.fillRect(636, 200, 54, 100);
    ctx.fillStyle = night ? COLORS.stage : COLORS.concrete;
    ctx.fillRect(722, 160, 50, 44);

    // Ground
    ctx.fillStyle = COLORS.toner;
    ctx.fillRect(0, 298, W, 32);

    // Tara, with a list. The lower the patience, the closer to the pile.
    const taraX = 600 - (100 - game.state.tara) * 0.45;
    ctx.fillStyle = night ? COLORS.paper : COLORS.toner;
    ctx.fillRect(taraX - 11, 222, 22, 76);
    ctx.beginPath();
    ctx.arc(taraX, 210, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.stage;
    ctx.fillRect(taraX - 28, 232, 15, 21);

    // Truck, left side
    ctx.fillStyle = night ? COLORS.concrete : COLORS.toner;
    ctx.fillRect(10, 244, 130, 38);
    ctx.fillRect(84, 210, 56, 40);
    ctx.fillStyle = night ? COLORS.asphalt : COLORS.xerox;
    ctx.fillRect(96, 218, 34, 22);
    ctx.fillStyle = night ? COLORS.concrete : COLORS.toner;
    ctx.beginPath();
    ctx.arc(42, 284, 15, 0, Math.PI * 2);
    ctx.arc(116, 284, 15, 0, Math.PI * 2);
    ctx.fill();

    this.drawPile(game.state.pile, night);

    // You, as far from the pile as possible
    this.drawYou(night);

    // Rain
    if (!REDUCED) {
      ctx.strokeStyle = night ? "rgba(243,243,239,.28)" : "rgba(0,0,0,.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 50; i++) {
        const x = (i * 97 + this.time * 90) % (W + 40) - 20;
        const y = ((i * 61) + this.time * 480) % H;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 3, y + 11);
      }
      ctx.stroke();
    }
  },
  drawYou(night) {
    const { ctx } = this;
    const color = night ? COLORS.paper : COLORS.toner;
    ctx.fillStyle = color;
    ctx.fillRect(228, 234, 24, 40);
    ctx.fillRect(229, 272, 9, 26);
    ctx.fillRect(242, 272, 9, 26);
    ctx.beginPath();
    ctx.arc(240, 222, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    this.rope.draw(ctx, 6, color);
  },
  drawPile(count, night) {
    const { ctx } = this;
    const drawAll = (color, ox, oy) => {
      for (let i = 0; i < Math.min(count, this.slots.length); i++) {
        const slot = this.slots[i];
        ctx.save();
        ctx.translate(slot.x + ox, slot.y + oy);
        ctx.rotate(slot.rot);
        ctx.scale(1.45, 1.45);
        ctx.fillStyle = color;
        ITEMS[slot.kind](ctx);
        ctx.restore();
      }
    };
    // Misprinted, like a two-color flyer
    ctx.save();
    ctx.globalCompositeOperation = night ? "source-over" : "multiply";
    drawAll(COLORS.stage, 4, 2);
    drawAll(COLORS.cold, -3, -2);
    ctx.restore();
    drawAll(night ? COLORS.paper : COLORS.toner, 0, 0);
  },
};

const ITEMS = [
  // couch
  (c) => { c.fillRect(-28, -14, 56, 14); c.fillRect(-28, -24, 9, 14); c.fillRect(19, -24, 9, 14); c.fillRect(-19, -22, 38, 7); },
  // mattress
  (c) => { c.fillRect(-30, -11, 60, 11); },
  // TV
  (c) => { c.fillRect(-15, -24, 30, 24); },
  // tire
  (c) => { c.beginPath(); c.arc(0, -12, 12, 0, Math.PI * 2); c.arc(0, -12, 5, 0, Math.PI * 2, true); c.fill(); },
  // box
  (c) => { c.fillRect(-14, -20, 28, 20); },
  // amp
  (c) => { c.fillRect(-17, -22, 34, 22); c.fillRect(-7, -27, 14, 5); },
  // chair
  (c) => { c.fillRect(-12, -14, 24, 5); c.fillRect(-12, -30, 4, 18); c.fillRect(-12, -10, 3, 10); c.fillRect(9, -10, 3, 10); },
  // bag
  (c) => { c.beginPath(); c.ellipse(0, -11, 15, 11, 0, 0, Math.PI * 2); c.fill(); c.fillRect(-3, -25, 6, 6); },
];

// ---------- The game ----------

const STAT_INFO = [
  { key: "tara", label: "Tara's patience", max: 100, danger: (v) => v < 30 },
  { key: "avoid", label: "Avoidance", max: 100 },
  { key: "degree", label: "Degree", max: 100, suffix: "%" },
  { key: "neck", label: "Neck", max: 100 },
  { key: "cred", label: "Bremerton cred", max: 100 },
  { key: "reacts", label: "Reacts", max: FRIENDS },
];
const FX_LABELS = { tara: "Tara's patience", avoid: "Avoidance", degree: "Degree", neck: "Neck", cred: "Bremerton cred", reacts: "Reacts", pile: "Pile" };

const game = {
  state: null,
  phase: "morning",
  deck: [],
  overnight: "",

  newGame() {
    this.state = { day: 1, tara: 80, avoid: 12, degree: 91, neck: 10, cred: 20, reacts: 0, pile: 5, dodged: 0, sore: 0 };
    this.phase = "morning";
    this.overnight = "It's a pretty normal pile.";
    this.deck = [...RANDOM_EVENTS].sort(() => Math.random() - 0.5);
    $("title").hidden = true;
    $("ending").hidden = true;
    $("game").hidden = false;
    titleArt.stop();
    yard.play();
    this.morning();
    scrollTo(0, 0);
  },

  bonus() {
    return Math.floor(this.state.avoid / 16) + this.state.sore;
  },

  renderStats() {
    const { state } = this;
    $("stats").innerHTML = STAT_INFO.map((s) => {
      const v = state[s.key];
      const danger = s.danger && s.danger(v) ? " danger" : "";
      return `<div class="stat${danger}"><dt>${s.label}</dt><dd>${v}${s.suffix || ""}</dd><div class="meter"><i style="width:${(v / s.max) * 100}%"></i></div></div>`;
    }).join("");
    $("dayLabel").textContent = `Day ${state.day} of ${LAST_DAY}, ${this.phase}`;
    $("pileNote").textContent = `The pile: ${state.pile} ${state.pile === 1 ? "thing" : "things"}. ${this.overnight}`;
    $("scene").setAttribute("aria-label", `Your yard. The pile has ${state.pile} things in it.`);
    if (REDUCED) yard.draw();
  },

  apply(fx = {}) {
    const { state } = this;
    const parts = [];
    for (const [key, change] of Object.entries(fx)) {
      if (!change) continue;
      const before = state[key];
      const max = key === "reacts" ? FRIENDS : key === "pile" ? 40 : 100;
      state[key] = clamp(before + change, 0, max);
      const real = state[key] - before;
      if (real) parts.push(`${FX_LABELS[key]} ${real > 0 ? "+" : "−"}${Math.abs(real)}`);
    }
    return parts.join(", ");
  },

  morning() {
    const { state } = this;
    this.phase = "morning";
    const event = SCRIPTED_EVENTS[state.day] || this.deck.pop() || pick(RANDOM_EVENTS);
    this.renderStats();
    this.showEvent(event);
  },

  showEvent(event) {
    const bonus = this.bonus();
    const card = $("card");
    card.replaceChildren();
    const say = document.createElement("p");
    say.className = "say";
    say.textContent = event.text;
    const list = document.createElement("div");
    list.className = "choices";
    event.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "strip";
      button.textContent = choice.label;
      const hintText = choice.roll ? `Roll a d20. You need ${needed(choice, bonus)} or higher.` : choice.hint;
      if (hintText) {
        const hint = document.createElement("small");
        hint.textContent = hintText;
        button.append(hint);
      }
      button.addEventListener("click", () => (choice.run ? choice.run() : this.choose(choice, needed(choice, bonus))));
      list.append(button);
    });
    card.append(say, list);
    list.querySelector("button").focus({ preventScroll: true });
  },

  async choose(choice, need) {
    for (const b of $("card").querySelectorAll("button")) b.disabled = true;
    if (!choice.roll) {
      this.resolve(choice);
      return;
    }
    const rolled = await this.rollDie();
    const won = rolled >= need;
    this.resolve(won ? choice.win : choice.lose, { rolled, need, won });
  },

  rollDie() {
    const final = 1 + Math.floor(Math.random() * 20);
    const card = $("card");
    const line = document.createElement("div");
    line.className = "rollLine";
    line.innerHTML = '<div class="die" id="die">?</div>';
    card.prepend(line);
    if (REDUCED) return Promise.resolve(final);
    return new Promise((resolve) => {
      let ticks = 0;
      const timer = setInterval(() => {
        $("die").textContent = 1 + Math.floor(Math.random() * 20);
        if (++ticks > 11) {
          clearInterval(timer);
          resolve(final);
        }
      }, 55);
    });
  },

  resolve(result, roll) {
    const { state } = this;
    const changes = this.apply(result.fx);
    if (result.dodged) state.dodged++;
    if (this.phase === "morning") state.sore = 0;
    this.renderStats();

    const card = $("card");
    card.replaceChildren();
    if (roll) {
      const line = document.createElement("div");
      line.className = "rollLine";
      const die = document.createElement("div");
      die.className = `die ${roll.won ? "won" : "lost"}`;
      die.textContent = roll.rolled;
      const note = document.createElement("span");
      note.textContent = `You needed ${roll.need}. ${roll.won ? "Avoided." : "Caught."}`;
      line.append(die, note);
      card.append(line);
    }
    const say = document.createElement("p");
    say.className = "say";
    say.textContent = result.text;
    card.append(say);
    if (changes) {
      const small = document.createElement("p");
      small.className = "changes";
      small.textContent = changes;
      card.append(small);
    }
    const next = this.nextStep(result);
    const button = document.createElement("button");
    button.className = "strip";
    button.textContent = next.label;
    button.addEventListener("click", next.run);
    const wrap = document.createElement("div");
    wrap.className = "choices";
    wrap.append(button);
    card.append(wrap);
    button.focus({ preventScroll: true });
    if (roll && roll.won) yard.rope.fling(-3, -3);
  },

  nextStep(result) {
    const { state } = this;
    if (result.ending) return { label: "See how it ended", run: () => this.end(result.ending) };
    if (state.tara <= 0) return { label: "Tara has had enough", run: () => this.end("tara") };
    if (state.degree >= 100) return { label: "Check your email from Olympic College", run: () => this.end("degree") };
    if (this.phase === "morning") return { label: "Get to the evening", run: () => this.evening() };
    return { label: "Go to bed", run: () => this.night() };
  },

  evening() {
    this.phase = "evening";
    this.renderStats();
    if (REDUCED) yard.draw();
    this.showEvent({
      text: "The evening is yours. Nothing is getting done now anyway.",
      choices: EVENING_ACTIVITIES.map((a) => ({ label: a.label, hint: a.hint, run: () => this.activity(a.id) })),
    });
  },

  activity(id) {
    if (id === "homework") {
      this.resolve({ text: pick(HOMEWORK_LINES), fx: { degree: 1, tara: 2 } });
    } else if (id === "guitar") {
      this.resolve({ text: pick(GUITAR_LINES), fx: { avoid: 4, cred: 3, tara: -3 } });
    } else if (id === "meme") {
      this.resolve({ text: pick(MEME_LINES), fx: { reacts: 20 + Math.floor(Math.random() * 50), cred: 1, tara: -1 } });
    } else if (id === "games") {
      this.choose({
        roll: 10,
        win: { text: pick(GAME_NIGHT_WIN), fx: { cred: 7, avoid: 3, tara: -3 } },
        lose: { text: pick(GAME_NIGHT_LOSE), fx: { cred: 2, avoid: 2, tara: -3 } },
      }, 10);
    } else {
      yard.pause();
      show.start((outcome) => this.afterShow(outcome));
    }
  },

  afterShow({ ratio, hits, total, band }) {
    yard.play();
    const neck = 2 + Math.round(ratio * 16);
    const cred = 1 + Math.round(ratio * 10);
    const sore = ratio >= 0.6 ? 3 : 0;
    this.state.sore = sore;
    let text = `${band} played. You hit ${hits} of ${total} beats. You rate the venue on your way home: "effing awesome."`;
    if (sore) text += " Your neck is killing you, which is a great excuse. Your rolls tomorrow get +3.";
    this.resolve({ text, fx: { neck, cred, tara: -4, pile: ratio > 0.8 ? 1 : 0 } });
  },

  night() {
    const { state } = this;
    state.day++;
    const item = pick(OVERNIGHT_ITEMS);
    state.pile = clamp(state.pile + 1, 0, 40);
    this.overnight = `Overnight it gained ${item}. You didn't put it there.`;
    this.morning();
    scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
  },

  end(kind) {
    const { state } = this;
    const ending = ENDINGS[kind];
    yard.pause();
    $("game").hidden = true;
    $("ending").hidden = false;
    $("endHead").textContent = ending.head;
    $("endBody").textContent = ending.body;
    let award = `Official title: ${ending.title}`;
    if (state.neck >= 40) award += ". Your hair now has its own weather";
    $("endAward").textContent = award;
    $("endYears").textContent = kind === "degree" ? "2016 to 2026" : "2016 to Present";
    const tally = [
      ["Dump runs avoided", state.dodged],
      ["Things in the pile", state.pile],
      ["Reacts from your 908 friends", state.reacts],
      ["Degree", `${state.degree}%`],
    ];
    $("endTally").innerHTML = tally.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
    scrollTo(0, 0);
    $("again").focus({ preventScroll: true });
  },
};

function needed(choice, bonus) {
  return choice.roll ? clamp(choice.roll - bonus, 2, 20) : 0;
}

// ---------- Title art ----------

const titleArt = {
  running: false,
  start() {
    const canvas = $("titleCanvas");
    this.ctx = canvas.getContext("2d");
    this.rope = new Rope(14, 21, FIG_T.x, FIG_T.y);
    for (let i = 0; i < 200; i++) this.rope.step(FIG_T.x, FIG_T.y, 0.6, 0);
    this.time = 0;
    this.angle = -0.2;
    this.target = -0.2;
    this.lastBang = 0;
    this.acc = 0;
    if (REDUCED) {
      // Hold the frame from the profile photo: hair straight up, head down
      this.angle = 0.9;
      const a = hairAnchor(FIG_T.x, FIG_T.y, FIG_T.s, this.angle);
      this.rope.pts.forEach((p, i) => {
        p.x = p.px = a.x - i * 15;
        p.y = p.py = a.y - i * 11 + i * i * 0.9;
      });
      this.draw();
      return;
    }
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame((now) => this.frame(now));
  },
  stop() {
    this.running = false;
  },
  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.acc += dt;
    while (this.acc >= STEP) {
      this.acc -= STEP;
      if (this.time - this.lastBang > 0.62) {
        this.lastBang = this.time;
        this.target = 1.05;
        this.rope.fling(-13, -22);
      }
      this.target += (-0.2 - this.target) * 0.09;
      this.angle += (this.target - this.angle) * 0.55;
      const a = hairAnchor(FIG_T.x, FIG_T.y, FIG_T.s, this.angle);
      this.rope.step(a.x, a.y, 0.6, -0.02);
    }
    this.draw();
    requestAnimationFrame((next) => this.frame(next));
  },
  draw() {
    const { ctx } = this;
    drawStage(ctx, 900, 900, this.time, 0, FIG_T.x, FIG_T.y - 60);
    drawFloor(ctx, 900, 900, FIG_T_FLOOR);
    if (stage3d.ready) {
      // With reduced motion, hold the model's natural pose: head back, hair up
      stage3d.pose(REDUCED ? 0 : this.angle);
      stage3d.draw(ctx, FIG_T.x, FIG_T_FLOOR + 6, 600);
    } else {
      drawFigure(ctx, FIG_T.x, FIG_T.y, FIG_T.s, this.angle, this.rope);
    }
    drawCrowd(ctx, 900, 900, this.time, 0.2);
  },
};
const FIG_T = { x: 430, y: 400, s: 1.7 };
const FIG_T_FLOOR = 735;

// ---------- Wiring ----------

sound.init();
yard.init();
titleArt.start();
stage3d.init().then(() => titleArt.draw());

$("start").addEventListener("click", () => game.newGame());
$("again").addEventListener("click", () => game.newGame());
$("muteBtn").addEventListener("click", () => sound.toggle());
$("leaveShow").addEventListener("click", () => show.finish());
$("show").addEventListener("close", () => show.finish());
$("showCanvas").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  show.bang();
});
// Space bangs instead of pressing whichever button has focus
document.addEventListener("keydown", (e) => {
  if (!$("show").open || e.code !== "Space") return;
  e.preventDefault();
  if (!e.repeat) show.bang();
}, true);
document.addEventListener("keyup", (e) => {
  if ($("show").open && e.code === "Space") e.preventDefault();
}, true);
