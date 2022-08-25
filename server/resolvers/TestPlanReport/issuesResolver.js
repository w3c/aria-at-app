const { GithubService } = require('../../services');

const issuesResolver = async testPlanReport => {
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateString = testPlanReport.phaseChangeUpdate.toLocaleDateString(
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

    const candidateReviewIssuesResult = await GithubService.getCandidateReviewIssues(
        {
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
            const { author, bodyUrl, labels, state } = i;
            return {
                author: author.login,
                link: bodyUrl,
                type: labels.nodes
                    .map(l => l.name)
                    .includes('changes-requested')
                    ? 'changes-requested'
                    : 'feedback',
                isOpen: state === 'OPEN'
            };
        });
    }

    return [];
};

module.exports = issuesResolver;
