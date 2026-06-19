/**
 * build-zip.mjs - Empaqueta la extension en un ZIP listo para Chrome Web Store.
 *
 * Genera dist/search-engine-converter-v<version>.zip con solo el contenido de
 * extension/ (sin node_modules, tests, .git, etc.).
 *
 * Uso: npm run build
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const extensionDir = join(root, 'extension');
const distDir = join(root, 'dist');

function readVersion() {
  const manifest = JSON.parse(readFileSync(join(extensionDir, 'manifest.json'), 'utf8'));
  return manifest.version;
}

function walk(dir, base = dir) {
  const entries = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      entries.push(...walk(fullPath, base));
    } else {
      entries.push({ path: fullPath, rel: relative(base, fullPath) });
    }
  }
  return entries;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function localFileHeader(name, crc, uncompressedSize) {
  const nameBytes = Buffer.from(name, 'utf8');
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  /* Metodo 0 = STORE (sin compresion) para evitar dependencias de zlib */
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(uncompressedSize, 18);
  header.writeUInt32LE(uncompressedSize, 22);
  header.writeUInt16LE(nameBytes.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, nameBytes]);
}

function centralDirHeader(name, crc, uncompressedSize, offset) {
  const nameBytes = Buffer.from(name, 'utf8');
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(uncompressedSize, 20);
  header.writeUInt32LE(uncompressedSize, 24);
  header.writeUInt16LE(nameBytes.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, nameBytes]);
}

function endCentralDir(numEntries, centralDirSize, centralDirOffset) {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(0x06054b50, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(numEntries, 8);
  record.writeUInt16LE(numEntries, 10);
  record.writeUInt32LE(centralDirSize, 12);
  record.writeUInt32LE(centralDirOffset, 16);
  record.writeUInt16LE(0, 20);
  return record;
}

const version = readVersion();
mkdirSync(distDir, { recursive: true });
const outPath = join(distDir, `search-engine-converter-v${version}.zip`);
const files = walk(extensionDir);

const chunks = [];
const centralRecords = [];
let offset = 0;

for (const file of files) {
  const content = readFileSync(file.path);
  const crc = crc32(content);
  const name = file.rel.split(sep).join('/');

  chunks.push(localFileHeader(name, crc, content.length));
  chunks.push(content);

  centralRecords.push(centralDirHeader(name, crc, content.length, offset));
  offset += 30 + Buffer.from(name, 'utf8').length + content.length;
}

const centralDir = Buffer.concat(centralRecords);
chunks.push(centralDir);
chunks.push(endCentralDir(files.length, centralDir.length, offset));

const zip = Buffer.concat(chunks);
writeFileSync(outPath, zip);

console.log(`Built ${relative(root, outPath)} (${(zip.length / 1024).toFixed(1)} KB, ${files.length} files)`);