#!/usr/bin/env node
/**
 * Propaga PORRA_BUILD de js/version.js a index.html (?v=) y manifest.json.
 * Uso: node scripts/sync-version.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const versionJs = fs.readFileSync(path.join(root, 'js/version.js'), 'utf8');
const m = versionJs.match(/PORRA_BUILD\s*=\s*['"](\d+)['"]/);
if (!m) {
  console.error('✗ No se encontró PORRA_BUILD en js/version.js');
  process.exit(1);
}
const v = m[1];

const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/\?v=\d+/g, `?v=${v}`);
fs.writeFileSync(htmlPath, html);

const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.start_url = `/?v=${v}`;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`✓ Versión ${v} aplicada a index.html y manifest.json`);
