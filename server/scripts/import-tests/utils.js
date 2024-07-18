const { gitCloneDirectory } = require('./settings');
const path = require('path');

const getAppUrl = (directoryRelativePath, { gitSha, directoryPath }) => {
  return path.join(
    '/',
    'aria-at', // The app's proxy to the ARIA-AT repo
    gitSha,
    path.relative(
      gitCloneDirectory,
      path.join(directoryPath, directoryRelativePath)
    )
  );
};
module.exports = { getAppUrl };
