const { GithubService } = require('../../services');

const issuesResolver = (testPlanReport, _, context) => {
  return getIssues({ testPlanReport, context });
};

const getIssues = async ({ testPlanReport, testPlan, context }) => {
  const { transaction, atLoader, browserLoader } = context;

  const ats = await atLoader.getAll({ transaction });
  const browsers = await browserLoader.getAll({ transaction });

  const issues = await GithubService.getAllIssues();

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

      if (testPlanReport) {
        const { at, browser, testPlanVersion } = testPlanReport;

        return (
          hiddenIssueMetadata &&
          hiddenIssueMetadata.testPlanDirectory === testPlanVersion.directory &&
          hiddenIssueMetadata.versionString === testPlanVersion.versionString &&
          hiddenIssueMetadata.atName === at.name &&
          (!hiddenIssueMetadata.browserName ||
            hiddenIssueMetadata.browserName === browser.name)
        );
      } else if (testPlan) {
        return (
          hiddenIssueMetadata &&
          hiddenIssueMetadata.testPlanDirectory === testPlan.directory
        );
      }
    })
    .map(issue => {
      const hiddenIssueMetadata = getHiddenIssueMetadata(issue);

      const { title, user, state, html_url, id: topCommentId } = issue;

      const feedbackType = hiddenIssueMetadata.isCandidateReviewChangesRequested
        ? 'CHANGES_REQUESTED'
        : 'FEEDBACK';

      const at = ats.find(
        at =>
          at.name.toLowerCase() === hiddenIssueMetadata.atName?.toLowerCase()
      );
      const browser = browsers.find(
        browser =>
          browser.name.toLowerCase() ===
          hiddenIssueMetadata.browserName?.toLowerCase()
      );

      return {
        author: user.login,
        title,
        createdAt: issue.created_at,
        closedAt: issue.closed_at,
        link: `${html_url}#issue-${topCommentId}`,
        isCandidateReview: hiddenIssueMetadata.isCandidateReview,
        feedbackType,
        isOpen: state === 'open',
        testRowNumber: hiddenIssueMetadata.testRowNumber,
        testSequenceNumber: hiddenIssueMetadata.testSequenceNumber,
        at,
        browser
      };
    });
};

module.exports = issuesResolver;
module.exports.getIssues = getIssues;
