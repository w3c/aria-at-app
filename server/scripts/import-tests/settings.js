const path = require('path');

const gitCloneDirectory = path.resolve(__dirname, 'tmp');
const builtTestsDirectory = path.resolve(gitCloneDirectory, 'build', 'tests');
const testsDirectory = path.resolve(gitCloneDirectory, 'tests');
const resourcesDirectory = path.resolve(gitCloneDirectory, 'resources');

module.exports = {
  gitCloneDirectory,
  builtTestsDirectory,
  testsDirectory,
  resourcesDirectory
};
