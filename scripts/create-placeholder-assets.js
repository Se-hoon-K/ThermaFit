/**
 * Generates solid-colour placeholder PNGs for icon.png and splash.png.
 * Run once: node scripts/create-placeholder-assets.js
 * Then replace the files with your real brand design before publishing.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createSolidPNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const base = y * rowSize;
    // filter byte 0 = None
    for (let x = 0; x < width; x++) {
      const off = base + 1 + x * 3;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// ThermaFit brand dark background: #1a1a2e (26, 26, 46)
const [r, g, b] = [26, 26, 46];

console.log('Generating assets/icon.png  (1024×1024)…');
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createSolidPNG(1024, 1024, r, g, b));

console.log('Generating assets/splash.png (1242×2688)…');
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createSolidPNG(1242, 2688, r, g, b));

console.log('\nDone. Placeholder assets created in assets/');
console.log('Replace with your real design (keep same filenames) before publishing.');
