#!/usr/bin/env node
/**
 * Generates README visuals for evolution.js (no npm dependencies).
 *
 * Usage: node generate-visuals.mjs
 *
 * Outputs:
 *   media/logo.png          — library logo
 *   media/demo-fitness.png  — string-evolution fitness chart
 *   media/code.png          — macOS code editor screenshot
 */

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, "media");
const TARGET = "Hello";
const ITERATIONS = 80;
const POPULATION_SIZE = 80;

mkdirSync(MEDIA_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Load evolution.js (classic script globals) into a sandbox
// ---------------------------------------------------------------------------

function loadEvolution() {
  const code = readFileSync(join(__dirname, "evolution.js"), "utf8");
  const sandbox = {
    console,
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    Infinity,
    undefined,
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return {
    GA: sandbox.GA,
    Evolution: sandbox.Evolution,
    Population: sandbox.Population,
    Member: sandbox.Member,
    Gene: sandbox.Gene,
  };
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder + drawing helpers (RGBA)
// ---------------------------------------------------------------------------

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = u32(data.length);
  const crc = u32(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function createCanvas(width, height, bg) {
  const data = Buffer.alloc(width * height * 4);
  const canvas = {
    width,
    height,
    data,
    fill(r, g, b, a = 255) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
      }
    },
    set(x, y, r, g, b, a = 255) {
      x |= 0;
      y |= 0;
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const i = (y * width + x) * 4;
      if (a >= 255) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;
        return;
      }
      const inv = 1 - a / 255;
      data[i] = (r * a + data[i] * inv * data[i + 3]) / 255 | 0;
      data[i + 1] = (g * a + data[i + 1] * inv * data[i + 3]) / 255 | 0;
      data[i + 2] = (b * a + data[i + 2] * inv * data[i + 3]) / 255 | 0;
      data[i + 3] = Math.min(255, a + data[i + 3] * inv) | 0;
    },
    blend(x, y, r, g, b, a) {
      x |= 0;
      y |= 0;
      if (x < 0 || y < 0 || x >= width || y >= height || a <= 0) return;
      const i = (y * width + x) * 4;
      const srcA = a / 255;
      const dstA = data[i + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA <= 0) return;
      data[i] = ((r * srcA + data[i] * dstA * (1 - srcA)) / outA) | 0;
      data[i + 1] = ((g * srcA + data[i + 1] * dstA * (1 - srcA)) / outA) | 0;
      data[i + 2] = ((b * srcA + data[i + 2] * dstA * (1 - srcA)) / outA) | 0;
      data[i + 3] = (outA * 255) | 0;
    },
    fillRect(x0, y0, w, h, r, g, b, a = 255) {
      const x1 = Math.min(width, Math.ceil(x0 + w));
      const y1 = Math.min(height, Math.ceil(y0 + h));
      x0 = Math.max(0, x0 | 0);
      y0 = Math.max(0, y0 | 0);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) this.blend(x, y, r, g, b, a);
      }
    },
    line(x0, y0, x1, y1, r, g, b, a = 255, thickness = 1) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
      const half = thickness / 2;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = x0 + dx * t;
        const cy = y0 + dy * t;
        for (let oy = -half; oy <= half; oy++) {
          for (let ox = -half; ox <= half; ox++) {
            if (ox * ox + oy * oy <= half * half + 0.25) {
              this.blend(Math.round(cx + ox), Math.round(cy + oy), r, g, b, a);
            }
          }
        }
      }
    },
    circle(cx, cy, radius, r, g, b, a = 255, fill = true) {
      const r2 = radius * radius;
      const x0 = Math.floor(cx - radius - 1);
      const y0 = Math.floor(cy - radius - 1);
      const x1 = Math.ceil(cx + radius + 1);
      const y1 = Math.ceil(cy + radius + 1);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          if (fill) {
            if (d <= r2) this.blend(x, y, r, g, b, a);
          } else if (d <= r2 && d >= (radius - 1.2) * (radius - 1.2)) {
            this.blend(x, y, r, g, b, a);
          }
        }
      }
    },
    toPng() {
      return encodePng(width, height, data);
    },
  };
  if (bg) canvas.fill(bg[0], bg[1], bg[2], bg[3] ?? 255);
  return canvas;
}

// 5x7 bitmap font (subset)
const FONT = {
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 4, 4],
  ",": [0, 0, 0, 0, 4, 4, 8],
  "-": [0, 0, 0, 31, 0, 0, 0],
  "_": [0, 0, 0, 0, 0, 0, 31],
  ":": [0, 4, 4, 0, 4, 4, 0],
  ";": [0, 4, 4, 0, 4, 4, 8],
  "!": [4, 4, 4, 4, 0, 0, 4],
  "?": [14, 17, 1, 2, 4, 0, 4],
  "/": [1, 2, 2, 4, 8, 8, 16],
  "\\": [16, 8, 8, 4, 2, 2, 1],
  "(": [2, 4, 8, 8, 8, 4, 2],
  ")": [8, 4, 2, 2, 2, 4, 8],
  "{": [6, 8, 8, 16, 8, 8, 6],
  "}": [12, 2, 2, 1, 2, 2, 12],
  "[": [14, 8, 8, 8, 8, 8, 14],
  "]": [14, 2, 2, 2, 2, 2, 14],
  "=": [0, 0, 31, 0, 31, 0, 0],
  "+": [0, 4, 4, 31, 4, 4, 0],
  "*": [0, 10, 4, 31, 4, 10, 0],
  "<": [0, 2, 4, 8, 4, 2, 0],
  ">": [0, 8, 4, 2, 4, 8, 0],
  "'": [4, 4, 8, 0, 0, 0, 0],
  '"': [10, 10, 10, 0, 0, 0, 0],
  "`": [8, 4, 0, 0, 0, 0, 0],
  "#": [10, 10, 31, 10, 31, 10, 10],
  "%": [17, 18, 4, 8, 16, 9, 17],
  "&": [12, 18, 20, 8, 21, 18, 13],
  "|": [4, 4, 4, 4, 4, 4, 4],
  "0": [14, 17, 19, 21, 25, 17, 14],
  "1": [4, 12, 4, 4, 4, 4, 14],
  "2": [14, 17, 1, 2, 4, 8, 31],
  "3": [14, 17, 1, 6, 1, 17, 14],
  "4": [2, 6, 10, 18, 31, 2, 2],
  "5": [31, 16, 30, 1, 1, 17, 14],
  "6": [6, 8, 16, 30, 17, 17, 14],
  "7": [31, 1, 2, 4, 8, 8, 8],
  "8": [14, 17, 17, 14, 17, 17, 14],
  "9": [14, 17, 17, 15, 1, 2, 12],
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 19, 17, 17, 14],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [1, 1, 1, 1, 17, 17, 14],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [14, 17, 16, 14, 1, 17, 14],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  a: [0, 0, 14, 1, 15, 17, 15],
  b: [16, 16, 30, 17, 17, 17, 30],
  c: [0, 0, 14, 17, 16, 17, 14],
  d: [1, 1, 15, 17, 17, 17, 15],
  e: [0, 0, 14, 17, 31, 16, 14],
  f: [6, 8, 8, 28, 8, 8, 8],
  g: [0, 0, 15, 17, 15, 1, 14],
  h: [16, 16, 30, 17, 17, 17, 17],
  i: [4, 0, 12, 4, 4, 4, 14],
  j: [2, 0, 6, 2, 2, 18, 12],
  k: [16, 16, 18, 20, 24, 20, 18],
  l: [12, 4, 4, 4, 4, 4, 14],
  m: [0, 0, 26, 21, 21, 21, 21],
  n: [0, 0, 30, 17, 17, 17, 17],
  o: [0, 0, 14, 17, 17, 17, 14],
  p: [0, 0, 30, 17, 30, 16, 16],
  q: [0, 0, 15, 17, 15, 1, 1],
  r: [0, 0, 22, 25, 16, 16, 16],
  s: [0, 0, 15, 16, 14, 1, 30],
  t: [8, 8, 28, 8, 8, 8, 6],
  u: [0, 0, 17, 17, 17, 17, 15],
  v: [0, 0, 17, 17, 17, 10, 4],
  w: [0, 0, 17, 17, 21, 21, 10],
  x: [0, 0, 17, 10, 4, 10, 17],
  y: [0, 0, 17, 17, 15, 1, 14],
  z: [0, 0, 31, 2, 4, 8, 31],
};

function drawText(canvas, text, x, y, r, g, b, a = 255, scale = 2) {
  let cx = x;
  for (const ch of text) {
    const glyph = FONT[ch] || FONT["."];
    for (let row = 0; row < 7; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          canvas.fillRect(cx + col * scale, y + row * scale, scale, scale, r, g, b, a);
        }
      }
    }
    cx += 6 * scale;
  }
  return cx;
}

function textWidth(text, scale = 2) {
  return text.length * 6 * scale;
}

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

function generateLogo() {
  const W = 640;
  const H = 360;
  const c = createCanvas(W, H, [18, 32, 36, 255]);

  // Soft radial-ish atmosphere via layered rects
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const pad = 40 + i * 28;
    c.fillRect(pad, pad, W - pad * 2, H - pad * 2, 28, 58, 52, 18);
  }

  // Double helix / chromosome motif (kept below the title band)
  const hx = W * 0.22;
  const hy = H * 0.62;
  const amp = 42;
  const len = 180;
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const y = hy - len / 2 + t * len;
    const phase = t * Math.PI * 4;
    const x1 = hx + Math.sin(phase) * amp;
    const x2 = hx + Math.sin(phase + Math.PI) * amp;
    const a = 180 + Math.sin(phase) * 40;
    c.circle(x1, y, 4.5, 62, 168, 140, a | 0, true);
    c.circle(x2, y, 4.5, 214, 168, 72, a | 0, true);
    if (i % 5 === 0) {
      c.line(x1, y, x2, y, 120, 150, 140, 90, 1.5);
    }
  }

  // Branching evolution tree (right side)
  const branches = [
    [420, 280, 480, 200],
    [480, 200, 540, 140],
    [480, 200, 560, 220],
    [540, 140, 580, 100],
    [540, 140, 590, 160],
    [420, 280, 460, 300],
    [460, 300, 510, 290],
  ];
  for (const [x0, y0, x1, y1] of branches) {
    c.line(x0, y0, x1, y1, 90, 140, 120, 200, 3);
  }
  const nodes = [
    [420, 280],
    [480, 200],
    [540, 140],
    [560, 220],
    [580, 100],
    [590, 160],
    [460, 300],
    [510, 290],
  ];
  for (const [nx, ny] of nodes) {
    c.circle(nx, ny, 7, 232, 196, 96, 230, true);
    c.circle(nx, ny, 3, 18, 32, 36, 255, true);
  }

  // Brand wordmark
  const title = "evolution.js";
  const scale = 4;
  const tw = textWidth(title, scale);
  drawText(c, title, (W - tw) / 2, 28, 236, 244, 238, 255, scale);
  const sub = "Genetic Evolutionary Algorithm";
  const sw = textWidth(sub, 2);
  drawText(c, sub, (W - sw) / 2, 68, 150, 186, 170, 255, 2);

  return c.toPng();
}

// ---------------------------------------------------------------------------
// Demo: evolve TARGET string, chart fitness
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function runStringDemo({ GA, Evolution, Population, Member, Gene }) {
  // Deterministic demo for stable README images
  const rng = mulberry32(0xe701);
  GA.random = rng;
  // Narrow charset so the demo converges in reasonable iterations
  GA.charSet = "Helo WrdabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .";

  const history = [];
  let bestString = "";

  const fitness = (member) => {
    const s = member.chromosome.val;
    let score = 1; // keep roulette happy (avoid all-zero)
    const len = Math.min(s.length, TARGET.length);
    for (let i = 0; i < len; i++) {
      if (s[i] === TARGET[i]) score += 10;
    }
    score -= Math.abs(s.length - TARGET.length) * 3;
    return Math.max(1, score);
  };

  const createPopulation = function (size) {
    const pop = new Population(this);
    for (let i = 0; i < size; i++) {
      let seed = "";
      for (let j = 0; j < TARGET.length; j++) {
        seed += GA.charSet[GA.randomINT(0, GA.charSet.length - 1)];
      }
      const gene = new Gene()
        .TYPE(GA.TYPE.STRING)
        .VAL(seed)
        .CHG(true)
        .INS(false)
        .RMV(false)
        .SWP(false)
        .MUTATION_RATE(0.35)
        .CHG_RATE(0.25);
      new Member(pop, gene);
    }
  };

  const evo = new Evolution(fitness, createPopulation);
  evo.setParameters({
    mutation_rate: 0.35,
    population_size: POPULATION_SIZE,
    iterations: ITERATIONS,
    elitism: true,
    elit_num: 2,
    crossing_over: true,
    crossing_overRate: 0.7,
    crossing_overMethod: GA.CO_TYPES.UNIFORM,
    crossing_overUniformRate: 0.5,
    selectionMethod: GA.SELECTION.ROULETTE,
    algorithm: GA.ALGORITHMS.STEPBYSTEP,
  });

  evo.start();

  for (let gen = 0; gen <= ITERATIONS; gen++) {
    history.push({
      generation: gen,
      avg: evo.population.avgFitness,
      max: evo.population.maxFitness,
      best: evo.population.bestMember.chromosome.val,
    });
    bestString = evo.population.bestMember.chromosome.val;
    if (bestString === TARGET) break;
    if (gen < ITERATIONS) evo.step();
  }

  return { history, bestString };
}

function generateFitnessChart(history, bestString) {
  const W = 900;
  const H = 520;
  const c = createCanvas(W, H, [245, 248, 246, 255]);

  // Header band
  c.fillRect(0, 0, W, 64, 18, 32, 36, 255);
  drawText(c, "String evolution demo", 24, 14, 236, 244, 238, 255, 3);
  drawText(
    c,
    `target: ${TARGET}   best: ${bestString}`,
    24,
    40,
    150,
    186,
    170,
    255,
    2
  );

  const padL = 70;
  const padR = 30;
  const padT = 100;
  const padB = 70;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // Plot background
  c.fillRect(padL, padT, plotW, plotH, 255, 255, 255, 255);
  c.line(padL, padT, padL + plotW, padT, 200, 210, 205, 255, 1);
  c.line(padL, padT + plotH, padL + plotW, padT + plotH, 200, 210, 205, 255, 1);
  c.line(padL, padT, padL, padT + plotH, 200, 210, 205, 255, 1);
  c.line(padL + plotW, padT, padL + plotW, padT + plotH, 200, 210, 205, 255, 1);

  const maxY = Math.max(...history.map((h) => h.max), 1);
  const minY = Math.min(...history.map((h) => h.avg), 0);
  const rangeY = Math.max(1, maxY - minY);
  const maxGen = Math.max(1, history[history.length - 1].generation);

  // Grid + labels
  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH * i) / 4;
    c.line(padL, y, padL + plotW, y, 220, 228, 224, 255, 1);
    const val = (maxY - (rangeY * i) / 4).toFixed(0);
    drawText(c, val, 12, y - 6, 90, 110, 100, 255, 2);
  }
  for (let i = 0; i <= 4; i++) {
    const gen = Math.round((maxGen * i) / 4);
    const x = padL + (plotW * i) / 4;
    drawText(c, String(gen), x - 6, padT + plotH + 16, 90, 110, 100, 255, 2);
  }
  drawText(c, "generation", padL + plotW / 2 - 50, H - 28, 90, 110, 100, 255, 2);
  drawText(c, "fitness", 12, padT - 24, 90, 110, 100, 255, 2);

  const point = (gen, fitness) => ({
    x: padL + (gen / maxGen) * plotW,
    y: padT + plotH - ((fitness - minY) / rangeY) * plotH,
  });

  // Avg line
  for (let i = 1; i < history.length; i++) {
    const a = point(history[i - 1].generation, history[i - 1].avg);
    const b = point(history[i].generation, history[i].avg);
    c.line(a.x, a.y, b.x, b.y, 90, 140, 120, 220, 2.5);
  }
  // Max line
  for (let i = 1; i < history.length; i++) {
    const a = point(history[i - 1].generation, history[i - 1].max);
    const b = point(history[i].generation, history[i].max);
    c.line(a.x, a.y, b.x, b.y, 196, 120, 48, 240, 3);
  }

  // Legend
  const lx = padL + plotW - 160;
  const ly = padT + 16;
  c.fillRect(lx - 10, ly - 8, 160, 48, 255, 255, 255, 220);
  c.line(lx, ly + 6, lx + 28, ly + 6, 196, 120, 48, 255, 3);
  drawText(c, "max fitness", lx + 36, ly, 60, 70, 65, 255, 2);
  c.line(lx, ly + 28, lx + 28, ly + 28, 90, 140, 120, 255, 2.5);
  drawText(c, "avg fitness", lx + 36, ly + 22, 60, 70, 65, 255, 2);

  return c.toPng();
}

// ---------------------------------------------------------------------------
// macOS code editor screenshot
// ---------------------------------------------------------------------------

const SYNTAX = {
  comment: [106, 153, 85],
  keyword: [197, 134, 192],
  string: [206, 145, 120],
  number: [181, 206, 168],
  function: [220, 220, 170],
  className: [78, 201, 176],
  property: [156, 220, 254],
  plain: [212, 212, 212],
  punct: [212, 212, 212],
  operator: [212, 212, 212],
  lineNo: [110, 118, 129],
};

const KW = new Set([
  "var",
  "function",
  "return",
  "for",
  "if",
  "new",
  "true",
  "false",
  "this",
]);

const LIB = new Set([
  "Evolution",
  "Population",
  "Member",
  "Gene",
  "Chromosome",
  "GA",
]);

function tokenizeJsLine(line) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === " " || line[i] === "\t") {
      let j = i;
      while (j < line.length && (line[j] === " " || line[j] === "\t")) j++;
      tokens.push({ type: "plain", text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ type: "comment", text: line.slice(i) });
      break;
    }
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) j++;
      if (j < line.length) j++;
      tokens.push({ type: "string", text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      tokens.push({ type: "number", text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let type = "plain";
      if (KW.has(word)) type = "keyword";
      else if (LIB.has(word)) type = "className";
      else if (line[j] === "(") type = "function";
      else if (i > 0 && line[i - 1] === ".") type = "property";
      tokens.push({ type, text: word });
      i = j;
      continue;
    }
    tokens.push({ type: "punct", text: line[i] });
    i++;
  }
  return tokens;
}

function generateCodePng() {
  const source = [
    "// evolution.js - string evolution demo",
    'var TARGET = "Hello";',
    "",
    "function fitness(member) {",
    "  var s = member.chromosome.val;",
    "  var score = 0;",
    "  for (var i = 0; i < TARGET.length; i++) {",
    "    if (s[i] === TARGET[i]) score += 10;",
    "  }",
    "  return score;",
    "}",
    "",
    "function createPop(size) {",
    "  var pop = new Population(this);",
    "  for (var i = 0; i < size; i++) {",
    "    new Member(pop, new Gene()",
    "      .TYPE(GA.TYPE.STRING)",
    '      .VAL("....."));',
    "  }",
    "}",
    "",
    "var evo = new Evolution(fitness, createPop);",
    "evo.setParameters({",
    "  population_size: 80,",
    "  iterations: 60,",
    "  mutation_rate: 0.3,",
    "  elitism: true",
    "});",
    "evo.start();",
  ];

  const scale = 2;
  const lineH = 7 * scale + 8;
  const gutterW = 54;
  const padL = 18;
  const padT = 56;
  const padR = 28;
  const padB = 28;
  const maxCols = Math.max(...source.map((l) => l.length), 40);
  const W = padL + gutterW + maxCols * 6 * scale + padR;
  const H = padT + source.length * lineH + padB;

  // Desktop wallpaper behind the window
  const c = createCanvas(W + 48, H + 48, [42, 52, 58, 255]);
  for (let i = 0; i < 5; i++) {
    c.fillRect(12 + i * 8, 12 + i * 6, W + 24 - i * 16, H + 24 - i * 12, 55, 70, 78, 30);
  }

  const ox = 24;
  const oy = 24;

  // Window shadow
  c.fillRect(ox + 6, oy + 8, W, H, 0, 0, 0, 50);

  // Window body
  c.fillRect(ox, oy, W, H, 30, 30, 30, 255);

  // Title bar
  c.fillRect(ox, oy, W, 40, 45, 45, 48, 255);
  c.line(ox, oy + 40, ox + W, oy + 40, 60, 60, 64, 255, 1);

  // Traffic lights
  const lights = [
    [255, 95, 86],
    [255, 189, 46],
    [39, 201, 63],
  ];
  lights.forEach((rgb, i) => {
    const lx = ox + 18 + i * 20;
    const ly = oy + 20;
    c.circle(lx, ly, 7, rgb[0], rgb[1], rgb[2], 255, true);
    c.circle(lx - 1.5, ly - 1.5, 2, 255, 255, 255, 70, true);
  });

  // Filename pill
  const fileName = "example.js";
  const fw = textWidth(fileName, 2);
  const fx = ox + (W - fw) / 2;
  c.fillRect(fx - 14, oy + 10, fw + 28, 20, 58, 58, 62, 255);
  drawText(c, fileName, fx, oy + 13, 200, 200, 205, 255, 2);

  // Editor background
  c.fillRect(ox, oy + 40, W, H - 40, 30, 30, 30, 255);

  // Soft left gutter
  c.fillRect(ox, oy + 40, padL + gutterW - 8, H - 40, 35, 35, 38, 255);

  source.forEach((line, idx) => {
    const y = oy + padT + idx * lineH;
    const lineNo = String(idx + 1).padStart(2, " ");
    drawText(c, lineNo, ox + padL, y, ...SYNTAX.lineNo, 255, scale);

    let x = ox + padL + gutterW;
    const tokens = tokenizeJsLine(line);
    for (const tok of tokens) {
      const color = SYNTAX[tok.type] || SYNTAX.plain;
      x = drawText(c, tok.text, x, y, color[0], color[1], color[2], 255, scale);
    }
  });

  // Subtle bottom status bar
  c.fillRect(ox, oy + H - 22, W, 22, 40, 40, 44, 255);
  drawText(c, "JavaScript  UTF-8  Ln 29", ox + 14, oy + H - 17, 140, 145, 150, 255, 2);

  return c.toPng();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const api = loadEvolution();
const logoPath = join(MEDIA_DIR, "logo.png");
const demoPath = join(MEDIA_DIR, "demo-fitness.png");
const codePath = join(MEDIA_DIR, "code.png");

writeFileSync(logoPath, generateLogo());
console.log("wrote", logoPath);

const { history, bestString } = runStringDemo(api);
writeFileSync(demoPath, generateFitnessChart(history, bestString));
console.log("wrote", demoPath);
console.log(
  `demo: ${history.length - 1} generations, best="${bestString}" (target="${TARGET}")`
);

writeFileSync(codePath, generateCodePng());
console.log("wrote", codePath);
