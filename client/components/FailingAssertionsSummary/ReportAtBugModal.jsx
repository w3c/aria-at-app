import React, { useState } from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import AssertionDetails from './AssertionDetails';

const ReportATBugModal = ({
  show,
  onClose,
  assertion,
  testPlanReport,
  testPlanVersion
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(true);

  const validateGithubUrl = url => {
    const githubPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    return githubPattern.test(url.trim());
  };

  const handleGithubUrlChange = e => {
    const url = e.target.value;
    setGithubUrl(url);
    setIsValidGithubUrl(validateGithubUrl(url));
  };

  const handleReportBug = () => {
    if (!githubUrl || !isValidGithubUrl) {
      return;
    }

    // Extract repository info from GitHub URL
    const repoMatch = githubUrl.match(
      /https:\/\/github\.com\/([^/]+)\/([^/]+)/
    );
    if (!repoMatch) {
      return;
    }

    const [, owner, repo] = repoMatch;
    const vendorIssuesUrl = `https://github.com/${owner}/${repo}`;

    const title = `ARIA-AT Test Failure: ${assertion.testTitle} (${testPlanVersion?.title})`;

    const testRenderedUrl = `${window.location.origin}/tests/${testPlanVersion?.testPlan?.directory}`;
    const shortenedUrl = testRenderedUrl?.match(/[^/]+$/)?.[0] || 'test';

    let atFormatted = '';
    if (assertion.atVersionName) {
      atFormatted = `- AT: ${testPlanReport.at.name} (Version ${assertion.atVersionName})\n`;
    } else {
      atFormatted = `- AT: ${testPlanReport.at.name}\n`;
    }

    let browserFormatted = '';
    if (testPlanReport.browser?.name && assertion.browserVersionName) {
      browserFormatted = `- Browser: ${testPlanReport.browser.name} (Version ${assertion.browserVersionName})\n`;
    } else if (testPlanReport.browser?.name) {
      browserFormatted = `- Browser: ${testPlanReport.browser.name}\n`;
    }

    const body =
      `## ARIA-AT Test Failure Report\n\n` +
      `This issue reports a failing assertion from the ARIA-AT (Assistive Technology) test suite.\n\n` +
      `## Test Context\n\n` +
      `- **Test Name**: ${assertion.testTitle}\n` +
      `- **Command**: \`${assertion.scenarioCommands}\`\n` +
      `- **Assertion**: ${assertion.assertionText}\n` +
      `- **Expected**: ${assertion.priority} behavior\n` +
      `- **AT Response**: ${assertion.output}\n\n` +
      `## Test Setup\n\n` +
      `- Test File: [${shortenedUrl}](${testRenderedUrl})\n` +
      `- Test Plan: ${testPlanVersion?.title} (${testPlanVersion?.versionString})\n` +
      `- Report Page: [Link](${window.location.href})\n` +
      atFormatted +
      browserFormatted +
      `\n## Description of Issue\n\n` +
      `<!-- Please describe the issue you're experiencing with this test -->\n\n` +
      `## Expected Behavior\n\n` +
      `<!-- Describe what you expected to happen -->\n\n` +
      `## Actual Behavior\n\n` +
      `<!-- Describe what actually happened -->\n\n` +
      `## Additional Context\n\n` +
      `<!-- Add any other context about the problem here -->\n\n` +
      `---\n\n` +
      `*This issue was automatically generated from the ARIA-AT test suite.*`;

    const issueUrl = `${vendorIssuesUrl}/issues/new?title=${encodeURI(
      title
    )}&body=${encodeURIComponent(body)}`;

    window.open(issueUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const modalContent = (
    <div>
      <AssertionDetails assertion={assertion} />

      <div className="mb-3">
        <h4>Report AT Bug</h4>
        <p>
          This will create a GitHub issue in the vendor&apos;s repository with
          context about this failing assertion from the ARIA-AT test suite.
        </p>
      </div>

      <div className="mb-3">
        <label htmlFor="github-url" className="form-label">
          Vendor GitHub Repository <span className="text-danger">*</span>
        </label>
        <input
          id="github-url"
          type="url"
          className={`form-control ${!isValidGithubUrl ? 'is-invalid' : ''}`}
          value={githubUrl}
          onChange={handleGithubUrlChange}
          placeholder="https://github.com/vendor/repo"
          aria-describedby="github-url-help"
          required
        />
        <div id="github-url-help" className="form-text">
          Enter the GitHub repository where the issue should be created (e.g.,
          NVDA, JAWS, VoiceOver)
        </div>
        {!isValidGithubUrl && (
          <div className="invalid-feedback">
            Please enter a valid GitHub repository URL
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BasicModal
      show={show}
      centered
      size="lg"
      title="Report AT Bug"
      content={modalContent}
      handleClose={onClose}
      useOnHide
      actions={[
        {
          label: 'Create GitHub Issue',
          onClick: handleReportBug,
          className: 'btn-primary',
          disabled: !githubUrl || !isValidGithubUrl
        }
      ]}
    />
  );
};

ReportATBugModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  assertion: PropTypes.object,
  testPlanReport: PropTypes.object.isRequired,
  testPlanVersion: PropTypes.object.isRequired
};

export default ReportATBugModal;
