'use strict';

const [major, minor] = process.versions.node.split('.').map(Number);

if (major < 18 || major > 20) {
  console.warn(
    `[catalog-admin] Node.js ${process.versions.node} detected. ` +
      'This project is tested on Node 18.x–20.x (e.g. 20.14.0). ' +
      'Vite 8+ is not used; use the pinned Vite 5 stack in package.json.'
  );
}

if (major === 20 && minor < 19) {
  console.log(
    `[catalog-admin] Node ${process.versions.node} is supported (Vite 6.4.3, no Vite 8 / Rolldown).`
  );
}
