const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function main() {
  const inputPath = 'C:\\Users\\Princ\\.gemini\\antigravity-ide\\brain\\0ccd25d6-8fbf-4ccd-bb30-8e1075a36664\\media__1786477407542.jpg';
  const outputPath = path.join(__dirname, '..', 'public', 'logo.png');

  console.log('Loading image from:', inputPath);
  const image = await Jimp.read(inputPath);

  console.log('Processing pixels (removing white background)...');
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // If pixel is close to white, make it transparent
    if (r > 240 && g > 240 && b > 240) {
      this.bitmap.data[idx + 3] = 0; // Alpha = 0
    }
  });

  // Autocrop transparent borders
  image.autocrop();

  console.log('Saving processed logo to:', outputPath);
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  await image.write(outputPath);
  console.log('Done!');
}

main().catch(console.error);
