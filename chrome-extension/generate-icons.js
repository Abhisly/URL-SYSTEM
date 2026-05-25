const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function makeChunk(type, data) {
  const buf = Buffer.alloc(12 + data.length);
  buf.writeUInt32BE(data.length, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crcInput = buf.slice(4, 8 + data.length);
  buf.writeUInt32BE(crc32(crcInput), 8 + data.length);
  return buf;
}

function createPng(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Generate pixels (draw a glowing shield/circle)
  const pixelData = Buffer.alloc(height * (width * 4 + 1));
  let pos = 0;
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.4;
  
  for (let y = 0; y < height; y++) {
    pixelData[pos++] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      let rVal = 99; // Purple theme: #6366f1 -> 99, 102, 241
      let gVal = 102;
      let bVal = 241;
      let aVal = 0;
      
      if (dist < r) {
        // Solid circle with gradient
        const factor = (r - dist) / r;
        rVal = Math.round(99 + factor * 50);
        gVal = Math.round(102 + factor * 50);
        bVal = 255;
        aVal = 255;
      } else if (dist < r + 2) {
        // Glowing outline
        const factor = (2 - (dist - r)) / 2;
        aVal = Math.round(factor * 150);
      }
      
      pixelData[pos++] = rVal;
      pixelData[pos++] = gVal;
      pixelData[pos++] = bVal;
      pixelData[pos++] = aVal;
    }
  }

  const compressed = zlib.deflateSync(pixelData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-16.png'), createPng(16, 16));
fs.writeFileSync(path.join(iconsDir, 'icon-48.png'), createPng(48, 48));
fs.writeFileSync(path.join(iconsDir, 'icon-128.png'), createPng(128, 128));
console.log('Icons generated successfully in d:\\URL SYSTEM\\chrome-extension\\icons');
