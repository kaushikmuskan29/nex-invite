const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[n] = c;
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function writePng(filename, width, height, rgbaBuffer) {
  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    buf.writeUInt32BE(crc32(buf.subarray(4, 8 + len)), 8 + len);
    return buf;
  }
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    rgbaBuffer.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  fs.writeFileSync(filename, Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', zlib.deflateSync(raw)), makeChunk('IEND', Buffer.alloc(0))]));
}

function readPng(filename) {
  const buf = fs.readFileSync(filename);
  let pos = 8, idat = [], width = 0, height = 0;
  while (pos < buf.length) {
    let len = buf.readUInt32BE(pos);
    let type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') { width = buf.readUInt32BE(pos + 8); height = buf.readUInt32BE(pos + 12); }
    else if (type === 'IDAT') idat.push(buf.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  let raw = zlib.inflateSync(Buffer.concat(idat));
  let bpp = 4, stride = 1 + width * bpp;
  let prevRow = Buffer.alloc(width * bpp);
  let pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    let filter = raw[y * stride];
    let row = Buffer.alloc(width * bpp);
    for (let x = 0; x < width * bpp; x++) {
      let byte = raw[y * stride + 1 + x];
      let a = x >= bpp ? row[x - bpp] : 0, b = prevRow[x], c = x >= bpp ? prevRow[x - bpp] : 0;
      let val = 0;
      if (filter === 0) val = byte;
      else if (filter === 1) val = (byte + a) & 0xff;
      else if (filter === 2) val = (byte + b) & 0xff;
      else if (filter === 3) val = (byte + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        let p = a + b - c;
        let pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        val = (byte + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c))) & 0xff;
      }
      row[x] = val;
      pixels[(y * width * bpp) + x] = val;
    }
    prevRow = row;
  }
  return { width, height, pixels };
}

module.exports = { crc32, writePng, readPng };
