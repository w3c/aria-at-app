const path = require('path');

const gitCloneDirectory = path.resolve(__dirname, 'tmp');
const builtTestsDirectory = path.resolve(gitCloneDirectory, 'build', 'tests');
const testsDirectory = path.resolve(gitCloneDirectory, 'tests');

module.exports = { gitCloneDirectory, builtTestsDirectory, testsDirectory };
