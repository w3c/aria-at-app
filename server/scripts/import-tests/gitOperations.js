/* eslint no-console: 0 */

const spawn = require('cross-spawn');

const ariaAtRepo = 'https://github.com/w3c/aria-at.git';
const ariaAtDefaultBranch = 'rename-unexpected';

/**
 * Executes a git command and returns its output.
 * @param {string} args - The git command arguments as a string.
 * @param {string} cwd - The current working directory for the git command.
 * @returns {string} The trimmed output of the git command.
 * @throws {Error} If the git command fails.
 */
function gitRun(args, cwd) {
  const gitRunOutput = spawn.sync('git', args.split(' '), { cwd });

  if (gitRunOutput.error) {
    console.info(`'git ${args}' failed with error ${gitRunOutput.error}`);
    process.exit(1);
  }

  return gitRunOutput.stdout.toString().trimEnd();
}

/**
 * Clones the aria-at repository to the specified directory.
 * @param {string} gitCloneDirectory - The directory where the repo will be cloned.
 * @throws {Error} If the cloning process fails.
 */
function cloneRepo(gitCloneDirectory) {
  console.info('Cloning aria-at repo ...');
  const cloneOutput = spawn.sync('git', [
    'clone',
    ariaAtRepo,
    gitCloneDirectory
  ]);

  if (cloneOutput.error) {
    console.info(
      `git clone ${ariaAtRepo} ${gitCloneDirectory} failed with error ${cloneOutput.error}`
    );
    process.exit(1);
  }
  console.info('Cloning aria-at repo complete.');
}

/**
 * Checks out a specific commit and retrieves git information for that commit.
 * @param {string} directoryPath - The directory of the cloned repo.
 * @param {string|null} commit - The commit to checkout. If null, uses the default branch.
 * @returns {Promise<{gitCommitDate: Date}>} An object containing the commit date.
 */
async function readCommit(directoryPath, commit) {
  gitRun(`checkout ${commit ?? ariaAtDefaultBranch}`, directoryPath);
  const gitSha = gitRun('log --format=%H -n 1', directoryPath);
  const gitMessage = gitRun('log --format=%s -n 1', directoryPath);
  const gitCommitDate = new Date(
    gitRun(`log --format=%aI -n 1`, directoryPath)
  );

  return { gitSha, gitMessage, gitCommitDate };
}

/**
 * Reads git information for a specific directory.
 * @param {string} directoryPath - The path to the directory to read git info from.
 * @returns {{gitSha: string, gitMessage: string, gitCommitDate: Date}} An object containing git information.
 */
function readDirectoryGitInfo(directoryPath) {
  const gitSha = gitRun(`log -1 --format=%H -- .`, directoryPath);
  const gitMessage = gitRun(`log -1 --format=%s -- .`, directoryPath);
  const gitCommitDate = new Date(
    gitRun(`log -1 --format=%aI -- .`, directoryPath)
  );

  return { gitSha, gitMessage, gitCommitDate };
}

module.exports = { cloneRepo, readCommit, readDirectoryGitInfo };
