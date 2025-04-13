const Mocha = require('mocha');
const path = require('path');

require('ts-node/register'); // Register ts-node so TypeScript files can be executed

const mocha = new Mocha({
  require: 'ts-node/register', // Allows Mocha to run TypeScript files
});

// Add test files
mocha.addFile(path.join(__dirname, 'testcases', 'loginpage_tests.ts'));
mocha.addFile(path.join(__dirname, 'testcases', 'adminDashboard_tests.tsx'));

// Run the tests
mocha.run((failures) => {
  if (failures > 0) {
    console.log(`${failures} test(s) failed`);
  } else {
    console.log('All tests passed!');
  }
  process.exitCode = failures ? 1 : 0; // Exit with failure if tests fail
});

