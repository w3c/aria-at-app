/* eslint no-console: 0 */

const spawn = require('cross-spawn');

const ariaAtRepo = 'https://github.com/w3c/aria-at.git';
const ariaAtDefaultBranch = 'master';

function gitRun(args, cwd) {
  const gitRunOutput = spawn.sync('git', args.split(' '), { cwd });

  if (gitRunOutput.error) {
    console.info(`'git ${args}' failed with error ${gitRunOutput.error}`);
    process.exit(1);
  }

  return gitRunOutput.stdout.toString().trimEnd();
}

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

async function readCommit(gitCloneDirectory, commit) {
  gitRun(`checkout ${commit ?? ariaAtDefaultBranch}`, gitCloneDirectory);
  const gitCommitDate = new Date(
    gitRun(`log --format=%aI -n 1`, gitCloneDirectory)
  );

  return { gitCommitDate };
}

function readDirectoryGitInfo(directoryPath) {
  const gitSha = gitRun(`log -1 --format=%H -- .`, directoryPath);
  const gitMessage = gitRun(`log -1 --format=%s -- .`, directoryPath);
  const gitCommitDate = new Date(
    gitRun(`log -1 --format=%aI -- .`, directoryPath)
  );

  return { gitSha, gitMessage, gitCommitDate };
}

module.exports = {
  gitRun,
  cloneRepo,
  readCommit,
  readDirectoryGitInfo
};
