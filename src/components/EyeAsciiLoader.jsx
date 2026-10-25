import { useEffect, useRef, useState } from 'react';
import './EyeAsciiLoader.css';

/**
 * EyeAsciiLoader — real eye photograph -> luminance-mapped character grid, Canvas 2D.
 *
 * Props
 *   onReveal     () => void   called once when the reveal phase starts (mount your homepage here so it shows through)
 *   onComplete   () => void   called exactly once when the overlay has finished (or was skipped / failed)
 *   src          string       eye image URL (default '/eye-source.jpg', served from /public)
 *   oncePerSession boolean    play once per browser tab session (default true)
 */

// ---- tunables ------------------------------------------------------------------------------
const BG = '#080808';
const RAMP = " .`,:;-~+=*xo%#&@";            // index 0 = empty cell, last = densest glyph
const PUPIL = { x: 0.428, y: 0.490 };          // pupil centre in the source image (0..1)
const IRIS_D = 0.53;                           // iris diameter as a fraction of image width
const CELL_ASPECT = 1.8;                       // cell height / cell width
const T = { A: 600, B: 2900, C: 3900, D: 4350, E: 5100 }; // phase END times (ms)
const STORAGE_KEY = 'eyeAsciiLoaderSeen';
const MONO = 'ui-monospace, "JetBrains Mono", Menlo, Consolas, "Courier New", monospace';

const STOPS = [[0, [46, 14, 8]], [0.22, [112, 36, 14]], [0.45, [192, 84, 24]], [0.68, [240, 162, 50]], [0.88, [249, 216, 152]], [1, [255, 241, 216]]];
const REDS = [[98, 26, 22], [134, 38, 30], [172, 54, 40], [204, 78, 58]];
const NPAL = 16;                                // gradient bins; 16..19 are muted reds
const PALETTE = (() => {
  const out = [];
  for (let i = 0; i < NPAL; i++) {
    const p = i / (NPAL - 1);
    let k = 0; while (k < STOPS.length - 2 && p > STOPS[k + 1][0]) k++;
    const [p0, c0] = STOPS[k], [p1, c1] = STOPS[k + 1];
    const f = (p - p0) / (p1 - p0);
    out.push(c0.map((v, j) => Math.round(v + (c1[j] - v) * f)));
  }
  return out.concat(REDS).map((c) => `rgb(${c[0]},${c[1]},${c[2]})`);
})();

const FRAGMENTS = [
  'init sensor_array[0x00..0xFF]', '> mount /dev/retina0', 'calibrating aperture ...', '0x3F 0xA2 0x91 0x7C 0x00',
  'Y = 0.2126R + 0.7152G + 0.0722B', 'ramp.load(" .`,:;-~+=*xo%#&@")', 'buffer.alloc(cols * rows)', 'sync lock ........ OK',
  'iris.locate() -> [0.428, 0.490]', 'decode: lum -> glyph', '> handshake 0xDEADBEEF', 'rx 4096b  crc OK',
  'scan.line++ ', 'if (pupil.dark) focus();', 'stream open :: ascii/eye', 'denoise pass 2/3',
];

// ---- helpers -------------------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeIO = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const hash = (n) => { n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

function boxBlur(src, cols, rows, r) {
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length), n = 2 * r + 1;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    let s = 0; for (let k = -r; k <= r; k++) s += src[y * cols + clamp(x + k, 0, cols - 1)];
    tmp[y * cols + x] = s / n;
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    let s = 0; for (let k = -r; k <= r; k++) s += tmp[clamp(y + k, 0, rows - 1) * cols + x];
    out[y * cols + x] = s / n;
  }
  return out;
}

/** Sample a crop of the image into a cols x rows luminance/saturation field (done once, never per frame). */
function sampleField(img, crop, cols, rows) {
  const sw = cols * 2, sh = rows * 2;
  const c = document.createElement('canvas'); c.width = sw; c.height = sh;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, sw, sh);
  const d = x.getImageData(0, 0, sw, sh).data;
  const lum = new Float32Array(cols * rows), sat = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    let L = 0, S = 0;
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const o = ((r * 2 + dy) * sw + q * 2 + dx) * 4;
      const R = d[o] / 255, G = d[o + 1] / 255, B = d[o + 2] / 255;
      L += 0.2126 * R + 0.7152 * G + 0.0722 * B;
      const mx = Math.max(R, G, B); S += mx > 0 ? (mx - Math.min(R, G, B)) / mx : 0;
    }
    lum[r * cols + q] = L / 4; sat[r * cols + q] = S / 4;
  }
  return { lum, sat };
}

/** Contrast stretch + local-contrast (unsharp) so iris fibres, lids and highlights survive the quantisation. */
function enhance(lum, cols, rows) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < lum.length; i++) hist[Math.min(255, (lum[i] * 255) | 0)]++;
  const total = lum.length; let acc = 0, lo = 0, hi = 255;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > total * 0.02) { lo = i; break; } }
  acc = 0; for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > total * 0.012) { hi = i; break; } }
  const a = lo / 255, b = Math.max(hi / 255, a + 0.1);
  const base = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) base[i] = Math.pow(clamp((lum[i] - a) / (b - a)), 0.6);
  const blur = boxBlur(base, cols, rows, 2);
  const out = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) {
    let v = clamp(base[i] + 0.9 * (base[i] - blur[i]));
    out[i] = lerp(v, v * v * (3 - 2 * v), 0.55);
  }
  return out;
}

function makeAtlas(gw) {
  gw = Math.max(6, Math.round(gw)); const gh = Math.round(gw * CELL_ASPECT);
  const c = document.createElement('canvas'); c.width = RAMP.length * gw; c.height = PALETTE.length * gh;
  const x = c.getContext('2d');
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `600 ${(gw / 0.6).toFixed(1)}px ${MONO}`;
  for (let col = 0; col < PALETTE.length; col++) {
    x.fillStyle = PALETTE[col];
    for (let k = 1; k < RAMP.length; k++) x.fillText(RAMP[k], k * gw + gw / 2, col * gh + gh / 2 + gh * 0.04);
  }
  return { canvas: c, gw, gh };
}

function buildGrid(img, cropN, cols, atlasGW, seed, cache) {
  const W = img.naturalWidth, H = img.naturalHeight;
  const crop = { x: cropN.x * W, y: cropN.y * H, w: cropN.w * W, h: cropN.h * H };
  const rows = Math.max(8, Math.round((cols * crop.h / crop.w) / CELL_ASPECT));
  const { lum, sat } = sampleField(img, crop, cols, rows);
  const L = enhance(lum, cols, rows);
  const n = cols * rows;
  const ch = new Uint8Array(n), co = new Uint8Array(n), thr = new Float32Array(n);
  const rx = new Float32Array(n), ry = new Float32Array(n), rd = new Float32Array(n), dist = new Float32Array(n);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, h = hash(i + seed);
    const u = cropN.x + (c + 0.5) / cols * cropN.w, v = cropN.y + (r + 0.5) / rows * cropN.h;
    const fade = smooth(u / 0.09) * smooth((1 - u) / 0.09) * smooth(v / 0.09) * smooth((1 - v) / 0.09);
    const l = L[i] * fade;
    ch[i] = l < 0.07 ? 0 : Math.min(RAMP.length - 1, Math.round(l * (RAMP.length - 1)));
    const pos = clamp(Math.pow(l, 0.85) * 1.06 + sat[i] * 0.28);
    co[i] = (h < 0.04 && l > 0.15 && l < 0.8) ? 16 + Math.min(3, (l * 4.5) | 0) : Math.round(pos * (NPAL - 1));
    const dx = u - PUPIL.x, dy = (v - PUPIL.y) * (H / W);
    dist[i] = Math.hypot(dx, dy);
    thr[i] = clamp(Math.max(0, dist[i] - 0.09) / 0.58) * 0.84 + hash(i * 3 + seed + 7) * 0.16;
    rx[i] = hash(i * 5 + seed + 1) * 2 - 1; ry[i] = hash(i * 11 + seed + 2) * 2 - 1; rd[i] = hash(i * 13 + seed + 3);
  }
  const g = { cols, rows, crop: cropN, ch, co, thr, rx, ry, rd, dist, atlas: makeAtlas(atlasGW), cache: null };
  if (cache) {
    // Pre-render the fully reconstructed grid ONCE so settled regions are a single blit per frame.
    const { canvas: A, gw, gh } = g.atlas;
    const cc = document.createElement('canvas'); cc.width = cols * gw; cc.height = rows * gh;
    const x = cc.getContext('2d');
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c; if (ch[i]) x.drawImage(A, ch[i] * gw, co[i] * gh, gw, gh, c * gw, r * gh, gw, gh);
    }
    g.cache = cc;
  }
  return g;
}

function drawGrid(ctx, g, S, cam, o) {
  const { cols, rows, crop, atlas } = g;
  const sx = crop.w * S.iw * cam.z / cols, sy = crop.h * S.ih * cam.z / rows;
  const ox = S.cx + (crop.x - cam.fx) * S.iw * cam.z, oy = S.cy + (crop.y - cam.fy) * S.ih * cam.z;
  const c0 = Math.max(0, Math.floor(-ox / sx) - 1), c1 = Math.min(cols, Math.ceil((S.w - ox) / sx) + 1);
  const r0 = Math.max(0, Math.floor(-oy / sy) - 1), r1 = Math.min(rows, Math.ceil((S.h - oy) / sy) + 1);
  const { canvas: A, gw, gh } = atlas, pw = sx + 0.6, ph = sy + 0.6;
  const rev = o.reveal, disp = o.disp, jit = o.jit, fr = o.frame >> 2;
  const rin = g.cache ? o.rin || 0 : 0;
  if (rin > 0) {
    const px = S.cx + (PUPIL.x - cam.fx) * S.iw * cam.z, py = S.cy + (PUPIL.y - cam.fy) * S.ih * cam.z;
    ctx.save(); ctx.beginPath();
    if (rin >= 5) ctx.rect(0, 0, S.w, S.h); else ctx.arc(px, py, rin * S.iw * cam.z, 0, Math.PI * 2);
    ctx.clip(); ctx.globalAlpha = o.alpha;
    ctx.drawImage(g.cache, ox, oy, cols * sx, rows * sy);
    ctx.restore();
    if (o.jit > 0) { // sparse scattered copies of a few cells on top of the cached image (glitch fragments)
      ctx.globalAlpha = o.alpha;
      for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {
        const i = r * cols + c;
        if (g.rd[i] < 0.05 * o.jit && g.ch[i]) {
          ctx.drawImage(atlas.canvas, g.ch[i] * gw, g.co[i] * gh, gw, gh,
            ox + c * sx + g.rx[i] * 70 * S.dpr * o.jit, oy + r * sy + g.ry[i] * 14 * S.dpr * o.jit, pw, ph);
        }
      }
      ctx.globalAlpha = 1;
    }
    if (rin >= 5) return;
  }
  ctx.globalAlpha = o.alpha;
  for (let r = r0; r < r1; r++) {
    const y = oy + r * sy;
    for (let c = c0; c < c1; c++) {
      const i = r * cols + c, th = g.thr[i];
      if (th > rev || (rin > 0 && g.dist[i] < rin)) continue;
      let k = g.ch[i], col = g.co[i];
      const edge = rev - th;
      if (edge < 0.045) { k = 1 + ((hash(i + fr * 977) * (RAMP.length - 1)) | 0); col = 14; }
      else if (((i * 7919 + (o.frame >> 3)) % 61) === 0) k = Math.max(0, Math.min(RAMP.length - 1, k + ((i & 1) ? 1 : -1)));
      if (k === 0) continue;
      let X = ox + c * sx, Y = y;
      if (disp > 0) {
        if (g.rd[i] < disp * 1.15) continue;
        const d2 = disp * disp;
        X += g.rx[i] * d2 * S.w * 0.28; Y += g.ry[i] * d2 * S.h * 0.2 - d2 * S.h * 0.12;
      }
      if (jit > 0 && g.rd[i] < 0.05 * jit) { X += g.rx[i] * 70 * S.dpr * jit; Y += g.ry[i] * 14 * S.dpr * jit; }
      ctx.drawImage(A, k * gw, col * gh, gw, gh, X, Y, pw, ph);
    }
  }
  ctx.globalAlpha = 1;
}

/** Phase E: the settled eye breaks into staggered tiles of characters that drift, shrink and fade. */
function drawTiles(ctx, g, S, cam, disp, alpha) {
  const NX = 30, NY = 16, { crop } = g, cv = g.cache;
  const sw = cv.width / NX, sh = cv.height / NY;
  const dw = crop.w * S.iw * cam.z / NX, dh = crop.h * S.ih * cam.z / NY;
  const ox = S.cx + (crop.x - cam.fx) * S.iw * cam.z, oy = S.cy + (crop.y - cam.fy) * S.ih * cam.z;
  for (let ty = 0; ty < NY; ty++) for (let tx = 0; tx < NX; tx++) {
    const id = ty * NX + tx, delay = hash(id * 3 + 1) * 0.5;
    const l = clamp((disp - delay) / 0.5); if (l >= 1) continue;
    const e = l * l, sc = 1 - 0.45 * l;
    const vx = (hash(id * 5 + 2) * 2 - 1) * S.w * 0.3, vy = (hash(id * 7 + 3) * 2 - 1) * S.h * 0.22 - S.h * 0.12;
    const cx = ox + (tx + 0.5) * dw + vx * e, cy = oy + (ty + 0.5) * dh + vy * e;
    if (cx < -dw || cx > S.w + dw || cy < -dh || cy > S.h + dh) continue;
    ctx.globalAlpha = alpha * (1 - l);
    ctx.drawImage(cv, tx * sw, ty * sh, sw, sh, cx - dw * sc / 2, cy - dh * sc / 2, dw * sc + 0.6, dh * sc + 0.6);
  }
  ctx.globalAlpha = 1;
}

function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
}

function alreadySeen() { try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; } }
function markSeen() { try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode */ } }

// ---- component -----------------------------------------------------------------------------
export default function EyeAsciiLoader({ onReveal, onComplete, src = '/eye-source.jpg', oncePerSession = true }) {
  const rootRef = useRef(null), canvasRef = useRef(null), scanRef = useRef(null);
  const cbRef = useRef(onComplete), revRef = useRef(onReveal), doneRef = useRef(false), revealedRef = useRef(false), skipRef = useRef(null);
  cbRef.current = onComplete; revRef.current = onReveal;
  const [bypass] = useState(() => oncePerSession && alreadySeen());

  useEffect(() => {
    const fireReveal = () => {
      if (revealedRef.current) return; revealedRef.current = true;
      if (revRef.current) revRef.current();
    };
    const finish = () => {
      fireReveal();
      if (doneRef.current) return; doneRef.current = true;
      if (oncePerSession) markSeen();
      if (cbRef.current) cbRef.current();
    };
    if (bypass) { finish(); return undefined; }

    const root = rootRef.current, canvas = canvasRef.current, scan = scanRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement, body = document.body;
    const prev = { h: html.style.overflow, b: body.style.overflow };
    html.style.overflow = 'hidden'; body.style.overflow = 'hidden';

    let cancelled = false, raf = 0, resizeTimer = 0, safety = 0, rmTimer = 0, img = null, start = 0, frame = 0;
    let S = null, base = null, zoom = null, hexLayer = null, frags = [], hexCols = [], Zt = 2;

    const layout = () => {
      const rect = root.getBoundingClientRect();
      const small = Math.min(rect.width, rect.height) < 640;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);
      const w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = w; canvas.height = h;
      const aspect = img.naturalHeight / img.naturalWidth;
      // Fill the screen: landscape scales toward full-bleed (capped so the eyelids stay in frame); portrait crops the faded edges.
      const iw = w < h ? w * 1.2 : Math.max(Math.min(w * 0.74, h * 1.45), Math.min(w, h * aspect ** -1 * 1.3));
      S = { w, h, dpr, cx: w / 2, cy: h / 2, iw, ih: iw * aspect, small };
      Zt = Math.max(1.9, (1.35 * Math.min(w, h)) / (IRIS_D * iw));
      const baseCols = clamp(Math.round(iw / (dpr * 4.4)), 110, 300);
      base = buildGrid(img, { x: 0, y: 0, w: 1, h: 1 }, baseCols, iw / baseCols, 11, true);
      const zx0 = 0, zw = 1;
      const maxCols = small ? 230 : 340;
      const zCols = clamp(Math.round(zw * iw * Zt / (dpr * 6)), 120, maxCols);
      zoom = buildGrid(img, { x: zx0, y: 0, w: zw, h: 1 }, zCols, Math.min(48, zw * iw * Zt / zCols), 29, true);
      hexLayer = document.createElement('canvas'); hexLayer.width = w; hexLayer.height = h;
      const fs = (small ? 10 : 12) * dpr;
      frags = FRAGMENTS.map((text, i) => ({
        text, x: (0.04 + hash(i * 17 + 3) * 0.62) * w, y: (0.08 + hash(i * 31 + 5) * 0.84) * h,
        t0: 40 + hash(i * 7) * 480, fs,
      }));
      hexCols = [];
      const colW = fs * 6.2, nCol = Math.floor(w / colW);
      for (let i = 0; i < nCol; i++) {
        const cx = i * colW + colW * 0.2, x0 = S.cx - iw / 2, x1 = S.cx + iw / 2;
        if (cx > x0 - colW * 0.5 && cx < x1) continue; // keep the centre clear for the eye
        hexCols.push({ x: cx, seed: i * 101, speed: 0.4 + hash(i) * 0.9 });
      }
    };

    const complete = () => { cancelAnimationFrame(raf); raf = 0; finish(); };

    const render = (now) => {
      raf = requestAnimationFrame(render);
      if (!S) return;
      frame++;
      const t = now - start, { w, h, dpr } = S;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);

      const eA = clamp(t / T.A);
      const rx0 = clamp((t - 450) / (T.B - 450)), reveal = (1 - Math.pow(1 - rx0, 1.7)) * 1.14;
      const eC = easeIO((t - T.B) / (T.C - T.B));
      const dN = clamp((t - T.C) / (T.D - T.C)), bell = Math.sin(Math.PI * dN) * (t >= T.C && t < T.D ? 1 : 0);
      const eE = clamp((t - T.D) / (T.E - T.D)), eEs = easeIO(eE);

      let z, fx, fy;
      if (t < T.B) { z = 1 + 0.04 * clamp((t - T.A) / (T.B - T.A)); fx = 0.5; fy = 0.5; }
      else if (t < T.C) { z = lerp(1.04, Zt, eC); fx = lerp(0.5, PUPIL.x, eC); fy = lerp(0.5, PUPIL.y, eC); }
      else if (t < T.D) { z = Zt * (1 + 0.1 * smooth(dN)); fx = PUPIL.x; fy = PUPIL.y; }
      else { z = Zt * 1.1 * (1 - 0.26 * eEs); fx = PUPIL.x; fy = PUPIL.y; }
      const cam = { z, fx, fy };

      // ambient hex columns (left/right of the eye) — drawn into a cached layer at ~10 fps, blitted every frame
      const hexA = 0.22 * smooth(t / 500) * (1 - smooth((t - T.C) / 400)) * (1 - eE);
      if (hexA > 0.01 && hexLayer) {
        if (frame % 6 === 1) {
          const hs = (S.small ? 9 : 11) * dpr, hx = hexLayer.getContext('2d');
          hx.clearRect(0, 0, w, h); hx.font = `${hs}px ${MONO}`; hx.textBaseline = 'top'; hx.fillStyle = '#d67828';
          for (const col of hexCols) {
            const off = (t * 0.02 * col.speed) % (hs * 1.5);
            for (let y = -off, k = 0; y < h; y += hs * 1.5, k++) {
              const v = (hash(col.seed + k + ((t * 0.004 * col.speed) | 0)) * 0xffff) | 0;
              hx.fillText(v.toString(16).toUpperCase().padStart(4, '0') + ' ' + (v & 255).toString(2).padStart(8, '0').slice(0, 5), col.x, y);
            }
          }
        }
        ctx.globalAlpha = hexA; ctx.drawImage(hexLayer, 0, 0); ctx.globalAlpha = 1;
      }

      // Phase A: code fragments + noise specks
      const fragA = 1 - 0.8 * smooth((t - T.A) / 900);
      if (fragA > 0.05 && eE < 1) {
        for (const f of frags) {
          const age = t - f.t0; if (age < 0) continue;
          const n = Math.min(f.text.length, (age / 22) | 0);
          const flick = 0.55 + 0.45 * hash((frame >> 2) + f.x | 0);
          ctx.font = `${f.fs}px ${MONO}`;
          ctx.fillStyle = `rgba(240,160,60,${0.75 * fragA * flick * (1 - eE)})`;
          ctx.fillText(f.text.slice(0, n) + (n < f.text.length ? '▌' : ''), f.x, f.y);
        }
      }
      const specks = (eA < 1 ? 110 : 40) * (1 - eE);
      ctx.fillStyle = 'rgba(240,150,50,0.35)';
      for (let i = 0; i < specks; i++) ctx.fillRect(Math.random() * w, Math.random() * h, dpr * (1 + Math.random()), dpr);

      // Eye layers (base grid fades into the finer zoom grid during the iris focus)
      const xf = smooth((eC - 0.12) / 0.5);
            const rin = reveal >= 1.0 ? 9 : Math.max(0, 0.09 + (reveal - 0.16) / 0.84 * 0.58 - 0.01);
      if (xf < 1) drawGrid(ctx, base, S, cam, { frame, reveal, rin, jit: 0, disp: 0, alpha: 1 - xf });
      if (xf > 0) {
        if (eE > 0) drawTiles(ctx, zoom, S, cam, eEs, xf);
        else drawGrid(ctx, zoom, S, cam, { frame, jit: bell, disp: 0, reveal: 2, rin: 9, alpha: xf });
      }

      // Phase D: controlled row-shift glitch (no full-screen flashing)
      if (bell > 0.02 && frame % 2 === 0) {
        const bands = 3 + ((bell * 6) | 0);
        for (let i = 0; i < bands; i++) {
          const bh = (6 + Math.random() * 38) * dpr, by = Math.random() * (h - bh);
          const dx = (Math.random() - 0.5) * 90 * dpr * bell;
          ctx.drawImage(canvas, 0, by, w, bh, dx, by, w, bh);
        }
      }

      // HUD
      const hudA = (1 - eE) * smooth(t / 400) * (1 - 0.7 * smooth((t - T.B) / 600));
      if (hudA > 0.02) {
        const f = (S.small ? 9 : 11) * dpr, pad = 16 * dpr, pct = Math.min(100, Math.round(clamp(reveal / 1.1) * 100));
        ctx.font = `${f}px ${MONO}`; ctx.fillStyle = `rgba(240,170,80,${0.8 * hudA})`; ctx.textBaseline = 'top';
        const lines = ['IRIS_SCAN  v2.6', `SRC  eye_0481.raw`, `BUF  ${base.cols}x${base.rows}`];
        lines.forEach((s, i) => ctx.fillText(s, pad, pad + i * f * 1.5));
        ctx.textBaseline = 'bottom';
        ctx.fillText(t < T.B ? `RECONSTRUCTING ${String(pct).padStart(3, '0')}%` : 'LOCK  IRIS  ■', pad, h - pad);
        ctx.textAlign = 'right'; ctx.fillText(`0x${(0x7f3a + (frame >> 3)).toString(16).toUpperCase()}`, w - pad, pad + 0);
        ctx.textAlign = 'left';
      }

      scan.style.opacity = (0.26 + 0.4 * bell).toFixed(3);
      root.style.opacity = eE > 0.3 ? (1 - smooth((eE - 0.3) / 0.7)).toFixed(3) : '1';
      if (eE > 0.35) root.style.pointerEvents = 'none';
      if (t >= T.D) fireReveal();
      if (t >= T.E) complete();
    };

    skipRef.current = () => { const now = performance.now(); if (now - start < T.D) start = now - T.D; };

    const onKey = (e) => { if (e.key === 'Escape' && skipRef.current) skipRef.current(); };
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (img && !cancelled) layout(); }, 150); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('keydown', onKey);

    loadImage(src).then((im) => {
      if (cancelled) return;
      img = im; layout();
      if (reduced) {
        // Reduced motion: one static, fully reconstructed frame, then a short fade. No zoom, glitch or flicker.
        ctx.fillStyle = BG; ctx.fillRect(0, 0, S.w, S.h);
        drawGrid(ctx, base, S, { z: 1, fx: 0.5, fy: 0.5 }, { frame: 0, jit: 0, disp: 0, reveal: 2, alpha: 1 });
        scan.style.opacity = '0.2';
        rmTimer = setTimeout(() => { fireReveal(); root.style.transition = 'opacity .25s linear'; root.style.opacity = '0'; rmTimer = setTimeout(finish, 280); }, 500);
        return;
      }
      start = performance.now(); raf = requestAnimationFrame(render);
    }).catch(() => { if (!cancelled) finish(); }); // never trap the visitor behind a broken asset

    safety = setTimeout(finish, 12000); // hard upper bound

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf); clearTimeout(resizeTimer); clearTimeout(safety); clearTimeout(rmTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prev.h; body.style.overflow = prev.b;
      base = zoom = img = hexLayer = null; skipRef.current = null;
    };
  }, [bypass, oncePerSession, src]);

  if (bypass) return null;
  return (
    <div ref={rootRef} className="eal-root" role="status" aria-label="Loading">
      <canvas ref={canvasRef} className="eal-canvas" aria-hidden="true" />
      <div ref={scanRef} className="eal-scan" aria-hidden="true" />
      <div className="eal-vignette" aria-hidden="true" />
      <button type="button" className="eal-skip" onClick={() => { if (skipRef.current) skipRef.current(); }}>SKIP ›</button>
    </div>
  );
}
