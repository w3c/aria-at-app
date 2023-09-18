const { GithubService } = require('../../services');
const convertDateToString = require('../../util/convertDateToString');

const issuesResolver = async testPlanReport => {
    const issues = await GithubService.getAllIssues();

    const { at, browser, testPlanVersion } = testPlanReport;

    const versionString = `V${convertDateToString(
        testPlanVersion.updatedAt,
        'YY.MM.DD'
    )}`;

    const getHiddenIssueMetadata = issue => {
        return JSON.parse(
            issue.body.match(
                // Since this is human editable it should be okay for the
                // JSON part to be multiline, and for additional comments
                // to follow this metadata comment
                /<!--\s*ARIA_AT_APP_ISSUE_DATA\s*=\s*((.|\n)+?)\s*-->/
            )?.[1] ?? 'null'
        );
    };

    return issues
        .filter(issue => {
            const hiddenIssueMetadata = getHiddenIssueMetadata(issue);
            return (
                hiddenIssueMetadata &&
                hiddenIssueMetadata.testPlanDirectory ===
                    testPlanVersion.directory &&
                hiddenIssueMetadata.versionString === versionString &&
                hiddenIssueMetadata.atName === at.name &&
                (!hiddenIssueMetadata.browserName ||
                    hiddenIssueMetadata.browserName === browser.name)
            );
        })
        .map(issue => {
            const hiddenIssueMetadata = getHiddenIssueMetadata(issue);

            const { title, user, state, html_url, id: topCommentId } = issue;

            const feedbackType =
                hiddenIssueMetadata.isCandidateReviewChangesRequested
                    ? 'CHANGES_REQUESTED'
                    : 'FEEDBACK';

            return {
                author: user.login,
                title,
                createdAt: issue.created_at,
                closedAt: issue.closed_at,
                link: `${html_url}#issue-${topCommentId}`,
                isCandidateReview: hiddenIssueMetadata.isCandidateReview,
                feedbackType,
                isOpen: state === 'open',
                testNumberFilteredByAt: hiddenIssueMetadata.testRowNumber
            };
        });
};

module.exports = issuesResolver;
