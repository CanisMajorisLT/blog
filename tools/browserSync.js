const browserSync = require('browser-sync');
const path = require('path');

const dist = path.join(__dirname, '../dist');

export function initServerOnDist() {
    const bs = browserSync.create('Dev server');
    bs.init({
        server: dist
    });

    return bs;
}
