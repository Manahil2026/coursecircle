const Mocha = require('mocha');
const path = require('path');


const mocha = new Mocha({
  require: 'ts-node/register', 
});


mocha.addFile(path.join(__dirname, 'testcases', 'loginpage_tests.ts'));


mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0; 
});
