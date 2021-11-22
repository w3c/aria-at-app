const createGitHubIssueWithTitleAndBody = ({
    test,
    testPlanReport,
    conflictsMarkdown
}) => {
    const { testPlanVersion, testPlanTarget } = testPlanReport;
    const { at, browser } = testPlanTarget;

    const title =
        `Feedback: "${test.title}" (${testPlanVersion.title}, ` +
        `Test ${test.rowNumber})`;

    const shortenedUrl = test.renderedUrl.match(/[^/]+$/)[0];

    let body =
        `#### Description of Behavior\n\n` +
        `<!-- write your description here -->\n\n` +
        `#### Test Setup\n\n` +
        `- Test File at Exact Commit: ` +
        `[${shortenedUrl}](https://aria-at.w3.org${test.renderedUrl})\n` +
        `- AT: ` +
        `${at.name} (version ${testPlanTarget.atVersion})\n` +
        `- Browser: ` +
        `${browser.name} (version ${testPlanTarget.browserVersion})\n`;

    if (conflictsFormatted) {
        body += `\n#### Conflicts With Other Results\n${conflictsFormatted}`;
    }

    return (
        `https://github.com/w3c/aria-at/issues/new?title=${encodeURI(title)}&` +
        `body=${encodeURIComponent(body)}`
    );
};

export default createGitHubIssueWithTitleAndBody;
