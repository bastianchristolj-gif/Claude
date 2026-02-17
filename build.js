/* ============================================
   NVIDIA Profile Manager Pro - Build Script
   Bundles + minifies frontend for production
   Usage:
     node build.js              → frontend build only
     node build.js --package    → frontend build + electron-builder
   ============================================ */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST = path.join(__dirname, 'dist');
const ASSETS = path.join(__dirname, 'assets');

// ============================================
// Icon Generation
// Generates assets/icon.ico if missing
// ============================================

function ensureIcons() {
    if (!fs.existsSync(ASSETS)) {
        fs.mkdirSync(ASSETS, { recursive: true });
    }

    const icoPath = path.join(ASSETS, 'icon.ico');
    const pngPath = path.join(ASSETS, 'icon.png');

    if (fs.existsSync(icoPath)) return;

    console.log('  Generating icon.ico...');

    // If a PNG exists, wrap it in an ICO container
    if (fs.existsSync(pngPath)) {
        const pngData = fs.readFileSync(pngPath);
        const ico = createIcoFromPng(pngData);
        fs.writeFileSync(icoPath, ico);
        console.log('  Created icon.ico from icon.png');
        return;
    }

    // Generate a placeholder 48x48 NVIDIA-green ICO with BMP format
    const ico = generatePlaceholderIco();
    fs.writeFileSync(icoPath, ico);

    // Also generate a minimal PNG placeholder if missing
    if (!fs.existsSync(pngPath)) {
        const png = generatePlaceholderPng();
        fs.writeFileSync(pngPath, png);
    }
    console.log('  Created placeholder icon files');
}

function createIcoFromPng(pngData) {
    // Wrap existing PNG data in an ICO container
    // ICO Header (6 bytes) + 1 Directory Entry (16 bytes) + PNG data
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);        // Reserved
    header.writeUInt16LE(1, 2);        // Type: ICO
    header.writeUInt16LE(1, 4);        // Count: 1 image

    const dir = Buffer.alloc(16);
    dir.writeUInt8(0, 0);              // Width (0 = 256)
    dir.writeUInt8(0, 1);              // Height (0 = 256)
    dir.writeUInt8(0, 2);              // Palette
    dir.writeUInt8(0, 3);              // Reserved
    dir.writeUInt16LE(1, 4);           // Color planes
    dir.writeUInt16LE(32, 6);          // Bits per pixel
    dir.writeUInt32LE(pngData.length, 8);  // Image data size
    dir.writeUInt32LE(22, 12);         // Offset to image data

    return Buffer.concat([header, dir, pngData]);
}

function generatePlaceholderIco() {
    // Generate a 48x48 BMP-format ICO with NVIDIA green
    const W = 48, H = 48;
    const bmpHeaderSize = 40;
    const pixelSize = W * H * 4;
    const andMaskRowBytes = Math.ceil(W / 8);
    const andMaskRowPadded = Math.ceil(andMaskRowBytes / 4) * 4;
    const andMaskSize = andMaskRowPadded * H;
    const imageSize = bmpHeaderSize + pixelSize + andMaskSize;

    // ICO Header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);

    // Directory
    const dir = Buffer.alloc(16);
    dir.writeUInt8(W, 0);
    dir.writeUInt8(H, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(imageSize, 8);
    dir.writeUInt32LE(22, 12);

    // BMP Info Header
    const bmp = Buffer.alloc(bmpHeaderSize);
    bmp.writeUInt32LE(bmpHeaderSize, 0);
    bmp.writeInt32LE(W, 4);
    bmp.writeInt32LE(H * 2, 8); // Doubled for ICO
    bmp.writeUInt16LE(1, 12);
    bmp.writeUInt16LE(32, 14);
    bmp.writeUInt32LE(0, 16);
    bmp.writeUInt32LE(pixelSize + andMaskSize, 20);

    // Pixel data (BGRA, bottom-up rows)
    const pixels = Buffer.alloc(pixelSize);
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const off = (y * W + x) * 4;
            const border = x < 2 || x >= W - 2 || y < 2 || y >= H - 2;
            if (border) {
                // Dark border: #2D5A00
                pixels.writeUInt8(0x00, off);     // B
                pixels.writeUInt8(0x5A, off + 1); // G
                pixels.writeUInt8(0x2D, off + 2); // R
            } else {
                // NVIDIA Green: #76B900
                pixels.writeUInt8(0x00, off);     // B
                pixels.writeUInt8(0xB9, off + 1); // G
                pixels.writeUInt8(0x76, off + 2); // R
            }
            pixels.writeUInt8(0xFF, off + 3); // A
        }
    }

    // AND mask (all opaque = 0)
    const andMask = Buffer.alloc(andMaskSize, 0);

    return Buffer.concat([header, dir, bmp, pixels, andMask]);
}

function generatePlaceholderPng() {
    // Minimal valid 1x1 green PNG
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    function crc32(buf) {
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < buf.length; i++) {
            crc ^= buf[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function chunk(type, data) {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length, 0);
        const typeAndData = Buffer.concat([Buffer.from(type), data]);
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(crc32(typeAndData), 0);
        return Buffer.concat([len, typeAndData, crc]);
    }

    // IHDR: 1x1, 8-bit RGB
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(1, 0);  // width
    ihdr.writeUInt32BE(1, 4);  // height
    ihdr.writeUInt8(8, 8);     // bit depth
    ihdr.writeUInt8(2, 9);     // color type (RGB)

    // IDAT: filter byte (0) + RGB pixel (0x76, 0xB9, 0x00)
    const raw = Buffer.from([0, 0x76, 0xB9, 0x00]);
    // Deflate with zlib wrapper
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(raw);

    return Buffer.concat([
        pngSignature,
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

const JS_FILES = [
    'js/data.js',
    'js/api.js',
    'js/app.js'
];

const CSS_FILES = [
    'css/styles.css',
    'css/components.css',
    'css/panels.css'
];

async function build() {
    console.log('\n  Building NVIDIA Profile Manager Pro...\n');
    const start = Date.now();

    // Ensure icon files exist before build
    ensureIcons();

    // Clean dist/
    if (fs.existsSync(DIST)) {
        fs.rmSync(DIST, { recursive: true });
    }
    fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
    fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });

    // ---- JS Bundle ----
    const jsSourceParts = JS_FILES.map(f => fs.readFileSync(f, 'utf8'));
    const jsConcat = jsSourceParts.join('\n;\n');
    const jsSizeBefore = Buffer.byteLength(jsConcat, 'utf8');

    const jsResult = await esbuild.transform(jsConcat, {
        minify: true,
        target: 'es2020',
        loader: 'js'
    });

    fs.writeFileSync(path.join(DIST, 'js/bundle.min.js'), jsResult.code);
    const jsSizeAfter = Buffer.byteLength(jsResult.code, 'utf8');

    // ---- CSS Bundle ----
    const cssParts = CSS_FILES.map(f => fs.readFileSync(f, 'utf8'));
    const cssConcat = cssParts.join('\n');
    const cssSizeBefore = Buffer.byteLength(cssConcat, 'utf8');

    const cssResult = await esbuild.transform(cssConcat, {
        minify: true,
        loader: 'css'
    });

    fs.writeFileSync(path.join(DIST, 'css/bundle.min.css'), cssResult.code);
    const cssSizeAfter = Buffer.byteLength(cssResult.code, 'utf8');

    // ---- HTML ----
    let html = fs.readFileSync('index.html', 'utf8');

    // Replace 3 CSS links with single bundled one
    html = html.replace(
        /\s*<link rel="stylesheet" href="css\/styles\.css">\s*\n\s*<link rel="stylesheet" href="css\/components\.css">\s*\n\s*<link rel="stylesheet" href="css\/panels\.css">/,
        '\n    <link rel="stylesheet" href="css/bundle.min.css">'
    );

    // Replace 3 script tags with single bundled one
    html = html.replace(
        /\s*<script src="js\/data\.js"><\/script>\s*\n\s*<script src="js\/api\.js"><\/script>\s*\n\s*<script src="js\/app\.js"><\/script>/,
        '\n    <script src="js/bundle.min.js"></script>'
    );

    const htmlSizeBefore = Buffer.byteLength(fs.readFileSync('index.html', 'utf8'), 'utf8');

    // Minify HTML (simple: collapse whitespace between tags)
    html = html
        .replace(/<!--[\s\S]*?-->/g, '')        // remove comments
        .replace(/\n\s*\n/g, '\n')               // collapse blank lines
        .replace(/^\s+/gm, '');                   // trim leading whitespace

    fs.writeFileSync(path.join(DIST, 'index.html'), html);
    const htmlSizeAfter = Buffer.byteLength(html, 'utf8');

    // ---- Summary ----
    const totalBefore = jsSizeBefore + cssSizeBefore + htmlSizeBefore;
    const totalAfter = jsSizeAfter + cssSizeAfter + htmlSizeAfter;
    const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);

    const kb = (n) => (n / 1024).toFixed(1) + ' KB';

    console.log('  File                     Before      After       Saved');
    console.log('  ' + '-'.repeat(60));
    console.log(`  js/bundle.min.js         ${kb(jsSizeBefore).padEnd(12)}${kb(jsSizeAfter).padEnd(12)}${((1 - jsSizeAfter/jsSizeBefore)*100).toFixed(0)}%`);
    console.log(`  css/bundle.min.css       ${kb(cssSizeBefore).padEnd(12)}${kb(cssSizeAfter).padEnd(12)}${((1 - cssSizeAfter/cssSizeBefore)*100).toFixed(0)}%`);
    console.log(`  index.html               ${kb(htmlSizeBefore).padEnd(12)}${kb(htmlSizeAfter).padEnd(12)}${((1 - htmlSizeAfter/htmlSizeBefore)*100).toFixed(0)}%`);
    console.log('  ' + '-'.repeat(60));
    console.log(`  TOTAL                    ${kb(totalBefore).padEnd(12)}${kb(totalAfter).padEnd(12)}${pct}%`);
    console.log(`\n  Build completed in ${Date.now() - start}ms`);
    console.log(`  Output: ${DIST}/\n`);
}

async function packageElectron() {
    const args = process.argv.slice(2);
    const shouldPackage = args.includes('--package');
    const platform = args.includes('--linux') ? '--linux' : '--win';

    if (shouldPackage) {
        console.log('\n  Packaging Electron app...\n');
        try {
            execSync(`npx electron-builder ${platform}`, {
                stdio: 'inherit',
                cwd: __dirname
            });
            console.log('\n  Electron packaging complete!');
            console.log(`  Output: ${path.join(__dirname, 'release')}/\n`);
        } catch (err) {
            console.error('  Electron packaging failed:', err.message);
            process.exit(1);
        }
    }
}

build()
    .then(() => packageElectron())
    .catch(err => {
        console.error('Build failed:', err);
        process.exit(1);
    });
