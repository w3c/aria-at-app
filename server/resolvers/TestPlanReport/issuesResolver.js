const { GithubService } = require('../../services');
const { Base64 } = require('js-base64');
const dayjs = require('dayjs');

const issuesResolver = async testPlanReport => {
    if (!testPlanReport.candidateStatusReachedAt) return [];

    const searchPrefix = `${testPlanReport.at.name} Feedback: "`;
    const searchTestPlanVersionTitle =
        testPlanReport.testPlanVersion.dataValues.title;
    const searchTestPlanVersionDate = dayjs(
        testPlanReport.testPlanVersion.updatedAt
    ).format('DD-MM-YYYY');
    const cacheId = Base64.encode(
        `${testPlanReport.id}${searchPrefix}${searchTestPlanVersionTitle}${searchTestPlanVersionDate}`
    );

    const issues = await GithubService.getCandidateReviewIssuesByAt({
        cacheId,
        atName: testPlanReport.at.name
    });

    if (issues.length) {
        const filteredIssues = issues.filter(
            ({ title }) =>
                title.includes(searchPrefix) &&
                title.includes(searchTestPlanVersionTitle) &&
                title.includes(searchTestPlanVersionDate)
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
            const testNumberMatch = title.match(/\sTest \d+,/g);
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
