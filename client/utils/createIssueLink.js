const GITHUB_ISSUES_URL =
  process.env.ENVIRONMENT === 'production'
    ? 'https://github.com/w3c/aria-at'
    : 'https://github.com/bocoup/aria-at';

// Maximum URL length for GitHub issues
// Tested on multiple browsers and devices
const MAX_GITHUB_URL_LENGTH = 8000;

// TODO: Use At.key
export const GitHubAtLabelMap = {
  'VoiceOver for macOS': 'vo',
  JAWS: 'jaws',
  NVDA: 'nvda'
};

export const AtBugTrackerMap = {
  JAWS: 'https://github.com/FreedomScientific/VFO-standards-support/issues',
  NVDA: 'https://github.com/nvaccess/nvda/issues',
  'VoiceOver for macOS':
    'https://bugs.webkit.org/buglist.cgi?quicksearch=voiceover'
};

/**
 * Returns a truncation message for URLs that are too long.
 *
 * @param {number|null} testSequenceNumber - Optional test sequence number to include in truncation message
 * @returns {string} The truncation message
 */
const getTruncationMessage = (testSequenceNumber = null) => {
  return `...\n\n[**Content truncated due to URL length limits.** Please visit [${
    window.location
  }](${window.location}) to review ${
    !testSequenceNumber ? 'further' : `Test ${testSequenceNumber}`
  }.]`;
};

/**
 * Truncates a body string to ensure the resulting URL stays under the maximum length.
 *
 * @param {string} body - The original body content
 * @param {string} baseUrl - The URL without the body (including title and labels)
 * @param {number|null} testSequenceNumber - Optional test sequence number to include in truncation message
 * @returns {string} The truncated body that will keep the URL under the maximum length
 */
const truncateUrlBody = (body, baseUrl, testSequenceNumber = null) => {
  const maxUrlLength = MAX_GITHUB_URL_LENGTH;
  const truncationMessage = getTruncationMessage(testSequenceNumber);

  // Multiply by 0.65 to account for encoding
  const maxBodyLength = Math.floor(
    (maxUrlLength - baseUrl.length - truncationMessage.length) * 0.65
  );

  return body.substring(0, maxBodyLength) + truncationMessage;
};

/**
 * Creates a link to open a new issue on the GitHub repository.
 *
 * @param {Object} options - Options for creating the issue link
 * @param {boolean} [options.isCandidateReview=false] - Whether this is a candidate review
 * @param {boolean} [options.isCandidateReviewChangesRequested=false] - Whether changes are requested for a candidate review
 * @param {string} [options.testPlanDirectory] - The directory of the test plan
 * @param {string} [options.testPlanTitle] - The title of the test plan
 * @param {string} [options.versionString] - The version string
 * @param {string|null} [options.testTitle=null] - The title of the test
 * @param {number|null} [options.testSequenceNumber=null] - The sequence number of the test. This is the number displayed to test runners
 * @param {number|null} [options.testRowNumber=null] - The row number of the test in aria-at
 * @param {string|null} [options.testRenderedUrl=null] - The rendered URL of the test
 * @param {string} options.atName - The name of the assistive technology
 * @param {string|null} [options.atVersionName=null] - The version name of the assistive technology
 * @param {string|null} [options.browserName=null] - The name of the browser
 * @param {string|null} [options.browserVersionName=null] - The version name of the browser
 * @param {string|null} [options.conflictMarkdown=null] - The conflict markdown
 * @param {string|null} [options.reportLink=null] - The link to the report
 * @param {string|null} [options.commandString=null] - The command string to be included in the report
 * @param {string|null} [options.versionPhase=null] - The phase of the test plan version in case the report has to reflect that
 * @returns {string} The URL for creating a new issue on the GitHub repository
 * @throws {Error} If required parameters are missing
 */
const createIssueLink = ({
  isCandidateReview = false,
  isCandidateReviewChangesRequested = false,
  testPlanDirectory,
  testPlanTitle,
  versionString,
  testTitle = null,
  testSequenceNumber = null,
  testRowNumber = null,
  testRenderedUrl = null,
  atName,
  atVersionName = null,
  browserName = null,
  browserVersionName = null,
  conflictMarkdown = null,
  reportLink = null,
  testReviewLink = null,
  commandString = null,
  versionPhase = null
}) => {
  if (!isCandidateReview && versionPhase)
    isCandidateReview = versionPhase === 'CANDIDATE';

  if (!(testPlanDirectory || testPlanTitle || versionString || atName)) {
    throw new Error('Cannot create issue link due to missing parameters');
  }

  const hasTest = !!(
    testTitle &&
    testSequenceNumber &&
    testRowNumber &&
    testRenderedUrl
  );

  let title;
  if (hasTest) {
    let titleStart;
    if (isCandidateReview) {
      titleStart = isCandidateReviewChangesRequested
        ? `${atName} Changes Requested`
        : `${atName} Feedback`;
    } else {
      titleStart = 'Feedback';
    }

    if (commandString) {
      title =
        `${titleStart}: "${testTitle}" (${testPlanTitle}, ` +
        `Test ${testSequenceNumber}, Command "${commandString}", ${versionString})`;
    } else {
      title =
        `${titleStart}: "${testTitle}" (${testPlanTitle}, ` +
        `Test ${testSequenceNumber}, ${versionString})`;
    }
  } else {
    title = `General Feedback: ${testPlanTitle} ${versionString}`;
    if (atName) title = `${atName} ${title}`;
  }

  if (
    isCandidateReview ||
    isCandidateReviewChangesRequested ||
    versionPhase === 'CANDIDATE'
  ) {
    title = `${title} for Candidate Report`;
  }
  if (versionPhase === 'RECOMMENDED') title = `${title} for Recommended Report`;

  const labels =
    (isCandidateReview ? 'candidate-review,' : '') +
    `${GitHubAtLabelMap[atName]},` +
    (isCandidateReviewChangesRequested ? 'changes-requested' : 'feedback');

  let reportLinkFormatted = '';
  if (reportLink) {
    reportLinkFormatted = `- Report Page: [Link](${reportLink})\n`;
  }

  let testSetupFormatted = '';
  if (hasTest) {
    // TODO: fix renderedUrl source
    let modifiedRenderedUrl = testRenderedUrl.replace(
      // replace the path to the tests up to the "tests" folder with the netlify url
      // ensure original path matches both / and \ path separators
      /.+(?=[/\\]tests)/,
      'https://aria-at.netlify.app'
    );
    if (!modifiedRenderedUrl.includes(testPlanDirectory)) {
      const lastDirectorySegment = testPlanDirectory.split('/').pop();
      modifiedRenderedUrl = modifiedRenderedUrl.replace(
        new RegExp(`/${lastDirectorySegment}/`),
        `/${testPlanDirectory}/`
      );
    }

    const shortenedUrl = modifiedRenderedUrl?.match(/[^/]+$/)[0];

    let atFormatted;
    if (atVersionName) {
      atFormatted = `- AT: ${atName} (Version ${atVersionName})\n`;
    } else {
      atFormatted = `- AT: ${atName}\n`;
    }

    let browserFormatted = '';
    if (browserName && browserVersionName) {
      browserFormatted = `- Browser: ${browserName} (Version ${browserVersionName})\n`;
    } else if (browserName) {
      browserFormatted = `- Browser: ${browserName}\n`;
    }

    testSetupFormatted =
      `## Test Setup\n\n` +
      `- Test File: ` +
      `[${shortenedUrl}](${modifiedRenderedUrl})\n` +
      reportLinkFormatted +
      atFormatted +
      browserFormatted;

    if (commandString) {
      testSetupFormatted =
        `${testSetupFormatted}` + `- Command: \`${commandString}\`\n`;
    }

    testSetupFormatted = `${testSetupFormatted}\n`;
  }

  let metadataFormatted = '';
  let testReviewLinkFormatted = '';
  if (testReviewLink) {
    testReviewLinkFormatted = `- Test Review Page: [Link](${testReviewLink})\n`;
    metadataFormatted = `## Metadata\n\n` + testReviewLinkFormatted + '\n';
  }

  const hiddenIssueMetadata = JSON.stringify({
    testPlanDirectory,
    versionString,
    atName,
    browserName,
    testRowNumber,
    testSequenceNumber,
    isCandidateReview,
    isCandidateReviewChangesRequested
  });

  let body =
    `## Description of Behavior\n\n` +
    `<!-- Write your description here -->\n\n` +
    testSetupFormatted +
    metadataFormatted +
    `<!-- The following data allows the issue to be imported into the ` +
    `ARIA AT App -->\n` +
    `<!-- ARIA_AT_APP_ISSUE_DATA = ${hiddenIssueMetadata} -->`;

  if (conflictMarkdown) {
    body += `\n${conflictMarkdown}`;
  }

  // Create the base URL without the body
  const baseUrl = `${GITHUB_ISSUES_URL}/issues/new?title=${encodeURI(
    title
  )}&labels=${labels}&body=`;

  let url = baseUrl + encodeURIComponent(body);

  if (url.length > MAX_GITHUB_URL_LENGTH) {
    body = truncateUrlBody(body, baseUrl, testSequenceNumber);
    url = baseUrl + encodeURIComponent(body);
  }

  return url;
};

/**
 * Returns a link to search for existing issues on the GitHub repository based on the provided parameters.
 *
 * @param {Object} options - Options for generating the issue search link
 * @param {boolean} [options.isCandidateReview=false] - Whether this is a candidate review
 * @param {boolean} [options.isCandidateReviewChangesRequested=false] - Whether changes are requested for a candidate review
 * @param {string|null} [options.username=null] - The username of the author
 * @param {string} options.atName - The name of the assistive technology
 * @param {string} options.testPlanTitle - The title of the test plan
 * @param {string} options.versionString - The version string
 * @param {number|null} [options.testSequenceNumber=null] - The sequence number of the test, this is the test number displayed to test runners
 * @param {boolean} [options.isGeneralFeedback] - is 'General' feedback across the entire test plan
 * @returns {string} The URL for searching issues on the GitHub repository
 */
export const getIssueSearchLink = ({
  isCandidateReview = false,
  isCandidateReviewChangesRequested = false,
  username = null,
  atName,
  testPlanTitle,
  versionString,
  testSequenceNumber = null,
  isGeneralFeedback = false
}) => {
  const query = [
    isCandidateReview ? `label:candidate-review` : '',
    isCandidateReviewChangesRequested
      ? `label:changes-requested`
      : 'label:feedback',
    `label:${GitHubAtLabelMap[atName]}`,
    username ? `author:${username}` : '',
    `"${testPlanTitle}${
      testSequenceNumber ? ` Test ${testSequenceNumber}` : ''
    }"`,
    isGeneralFeedback ? `General` : '',
    versionString
  ]
    .filter(str => str)
    .join(' ');

  return `${GITHUB_ISSUES_URL}/issues?q=${encodeURI(query)}`;
};

export default createIssueLink;
