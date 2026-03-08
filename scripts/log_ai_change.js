const fs = require('fs');
const path = require('path');

// Usage: node scripts/log_ai_change.js "Title" "Summary" "Details"
const [,, title, summary, details] = process.argv;
if (!title || !summary) {
  console.error('Usage: node scripts/log_ai_change.js "Title" "Summary" "Details(optional)"');
  process.exit(2);
}

const file = path.join(__dirname, '..', 'public', 'memory-bank', 'ai_changes.json');
try {
  let arr = [];
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, 'utf8');
    arr = JSON.parse(raw || '[]');
  }

  const ts = new Date().toISOString();
  const id = ts.replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2,8);
  const entry = { id, timestamp: ts, title, summary, details: details || '', by: 'AI', tags: ['auto'] };

  arr.unshift(entry);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
  console.log('Appended AI change:', id);
} catch (e) {
  console.error('Failed to append AI change:', e.message);
  process.exit(1);
}
