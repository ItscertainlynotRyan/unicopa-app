const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'assets', 'data', 'copaData.json');
try {
  const buf = fs.readFileSync(file);
  const asLatin1 = buf.toString('latin1');
  const fixed = Buffer.from(asLatin1, 'latin1').toString('utf8');
  fs.writeFileSync(file, fixed, 'utf8');
  console.log('Re-encoded file to UTF-8:', file);
} catch (e) {
  console.error('Error re-encoding file:', e);
  process.exit(1);
}
