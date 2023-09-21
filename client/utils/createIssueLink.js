const GITHUB_ISSUES_URL =
    process.env.ENVIRONMENT === 'production'
        ? 'https://github.com/w3c/aria-at'
        : 'https://github.com/bocoup/aria-at';

const atLabelMap = {
    'VoiceOver for macOS': 'vo',
    JAWS: 'jaws',
    NVDA: 'nvda'
};

const createIssueLink = ({
    isCandidateReview = false,
    isCandidateReviewChangesRequested = false,
    testPlanDirectory,
    testPlanTitle,
    versionString,
    testTitle = null,
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

    const hasTest = !!(testTitle && testRowNumber && testRenderedUrl);

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
            `Test ${testRowNumber}, ${versionString})`;
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

export const getIssueSearchLink = ({
    isCandidateReview = false,
    isCandidateReviewChangesRequested = false,
    username = null,
    atName,
    testPlanTitle,
    versionString,
    testRowNumber = null
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
        testRowNumber ? `Test ${testRowNumber}` : '',
        versionString
    ]
        .filter(str => str)
        .join(' ');

    return `${GITHUB_ISSUES_URL}/issues?q=${encodeURI(query)}`;
};

export default createIssueLink;
