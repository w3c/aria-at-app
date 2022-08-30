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

    // TODO: Determine how to retrieve this at this point
    const githubAccessToken = '';
    if (!githubAccessToken) {
        console.error('Unable to get GitHub Access Token');
        return [];
    }

    const cacheId = Base64.encode(`${testPlanReport.id}${searchTitle}`);
    const candidateReviewIssuesResult = await GithubService.getCandidateReviewIssues(
        {
            cacheId,
            githubAccessToken,
            ats: [atKey]
        }
    );

    const issues = candidateReviewIssuesResult[atKey];
    if (issues.length) {
        const filteredIssues = issues.filter(i =>
            i.title.includes(searchTitle)
        );
        return filteredIssues.map(i => {
            const { title, author, bodyUrl, labels, state } = i;
            const testNumberSubstring = title.match(/\[Test \d+]/g)[0];
            const testNumber = testNumberSubstring.match(/\d+/g)[0];

            return {
                author: author.login,
                link: bodyUrl,
                type: labels.nodes
                    .map(l => l.name)
                    .includes('changes-requested')
                    ? 'changes-requested'
                    : 'feedback',
                isOpen: state === 'OPEN',
                testNumber
            };
        });
    }

    return [];
};

module.exports = issuesResolver;
