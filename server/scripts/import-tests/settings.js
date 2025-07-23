const path = require('path');

const gitCloneDirectory = path.resolve(__dirname, 'aria-at-tmp');
const builtTestsDirectory = path.resolve(gitCloneDirectory, 'build', 'tests');
const testsDirectory = path.resolve(gitCloneDirectory, 'tests');

const getZipCommitPath = commit =>
  path.resolve(__dirname, 'zips', `build_${commit}.zip`);
const getZipCommitTmpDirectory = commit =>
  path.resolve(__dirname, `aria-at-${commit}-tmp`);
// Special commits for the building and testing process stored in ./zips
const PRE_BUILT_ZIP_COMMITS = [
  '5fe7afd82fe51c185b8661276105190a59d47322',
  '1aa3b74d24d340362e9f511eae33788d55487d12',
  'ab77d47ab19db71c635c9bb459ba5c34182e1400',
  'd34eddbb8e751f07bd28d952de15fa7fe5f07353'
];

module.exports = {
  gitCloneDirectory,
  builtTestsDirectory,
  testsDirectory,

  getZipCommitPath,
  getZipCommitTmpDirectory,
  PRE_BUILT_ZIP_COMMITS
};
