/**
 * Optimize images in assets: resize (max 1400px wide) and compress JPEG.
 * Run: node scripts/optimize-images.js
 */
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const MAX_WIDTH = 1400;
const JPEG_QUALITY = 78;

async function optimize() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Install sharp first: npm install sharp --save-dev');
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  if (files.length === 0) {
    console.log('No images found in assets/');
    return;
  }

  console.log(`Optimizing ${files.length} images (max width ${MAX_WIDTH}px, quality ${JPEG_QUALITY})...\n`);
  for (const file of files) {
    const inputPath = path.join(assetsDir, file);
    const ext = path.extname(file).toLowerCase();
    const before = fs.statSync(inputPath).size;
    try {
      let pipeline = sharp(inputPath);
      const meta = await pipeline.metadata();
      const needResize = meta.width > MAX_WIDTH;
      if (needResize) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }
      const tempPath = path.join(assetsDir, '.tmp-' + file);
      await pipeline
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(tempPath);
      const after = fs.statSync(tempPath).size;
      fs.renameSync(tempPath, inputPath);
      const pct = before ? ((1 - after / before) * 100).toFixed(1) : 0;
      console.log(`${file}: ${(before / 1024).toFixed(1)} KB → ${(after / 1024).toFixed(1)} KB (${pct}% smaller)`);
    } catch (err) {
      console.error(`${file}: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

optimize();
