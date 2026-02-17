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
