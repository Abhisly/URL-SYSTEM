const { build } = require('vite');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function runBuild() {
  console.log('Starting Chrome Extension Build...');

  // Ensure icons exist, if not generate them
  const iconsDir = path.resolve(__dirname, 'icons');
  if (!fs.existsSync(iconsDir) || fs.readdirSync(iconsDir).length === 0) {
    console.log('Generating extension icons...');
    require('./generate-icons.js');
  }

  // 1. Build Popup
  console.log('\n[1/3] Building Popup UI...');
  await build({
    configFile: false,
    root: __dirname,
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      watch: isWatch ? {} : null,
      rollupOptions: {
        input: path.resolve(__dirname, 'popup.html'),
      },
    },
  });

  // 2. Build Background Service Worker
  console.log('\n[2/3] Building Background Service Worker...');
  await build({
    configFile: false,
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      watch: isWatch ? {} : null,
      lib: {
        entry: path.resolve(__dirname, 'src/background/background.ts'),
        formats: ['es'],
        fileName: () => 'background.js',
      },
    },
  });

  // 3. Build Content Script
  console.log('\n[3/3] Building Content Script...');
  await build({
    configFile: false,
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      watch: isWatch ? {} : null,
      lib: {
        entry: path.resolve(__dirname, 'src/content/content.ts'),
        formats: ['iife'],
        name: 'content',
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'content.css';
            return '[name].[ext]';
          },
        },
      },
    },
  });

  // 4. Copy Manifest and Icons to dist
  console.log('\n[4/4] Copying manifest and icons to dist...');
  fs.copyFileSync(
    path.resolve(__dirname, 'manifest.json'),
    path.resolve(__dirname, 'dist/manifest.json')
  );
  
  copyRecursiveSync(
    path.resolve(__dirname, 'icons'),
    path.resolve(__dirname, 'dist/icons')
  );

  console.log('\nExtension built successfully into d:\\URL SYSTEM\\chrome-extension\\dist');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
