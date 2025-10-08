import React from 'react';
import PropTypes from 'prop-types';
import BasicModal from '../common/BasicModal';
import AssertionDetails from './BugLinking/AssertionDetails';

const ReportATBugModal = ({
  show,
  onClose,
  assertion,
  testPlanReport,
  testPlanVersion
}) => {
  const handleReportBug = () => {
    // Always use the aria-at repository under w3c organization
    const vendorIssuesUrl = 'https://github.com/w3c/aria-at';

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
      `## External Link to AT Bug\n\n` +
      `<!-- External link to a related bug being tracked by the At Vendor -->` +
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
        <h4>Report {testPlanReport.at.name} Bug</h4>
        <p>
          This will create a GitHub issue in the ARIA-AT repository with context
          about this failing assertion from the ARIA-AT test suite.
        </p>
      </div>
    </div>
  );

  return (
    <BasicModal
      show={show}
      centered
      size="lg"
      title={`Report ${testPlanReport.at.name} Bug`}
      content={modalContent}
      handleClose={onClose}
      useOnHide
      actions={[
        {
          label: 'Create GitHub Issue',
          onClick: handleReportBug,
          className: 'btn-primary'
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
