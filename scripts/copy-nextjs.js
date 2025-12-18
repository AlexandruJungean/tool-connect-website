const fs = require('fs');
const path = require('path');

const webAppDir = path.join(__dirname, '..', 'web-app');
const rootDir = path.join(__dirname, '..');

// Copy function that handles directories recursively
function copyDir(src, dest) {
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
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy .next directory to root for Netlify Next.js plugin
console.log('Copying Next.js build output to root...');

const nextDir = path.join(webAppDir, '.next');
const destNextDir = path.join(rootDir, '.next');

if (fs.existsSync(nextDir)) {
  copyDir(nextDir, destNextDir);
  console.log('.next directory copied successfully!');
} else {
  console.error('Error: .next directory not found in web-app/');
  process.exit(1);
}

// Copy next.config.ts to root
const nextConfigSrc = path.join(webAppDir, 'next.config.ts');
const nextConfigDest = path.join(rootDir, 'next.config.ts');
if (fs.existsSync(nextConfigSrc)) {
  fs.copyFileSync(nextConfigSrc, nextConfigDest);
  console.log('next.config.ts copied successfully!');
}

// Create a minimal package.json at root with Next.js info for the plugin
// (We'll merge with existing if needed)
console.log('Next.js files copied to root for Netlify plugin!');

