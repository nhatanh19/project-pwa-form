import fs from 'fs';
import zlib from 'zlib';

// Helper to construct a PNG image buffer with custom drawing
function createBrandPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // Color type: RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = isMaskable ? width * 0.48 : width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded squircle / circle
      let alpha = 255;
      if (!isMaskable) {
        // Rounded corner container
        const cornerRadius = size * 0.22;
        const qx = Math.max(0, Math.abs(dx) - (centerX - cornerRadius));
        const qy = Math.max(0, Math.abs(dy) - (centerY - cornerRadius));
        const cdist = Math.sqrt(qx * qx + qy * qy);
        if (cdist > cornerRadius) {
          alpha = 0;
        } else if (cdist > cornerRadius - 1.5) {
          alpha = Math.round((cornerRadius - cdist) / 1.5 * 255);
        }
      }

      if (alpha === 0) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Deep modern Slate -> Navy -> Emerald gradient
      const gradFactor = (x * 0.4 + y * 0.6) / size;
      let r = Math.round(15 * (1 - gradFactor) + 6 * gradFactor);
      let g = Math.round(23 * (1 - gradFactor) + 95 * gradFactor);
      let b = Math.round(42 * (1 - gradFactor) + 70 * gradFactor);

      // Draw Clipboard Outline in center
      const cbW = size * 0.46;
      const cbH = size * 0.54;
      const cbLeft = centerX - cbW / 2;
      const cbTop = centerY - cbH / 2 + size * 0.04;
      const cbRight = cbLeft + cbW;
      const cbBottom = cbTop + cbH;
      const cbBorder = Math.max(2, Math.round(size * 0.035));

      const inClip = x >= cbLeft && x <= cbRight && y >= cbTop && y <= cbBottom;
      const isClipBorder = inClip && (
        x < cbLeft + cbBorder || x > cbRight - cbBorder ||
        y < cbTop + cbBorder || y > cbBottom - cbBorder
      );

      // Inner Clipboard fill (Dark translucent navy)
      if (inClip && !isClipBorder) {
        r = Math.round(r * 0.5 + 30 * 0.5);
        g = Math.round(g * 0.5 + 41 * 0.5);
        b = Math.round(b * 0.5 + 59 * 0.5);
      }

      if (isClipBorder) {
        r = 255;
        g = 255;
        b = 255;
      }

      // Clip Header Top tab
      const tabW = size * 0.22;
      const tabH = size * 0.08;
      const tabLeft = centerX - tabW / 2;
      const tabTop = cbTop - tabH / 2;
      if (x >= tabLeft && x <= tabLeft + tabW && y >= tabTop && y <= tabTop + tabH) {
        r = 56;
        g = 189;
        b = 248; // Sky blue header
      }

      // Checkmarks and survey lines inside clipboard
      // Line 1: Checkmark (Emerald Green)
      const chk1Y = cbTop + cbH * 0.32;
      if (y >= chk1Y - size * 0.02 && y <= chk1Y + size * 0.02 && x >= cbLeft + size * 0.08 && x <= cbLeft + size * 0.16) {
        r = 52;
        g = 211;
        b = 153;
      }
      // Line 1 text line
      if (y >= chk1Y - size * 0.015 && y <= chk1Y + size * 0.015 && x >= cbLeft + size * 0.20 && x <= cbRight - size * 0.08) {
        r = 241;
        g = 245;
        b = 249;
      }

      // Line 2: Checkmark
      const chk2Y = cbTop + cbH * 0.56;
      if (y >= chk2Y - size * 0.02 && y <= chk2Y + size * 0.02 && x >= cbLeft + size * 0.08 && x <= cbLeft + size * 0.16) {
        r = 52;
        g = 211;
        b = 153;
      }
      // Line 2 text line
      if (y >= chk2Y - size * 0.015 && y <= chk2Y + size * 0.015 && x >= cbLeft + size * 0.20 && x <= cbRight - size * 0.12) {
        r = 203;
        g = 213;
        b = 225;
      }

      // Eco Badge (Bottom Right Leaf / Sparkle Orb)
      const ecoX = cbRight - size * 0.02;
      const ecoY = cbBottom - size * 0.02;
      const ecoDist = Math.sqrt((x - ecoX) * (x - ecoX) + (y - ecoY) * (y - ecoY));
      const ecoR = size * 0.16;
      if (ecoDist <= ecoR) {
        if (ecoDist > ecoR - size * 0.02) {
          r = 255;
          g = 255;
          b = 255; // White outer ring
        } else {
          r = 5;
          g = 150;
          b = 105; // Emerald 600
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = alpha;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate brand icons
const icon192 = createBrandPNG(192, false);
const icon512 = createBrandPNG(512, false);
const iconMaskable = createBrandPNG(512, true);
const appleTouch = createBrandPNG(180, false);

fs.writeFileSync('public/icons/icon-192x192.png', icon192);
fs.writeFileSync('public/icons/icon-512x512.png', icon512);
fs.writeFileSync('public/icons/maskable-icon-512x512.png', iconMaskable);
fs.writeFileSync('public/icons/apple-touch-icon.png', appleTouch);
fs.writeFileSync('public/favicon.ico', icon192);

console.log('Brand PWA Icons successfully generated!');
