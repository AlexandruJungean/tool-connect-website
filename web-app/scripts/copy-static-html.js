const fs = require('fs');
const path = require('path');

// Paths relative to web-app directory
const srcDir = path.join(__dirname, '..', '..', 'src');
const publicDir = path.join(__dirname, '..', 'public');

// Copy function that handles directories recursively
function copyDir(src, dest, skipExisting = false) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist, skipping...`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, skipExisting);
    } else {
      // Skip if file exists and skipExisting is true
      if (skipExisting && fs.existsSync(destPath)) {
        console.log(`  Skipping existing file: ${entry.name}`);
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying static HTML site to Next.js public folder...');
console.log(`From: ${srcDir}`);
console.log(`To: ${publicDir}`);

// Copy all static files, but don't overwrite existing files (like favicon.ico, logos)
copyDir(srcDir, publicDir, true);

console.log('Static HTML files copied successfully!');

