const { GithubService } = require('../../services');
const { Base64 } = require('js-base64');
const moment = require('moment');

const issuesResolver = async testPlanReport => {
    if (!testPlanReport.candidateStatusReachedAt) return [];

    const dateString = moment(testPlanReport.candidateStatusReachedAt).format(
        'MMMM D, YYYY'
    );
    const searchTitle = `ARIA-AT-App Candidate Test Plan Review for ${testPlanReport.at.name}/${testPlanReport.testPlanVersion.dataValues.title} started ${dateString}`;
    const cacheId = Base64.encode(`${testPlanReport.id}${searchTitle}`);

    const issues = await GithubService.getCandidateReviewIssuesByAt({
        cacheId,
        atName: testPlanReport.at.name
    });

    if (issues.length) {
        const filteredIssues = issues.filter(issue =>
            issue.title.includes(searchTitle)
        );
        return filteredIssues.map(issue => {
            const {
                title,
                user,
                labels,
                state,
                html_url,
                id: topCommentId
            } = issue;
            const testNumberMatch = title.match(/\[Test \d+]/g);
            const testNumberSubstring = testNumberMatch
                ? testNumberMatch[0]
                : '';
            const testNumberFilteredByAt = testNumberSubstring
                ? testNumberSubstring.match(/\d+/g)[0]
                : null;

            return {
                author: user.login,
                link: `${html_url}#issue-${topCommentId}`,
                feedbackType: labels
                    .map(label => label.name)
                    .includes('changes-requested')
                    ? 'CHANGES_REQUESTED'
                    : 'FEEDBACK',
                isOpen: state === 'open',
                testNumberFilteredByAt
            };
        });
    }

    return [];
};

module.exports = issuesResolver;
