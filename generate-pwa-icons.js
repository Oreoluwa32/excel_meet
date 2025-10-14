// Simple PWA Icon Generator using HTML Canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [192, 512];
const outputDir = './public';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generateIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Calculate margins for maskable icons (20% safe zone)
  const margin = isMaskable ? size * 0.1 : 0;
  const circleSize = size - (margin * 2);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = circleSize / 2;

  // Draw gradient circle
  const gradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  gradient.addColorStop(0, '#10b981'); // Emerald green
  gradient.addColorStop(1, '#059669'); // Darker emerald

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw 'EM' text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.35}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EM', centerX, centerY);

  // Save the image
  const filename = isMaskable ? `icon-${size}-maskable.png` : `icon-${size}.png`;
  const filepath = `${outputDir}/${filename}`;
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✓ Created ${filename}`);
}

console.log('Generating PWA icons...\n');

try {
  // Generate regular and maskable icons
  sizes.forEach(size => {
    generateIcon(size, false);  // Regular icon
    generateIcon(size, true);   // Maskable icon
  });

  console.log('\n✓ All PWA icons generated successfully!');
  console.log('\nGenerated files:');
  console.log('  - icon-192.png');
  console.log('  - icon-192-maskable.png');
  console.log('  - icon-512.png');
  console.log('  - icon-512-maskable.png');
} catch (error) {
  console.error('Error generating icons:', error.message);
  process.exit(1);
}