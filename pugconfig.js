/**
 * This custom script is used to build/copy website sources for distribution:
 * - copy specific assets such as style sheets or scripts (either 3rd party or custom ones)
 * - compile specific pug templates and render to dist path
 */

const watch = process.argv.indexOf('--watch') > 1;

const fs = require('fs');
const path = require('path');
const copy = require('./copy.js');
const pug = require('pug');

const websiteDir = '.';
const distDir = './_site';

const entries = ['index.pug'];

const assets = [
    [websiteDir, distDir, ['css/*.css', 'js/*.js', 'img/*.{svg,png}', 'fonts/*', '*.{svg,png,ico,xml,json}'], ["package.json", "package-lock.json"], false],
    [websiteDir + '/docs', distDir + '/docs', ['*/*'], [""], false]
];

var build_pending = false;

function build() {
    process.env.NODE_ENV = 'production';

    assets.forEach((asset) => copy(asset[0], asset[1], asset[2], asset[3], asset[4]));

    entries.forEach((entry) => {
        const src = path.join(websiteDir, entry);
        const dst = path.join(distDir, path.basename(entry, path.extname(entry)) + '.html');

        if (!fs.existsSync(src)) {
            console.log('file not found:', entry);
            return;
        }

        const html = pug.renderFile(src);
        fs.writeFileSync(dst, html);

        console.log('emitted:', dst);
    });

    build_pending = false;
}

build(); // trigger initial build

if (watch) {
    fs.watch(websiteDir, { recursive: true }, function () {
        if (build_pending) {
            return;
        }

        build_pending = true;
        setTimeout(build, 100);
    });
}
