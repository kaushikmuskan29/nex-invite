const fs = require('fs');
const { readPng, writePng } = require('./png-utils');

const { width, height, pixels } = readPng('public/assets/parchment-scroll-envelope.png');
console.log('Read image:', width, height);

// Function to determine if a pixel belongs to the background velvet
function isVelvet(r, g, b) {
  // Brightest red in velvet is 20, while parchment R is > 60 and wax seal R > 32
  if (r <= 24) return true;
  // Velvet is distinctly blue-tinted: B > R or (B > 18 and R < 35)
  if (b >= r) return true;
  if (r < 36 && b > 18) return true;
  if (r < 30 && g < 30 && b > 14) return true;
  return false;
}

// 1. Identify pure background from exterior edges using flood fill
const isBg = new Uint8Array(width * height);
const queue = [];

// Seed all perimeter pixels that are velvet
for (let x = 0; x < width; x++) {
  const tIdx = (0 * width + x) * 4;
  if (isVelvet(pixels[tIdx], pixels[tIdx + 1], pixels[tIdx + 2])) {
    isBg[0 * width + x] = 1;
    queue.push(x, 0);
  }
  const bIdx = ((height - 1) * width + x) * 4;
  if (isVelvet(pixels[bIdx], pixels[bIdx + 1], pixels[bIdx + 2])) {
    isBg[(height - 1) * width + x] = 1;
    queue.push(x, height - 1);
  }
}
for (let y = 0; y < height; y++) {
  const lIdx = (y * width + 0) * 4;
  if (!isBg[y * width + 0] && isVelvet(pixels[lIdx], pixels[lIdx + 1], pixels[lIdx + 2])) {
    isBg[y * width + 0] = 1;
    queue.push(0, y);
  }
  const rIdx = (y * width + (width - 1)) * 4;
  if (!isBg[y * width + (width - 1)] && isVelvet(pixels[rIdx], pixels[rIdx + 1], pixels[rIdx + 2])) {
    isBg[y * width + (width - 1)] = 1;
    queue.push(width - 1, y);
  }
}

let qIdx = 0;
while (qIdx < queue.length) {
  const cx = queue[qIdx++];
  const cy = queue[qIdx++];
  const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
  for (let i = 0; i < 4; i++) {
    const nx = neighbors[i][0];
    const ny = neighbors[i][1];
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nIdx = ny * width + nx;
      if (!isBg[nIdx]) {
        const pIdx = nIdx * 4;
        if (isVelvet(pixels[pIdx], pixels[pIdx + 1], pixels[pIdx + 2])) {
          isBg[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

// 2. Output buffer
const out = Buffer.alloc(width * height * 4);
let minX = width, maxX = 0, minY = height, maxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const nIdx = y * width + x;

    if (isBg[nIdx]) {
      out[idx] = 0;
      out[idx + 1] = 0;
      out[idx + 2] = 0;
      out[idx + 3] = 0;
    } else {
      out[idx] = pixels[idx];
      out[idx + 1] = pixels[idx + 1];
      out[idx + 2] = pixels[idx + 2];

      // Soft anti-aliasing near background
      let bgCount = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && isBg[ny * width + nx]) {
            bgCount++;
          }
        }
      }

      if (bgCount > 0) {
        const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        out[idx + 3] = Math.min(255, Math.max(0, Math.floor((1 - bgCount / 10) * Math.min(255, brightness * 2.5))));
      } else {
        out[idx + 3] = 255;
      }

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log('Scroll bounding box:', { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
writePng('public/assets/authentic-scroll.png', width, height, out);

// Crop tightly
const pad = 2;
const cropX = Math.max(0, minX - pad);
const cropY = Math.max(0, minY - pad);
const cropW = Math.min(width - cropX, maxX - minX + 1 + pad * 2);
const cropH = Math.min(height - cropY, maxY - minY + 1 + pad * 2);

const cropped = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  const srcRow = (cropY + y) * width * 4 + cropX * 4;
  const dstRow = y * cropW * 4;
  out.copy(cropped, dstRow, srcRow, srcRow + cropW * 4);
}
writePng('public/assets/authentic-scroll-cropped.png', cropW, cropH, cropped);

// Extract wax seal:
const sealOrigX = 502;
const sealOrigY = 246;
const sealRadius = 78;
const sealW = sealRadius * 2;
const sealH = sealRadius * 2;
const sealBuf = Buffer.alloc(sealW * sealH * 4);
const sealLeftBuf = Buffer.alloc(sealW * sealH * 4);
const sealRightBuf = Buffer.alloc(sealW * sealH * 4);

for (let y = 0; y < sealH; y++) {
  for (let x = 0; x < sealW; x++) {
    const srcX = sealOrigX - sealRadius + x;
    const srcY = sealOrigY - sealRadius + y;
    const dstIdx = (y * sealW + x) * 4;
    const dx = x - sealRadius;
    const dy = y - sealRadius;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
      const srcIdx = (srcY * width + srcX) * 4;
      const r = pixels[srcIdx], g = pixels[srcIdx + 1], b = pixels[srcIdx + 2];

      if (dist <= 70) {
        sealBuf[dstIdx] = r;
        sealBuf[dstIdx + 1] = g;
        sealBuf[dstIdx + 2] = b;
        sealBuf[dstIdx + 3] = dist > 66 ? Math.floor((70 - dist) / 4 * 255) : 255;

        const jaggedX = Math.sin(y * 0.35) * 5;
        if (dx < jaggedX) {
          sealLeftBuf[dstIdx] = r;
          sealLeftBuf[dstIdx + 1] = g;
          sealLeftBuf[dstIdx + 2] = b;
          sealLeftBuf[dstIdx + 3] = sealBuf[dstIdx + 3];
        } else {
          sealRightBuf[dstIdx] = r;
          sealRightBuf[dstIdx + 1] = g;
          sealRightBuf[dstIdx + 2] = b;
          sealRightBuf[dstIdx + 3] = sealBuf[dstIdx + 3];
        }
      }
    }
  }
}

writePng('public/assets/authentic-seal.png', sealW, sealH, sealBuf);
writePng('public/assets/authentic-seal-l.png', sealW, sealH, sealLeftBuf);
writePng('public/assets/authentic-seal-r.png', sealW, sealH, sealRightBuf);
console.log('Saved all authentic scroll assets!');
