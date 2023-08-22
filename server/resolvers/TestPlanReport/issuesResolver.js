const { GithubService } = require('../../services');
const convertDateToString = require('../../util/convertDateToString');

const issuesResolver = async testPlanReport => {
    const issues = await GithubService.getAllIssues({
        atName: testPlanReport.at.name
    });

    const { at, testPlanVersion } = testPlanReport;

    const searchTestPlanTitle = testPlanVersion.title;

    const searchVersionString = `V${convertDateToString(
        testPlanVersion.updatedAt,
        'YY.MM.DD'
    )}`;

    return issues
        .filter(({ title }) => {
            const searchAtName = title.match(/^(.+) (Feedback|Changes)/)?.[1];
            return (
                searchAtName === at.name &&
                title.includes(searchTestPlanTitle) &&
                title.includes(searchVersionString)
            );
        })
        .map(issue => {
            const {
                title,
                user,
                labels,
                state,
                html_url,
                id: topCommentId
            } = issue;
            const testNumberMatch = title.match(/\sTest \d+,/g);
            const testNumberSubstring = testNumberMatch
                ? testNumberMatch[0]
                : '';
            const testNumberFilteredByAt = testNumberSubstring
                ? testNumberSubstring.match(/\d+/g)[0]
                : null;

            const feedbackType = title.includes('Changes Requested')
                ? 'CHANGES_REQUESTED'
                : 'FEEDBACK';

            const labelNames = labels.map(label => label.name);

            return {
                author: user.login,
                title,
                createdAt: issue.created_at,
                closedAt: issue.closed_at,
                link: `${html_url}#issue-${topCommentId}`,
                isCandidateReview: labelNames.includes('candidate-review'),
                feedbackType,
                isOpen: state === 'open',
                testNumberFilteredByAt
            };
        });
};

module.exports = issuesResolver;
