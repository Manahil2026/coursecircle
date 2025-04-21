#!/usr/bin/env node

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
});
require('tsconfig-paths').register();
const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const mocha = new Mocha({
  ui: 'bdd',
  color: true,
  timeout: 5000,
  extension: ['ts', 'tsx'],
});
const testDir = path.join(__dirname, 'testcases');
fs.readdirSync(testDir)
  .filter(f => f.match(/(_tests|\.spec)\.tsx?$/))
  .forEach(file => mocha.addFile(path.join(testDir, file)));
mocha.run(failures => {
  process.exitCode = failures ? 1 : 0;
});
