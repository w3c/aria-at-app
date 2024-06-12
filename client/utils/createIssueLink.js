const GITHUB_ISSUES_URL =
    process.env.ENVIRONMENT === 'production'
        ? 'https://github.com/w3c/aria-at'
        : 'https://github.com/bocoup/aria-at';

const atLabelMap = {
    'VoiceOver for macOS': 'vo',
    JAWS: 'jaws',
    NVDA: 'nvda'
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
    reportLink = null
}) => {
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

        title =
            `${titleStart}: "${testTitle}" (${testPlanTitle}, ` +
            `Test ${testSequenceNumber}, ${versionString})`;
    } else {
        title = `${atName} General Feedback: ${testPlanTitle} ${versionString}`;
    }

    const labels =
        (isCandidateReview ? 'candidate-review,' : '') +
        `${atLabelMap[atName]},` +
        (isCandidateReviewChangesRequested ? 'changes-requested' : 'feedback');

    let reportLinkFormatted = '';
    if (reportLink) {
        reportLinkFormatted = `- Report Page: [Link](${reportLink})\n`;
    }

    let testSetupFormatted = '';
    if (hasTest) {
        // TODO: fix renderedUrl
        let modifiedRenderedUrl = testRenderedUrl.replace(
            /.+(?=\/tests)/,
            'https://aria-at.netlify.app'
        );

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
            browserFormatted +
            '\n';
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
        `<!-- The following data allows the issue to be imported into the ` +
        `ARIA AT App -->\n` +
        `<!-- ARIA_AT_APP_ISSUE_DATA = ${hiddenIssueMetadata} -->`;

    if (conflictMarkdown) {
        body += `\n${conflictMarkdown}`;
    }

    return (
        `${GITHUB_ISSUES_URL}/issues/new?title=${encodeURI(title)}&` +
        `labels=${labels}&body=${encodeURIComponent(body)}`
    );
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
 * @returns {string} The URL for searching issues on the GitHub repository
 */
export const getIssueSearchLink = ({
    isCandidateReview = false,
    isCandidateReviewChangesRequested = false,
    username = null,
    atName,
    testPlanTitle,
    versionString,
    testSequenceNumber = null
}) => {
    let atKey;
    if (atName === 'JAWS' || atName === 'NVDA') {
        atKey = atName.toLowerCase();
    } else {
        atKey = 'vo';
    }

    const query = [
        isCandidateReview ? `label:candidate-review` : '',
        isCandidateReviewChangesRequested
            ? `label:changes-requested`
            : 'label:feedback',
        `label:${atLabelMap[atName]}`,
        username ? `author:${username}` : '',
        `label:${atKey}`,
        `"${testPlanTitle}"`,
        testSequenceNumber ? `Test ${testSequenceNumber}` : '',
        versionString
    ]
        .filter(str => str)
        .join(' ');

    return `${GITHUB_ISSUES_URL}/issues?q=${encodeURI(query)}`;
};

export default createIssueLink;
