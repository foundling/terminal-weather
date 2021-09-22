// write version to file in src, so we can use rootDir in tsconfig when building.

const { writeFileSync } = require('fs');
const version = require('../package.json').version;
writeFileSync('./src/version.json', `{ "version": "${version}" }`);
