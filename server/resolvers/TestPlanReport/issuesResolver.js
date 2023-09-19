const { GithubService } = require('../../services');
const convertDateToString = require('../../util/convertDateToString');

const issuesResolver = async testPlanReport => {
    const issues = await GithubService.getAllIssues();

    const { at, testPlanVersion } = testPlanReport;

    const searchTestPlanTitle = testPlanVersion.title;

    const searchVersionString = `V${convertDateToString(
        testPlanVersion.updatedAt,
        'YY.MM.DD'
    )}`;

    let searchAtName;
    if (at.name === 'JAWS' || at.name === 'NVDA') {
        searchAtName = at.name.toLowerCase();
    } else {
        searchAtName = 'vo';
    }

    return issues
        .filter(({ labels, body }) => {
            return (
                labels.find(({ name }) => name === searchAtName) &&
                body?.includes(searchTestPlanTitle) &&
                body?.includes(searchVersionString)
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

            const labelNames = labels.map(label => label.name);

            const feedbackType = labelNames.includes('changes-requested')
                ? 'CHANGES_REQUESTED'
                : 'FEEDBACK';

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
