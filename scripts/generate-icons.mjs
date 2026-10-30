// Generator ikon PWA tanpa dependensi. Jalankan: npm run icons
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const lerp = (a, b, t) => a + (b - a) * t;

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : clamp01(((px - x1) * dx + (py - y1) * dy) / lengthSq);
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/**
 * Satu sampel warna shuttlecock di bidang 0..1.
 * Semua lapisan opaque karena ikon PWA sebaiknya tanpa sudut transparan.
 */
function sample(x, y, scale) {
  // Latar: gradasi hijau lapangan.
  const t = clamp01(y);
  let r = lerp(24, 8, t);
  let g = lerp(158, 66, t);
  let b = lerp(96, 46, t);

  // Cahaya lembut diagonal.
  const glow = Math.max(
    0,
    1 - Math.hypot(x - 0.18, y - 0.05) / 0.72,
  );
  const glowAlpha = glow * glow * 0.22;
  r = lerp(r, 255, glowAlpha);
  g = lerp(g, 255, glowAlpha);
  b = lerp(b, 255, glowAlpha);

  // Garis lapangan tipis.
  const ringDistance = Math.abs(Math.hypot(x - 0.5, y - 0.5) - 0.355);
  if (ringDistance < 0.009) {
    const alpha = 0.16;
    r = lerp(r, 255, alpha);
    g = lerp(g, 255, alpha);
    b = lerp(b, 255, alpha);
  }

  const u = (x - 0.5) / scale + 0.5;
  const v = (y - 0.5) / scale + 0.5;

  // Sayap shuttlecock (trapesium lebar di atas, menyempit ke bawah).
  const skirtTop = 0.255;
  const skirtBottom = 0.605;
  let inSkirt = false;
  if (v >= skirtTop && v <= skirtBottom) {
    const progress = (v - skirtTop) / (skirtBottom - skirtTop);
    const halfWidth = lerp(0.172, 0.082, progress);
    inSkirt = Math.abs(u - 0.5) <= halfWidth;
  }

  if (inSkirt) {
    const alpha = 0.97;
    r = lerp(r, 255, alpha);
    g = lerp(g, 255, alpha);
    b = lerp(b, 255, alpha);

    // Serat bulu.
    for (const k of [-1.6, -0.55, 0.55, 1.6]) {
      const distance = distToSegment(
        u,
        v,
        0.5 + k * 0.036,
        skirtTop + 0.018,
        0.5 + k * 0.018,
        skirtBottom - 0.012,
      );
      if (distance < 0.0055) {
        const fiberAlpha = 0.34 * (1 - distance / 0.0055);
        r = lerp(r, 6, fiberAlpha);
        g = lerp(g, 60, fiberAlpha);
        b = lerp(b, 40, fiberAlpha);
      }
    }
  }

  // Kok (bola gabus).
  const corkDistance = Math.hypot(u - 0.5, v - 0.665);
  if (corkDistance <= 0.098) {
    const alpha = 0.99;
    r = lerp(r, 255, alpha);
    g = lerp(g, 255, alpha);
    b = lerp(b, 255, alpha);

    // Bayangan lembut di sisi bawah kok.
    const shade = clamp01((v - 0.69) / 0.075) * 0.18;
    r = lerp(r, 16, shade);
    g = lerp(g, 90, shade);
    b = lerp(b, 62, shade);
  }

  return [r, g, b, 255];
}

function render(size, { maskable = false } = {}) {
  const scale = maskable ? 0.8 : 0.98;
  const samples = 3;
  const rgba = Buffer.alloc(size * size * 4);

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const x = (px + (sx + 0.5) / samples) / size;
          const y = (py + (sy + 0.5) / samples) / size;
          const color = sample(x, y, scale);
          r += color[0];
          g += color[1];
          b += color[2];
        }
      }
      const total = samples * samples;
      const offset = (py * size + px) * 4;
      rgba[offset] = Math.round(r / total);
      rgba[offset + 1] = Math.round(g / total);
      rgba[offset + 2] = Math.round(b / total);
      rgba[offset + 3] = 255;
    }
  }

  return encodePng(size, size, rgba);
}

const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, {}],
];

for (const [name, size, options] of targets) {
  const file = resolve(outDir, name);
  writeFileSync(file, render(size, options));
  console.log(`created public/icons/${name}`);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Booking GOR Badminton">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a9e60" />
      <stop offset="1" stop-color="#08422c" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#bg)" />
  <circle cx="32" cy="32" r="24" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.2" />
  <path d="M21.5 15.5h21L37.5 37h-11z" fill="#ffffff" fill-opacity="0.97" />
  <g stroke="#063a26" stroke-opacity="0.38" stroke-width="1.2" stroke-linecap="round">
    <path d="M26.6 16.8 28.4 36" />
    <path d="M29.8 16.8 30.6 36" />
    <path d="M34.2 16.8 33.4 36" />
    <path d="M37.4 16.8 35.6 36" />
  </g>
  <circle cx="32" cy="43.5" r="6.3" fill="#ffffff" />
  <path d="M27 46.5a6.3 6.3 0 0 0 10 0 6.3 6.3 0 0 1-10 0Z" fill="#0b5f3d" fill-opacity="0.18" />
</svg>
`;

writeFileSync(resolve(root, 'public/favicon.svg'), favicon);
console.log('created public/favicon.svg');
