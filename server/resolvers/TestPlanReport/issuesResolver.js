const { GithubService } = require('../../services');
const { Base64 } = require('js-base64');

const issuesResolver = async testPlanReport => {
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateString = testPlanReport.phaseChangeUpdate?.toLocaleDateString(
        'en-US',
        dateOptions
    );
    const searchTitle = `ARIA-AT-App Candidate Test Plan Review for ${testPlanReport.at.name}/${testPlanReport.testPlanVersion.dataValues.title} started ${dateString}`;

    let atKey = '';
    switch (testPlanReport.at.name) {
        case 'JAWS':
            atKey = 'jaws';
            break;
        case 'NVDA':
            atKey = 'nvda';
            break;
        case 'VoiceOver for macOS':
            atKey = 'vo';
            break;
    }

    const cacheId = Base64.encode(`${testPlanReport.id}${searchTitle}`);
    const candidateReviewIssuesResult = await GithubService.getCandidateReviewIssues(
        {
            cacheId,
            ats: [atKey]
        }
    );

    const issues = candidateReviewIssuesResult[atKey];
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
                id: topCommentIdUrl
            } = issue;
            const testNumberSubstring = title.match(/\[Test \d+]/g)[0];
            const testNumber = testNumberSubstring.match(/\d+/g)[0];

            return {
                author: user.login,
                link: `${html_url}#issue-${topCommentIdUrl}`,
                type: labels
                    .map(label => label.name)
                    .includes('changes-requested')
                    ? 'changes-requested'
                    : 'feedback',
                isOpen: state === 'open',
                testNumber
            };
        });
    }

    return [];
};

module.exports = issuesResolver;
