import GIFEncoder from 'gif-encoder-2';
import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');
const OUT = path.join(REPO, 'docs', 'demo.gif');

const TMP = (process.env.TEMP || process.env.TMP || 'C:\\Users\\nikol\\AppData\\Local\\Temp').replace(/\\/g, '/');

// Frame list: [path, delay_ms]
// Longer delay on key states so viewers can see what happened
const frames = [
  [`${TMP}/frame_00.png`, 1200],  // initial state — pause
  [`${TMP}/frame_01.png`, 1000],  // question typed
  [`${TMP}/frame_02.png`,   80],  // send clicked
  [`${TMP}/frame_03.png`,   80],
  [`${TMP}/frame_04.png`,   80],
  [`${TMP}/frame_05.png`,   80],  // signal lines drawing
  [`${TMP}/frame_06.png`,   80],
  [`${TMP}/frame_07.png`,  100],  // considering state
  [`${TMP}/frame_08.png`,  100],
  [`${TMP}/frame_09.png`,  120],  // decided
  [`${TMP}/frame_10.png`,  150],
  [`${TMP}/frame_11.png`,  150],
  [`${TMP}/frame_12.png`,  150],  // typing begins
  [`${TMP}/frame_13.png`,  150],
  [`${TMP}/frame_14.png`,  150],
  [`${TMP}/frame_15.png`,  150],
  [`${TMP}/frame_16.png`,  150],
  [`${TMP}/frame_17.png`, 2000],  // final answer — long pause before loop
];

async function run() {
  // Load first frame to get dimensions
  const first = await Jimp.read(frames[0][0].replace(/\\/g, '/'));
  const W = first.bitmap.width;
  const H = first.bitmap.height;

  // Scale down for reasonable GIF size (720p wide → 640px wide)
  const scale = Math.min(1, 960 / W);
  const w = Math.round(W * scale);
  const h = Math.round(H * scale);

  console.log(`Encoding ${frames.length} frames at ${w}×${h}…`);

  const encoder = new GIFEncoder(w, h, 'octree', true);
  encoder.setDelay(100);
  encoder.setQuality(12);
  encoder.setRepeat(0); // loop forever

  const stream = encoder.createReadStream();
  const writeStream = fs.createWriteStream(OUT);
  stream.pipe(writeStream);

  encoder.start();

  for (let i = 0; i < frames.length; i++) {
    const [framePath, delay] = frames[i];
    process.stdout.write(`  frame ${String(i).padStart(2,'0')} (${delay}ms)… `);

    try {
      const img = await Jimp.read(framePath);
      img.resize({ w, h });
      const rgba = img.bitmap.data; // raw RGBA buffer
      encoder.setDelay(delay);
      encoder.addFrame(rgba);
      console.log('ok');
    } catch (e) {
      console.log(`SKIP (${e.message})`);
    }
  }

  encoder.finish();
  await new Promise(r => writeStream.on('finish', r));

  const bytes = fs.statSync(OUT).size;
  console.log(`\nWrote ${OUT}`);
  console.log(`Size: ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

run().catch(e => { console.error(e); process.exit(1); });
