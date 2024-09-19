const path = require('path');

// https://github.com/w3c/aria-at/commit/9d73d6bb274b3fe75b9a8825e020c0546a33a162
// This is the date of the last commit before the /build folder removal in
// 8f83b9808efc3f830481ef4d37599c299c8c4676.
// Meant to support backward compatability for older tests.
const buildRemovalDate = new Date('2022-03-10 18:08:36.000000 +00:00');

// https://github.com/w3c/aria-at/commit/40e5aece2ffda9598d91df490f10ef5abdbea0d9 TODO: // this may need to be updated if another commit is merged before this is ready
// This is the date of the last commit before the /resources folder was moved in
// TODO: <insert the commit when aria-at#1096 is merged>.
// Used to account for <ROOT>/tests/resources instead of <ROOT>/resources.
const resourcesMovedDate = new Date('2024-08-29 09:35:44.000000 +00:00');

const gitCloneDirectory = path.resolve(__dirname, 'tmp');
const builtTestsDirectory = path.resolve(gitCloneDirectory, 'build', 'tests');
const testsDirectory = path.resolve(gitCloneDirectory, 'tests');
const getResourcesDirectory = useResourcesInTestsFolder =>
  useResourcesInTestsFolder
    ? path.resolve(gitCloneDirectory, 'tests', 'resources')
    : path.resolve(gitCloneDirectory, 'resources');

module.exports = {
  buildRemovalDate,
  resourcesMovedDate,

  gitCloneDirectory,
  builtTestsDirectory,
  testsDirectory,
  getResourcesDirectory
};
