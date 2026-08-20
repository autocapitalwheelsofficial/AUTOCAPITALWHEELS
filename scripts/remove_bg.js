const { Jimp } = require('jimp');
const path = require('path');

async function removeBg() {
  // User's uploaded high-quality logo (JPG with white background)
  const inputPath  = 'C:\\Users\\Princ\\.gemini\\antigravity-ide\\brain\\91d585c3-1a7a-417e-b6de-d7bb7a623984\\media__1787264124175.jpg';
  const outputPath = path.join(__dirname, '..', 'public', 'logo.png');

  console.log('Reading logo from:', inputPath);
  const img = await Jimp.read(inputPath);

  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  console.log(`Image size: ${w}x${h}`);

  // Tight threshold: only truly near-white background (R,G,B >= 245)
  // Silver/metallic elements are typically 180-240, gold is ~200,170,50
  // Pure white background is 255,255,255
  const THRESHOLD = 245;

  const visited = new Uint8Array(w * h);
  const queue   = [];

  function isBackground(p4) {
    return data[p4] >= THRESHOLD && data[p4+1] >= THRESHOLD && data[p4+2] >= THRESHOLD;
  }

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    if (!isBackground(i * 4)) return;
    visited[i] = 1;
    queue.push([x, y]);
  }

  // Seed all 4 edges
  for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
  for (let y = 0; y < h; y++) { enqueue(0, y); enqueue(w - 1, y); }

  // BFS 8-connectivity
  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    enqueue(cx+1,cy); enqueue(cx-1,cy); enqueue(cx,cy+1); enqueue(cx,cy-1);
    enqueue(cx+1,cy+1); enqueue(cx-1,cy-1); enqueue(cx+1,cy-1); enqueue(cx-1,cy+1);
  }

  console.log('Background pixels found:', queue.length, 'of', w*h, 'total');
  for (let i = 0; i < w * h; i++) {
    if (visited[i]) data[i * 4 + 3] = 0;
  }

  img.autocrop({ tolerance: 0.002 });
  console.log('Saving transparent PNG to:', outputPath);
  await img.write(outputPath);
  console.log('Done! Final size:', img.bitmap.width, 'x', img.bitmap.height);
}

removeBg().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
