const atLabelMap = {
    'VoiceOver for macOS': 'vo',
    JAWS: 'jaws',
    NVDA: 'nvda'
};

const createIssueLink = ({
    isCandidateReview = false,
    isCandidateReviewChangesRequested = false,
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
    if (!(testPlanTitle || versionString || atName)) {
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
        'app,' +
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
            browserFormatted;
    }

    let body =
        `## Description of Behavior\n\n` +
        `<!-- write your description here -->\n\n` +
        testSetupFormatted;

    if (conflictMarkdown) {
        body += `\n${conflictMarkdown}`;
    }

    return (
        `https://github.com/howard-e/aria-at-app/issues/new?title=${encodeURI(
            title
        )}&` + `labels=${labels}&body=${encodeURIComponent(body)}`
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
        `label:app`,
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

    return `https://github.com/howard-e/aria-at-app/issues?q=${encodeURI(
        query
    )}`;
};

export default createIssueLink;
