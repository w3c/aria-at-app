import React from 'react';
import PropTypes from 'prop-types';

const RerunDashboard = ({ activeRuns, onRerunClick }) => (
  <>
    <h2 id="rerun-heading" className="rerun-header">
      Available Updates
    </h2>
    <div className="rerun-dashboard">
      {activeRuns.map(run => {
        const totalTestPlans = run.reportGroups.reduce(
          (sum, group) => sum + group.reportCount,
          0
        );
        const versionDescription = `${run.botName} ${
          run.newVersion
        } automation support has been added to the application. ${totalTestPlans} test plan versions can be re-run from ${
          run.reportGroups.length
        } previous versions, including ${run.reportGroups
          .map(g => g.prevVersion)
          .join(', ')}.`;

        return (
          <div key={run.id} className="rerun-opportunity">
            <h3
              id={`rerun-heading-${run.id}`}
              className="bot-name"
              aria-label={`Re-run available for ${run.botName} ${run.newVersion}`}
            >
              {run.botName} {run.newVersion}
            </h3>

            <p className="sr-only">{versionDescription}</p>

            <div className="version-update" aria-hidden="true">
              <div className="version-info">
                <div className="version-groups-container">
                  {run.reportGroups.map((group, index) => (
                    <div key={index} className="version-box">
                      <span className="version-number">
                        {group.prevVersion}
                      </span>
                      <span className="version-count">
                        {group.reportCount} run{group.reportCount !== 1 && 's'}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className={`version-box highlight${
                    !run.reportGroups.length ? ' no-reports' : ''
                  }`}
                >
                  <span className="version-number">{run.newVersion}</span>
                  {!run.reportGroups.length && (
                    <span className="version-count">No reports to update</span>
                  )}
                </div>
              </div>
            </div>

            <div className="plan-summary" aria-hidden="true">
              {run.reportGroups.length ? (
                <div className="plan-count">
                  <span className="plan-count-number">{totalTestPlans}</span>
                  <span className="plan-count-label">
                    {totalTestPlans === 1
                      ? 'Test plan version can be re-run'
                      : 'Test plan versions can be re-run'}
                  </span>
                </div>
              ) : (
                <div className="plan-count">
                  <span className="plan-count-label">
                    No reports available for update
                  </span>
                </div>
              )}
            </div>

            <div className="test-plans-preview">
              {run.reportGroups.map((group, index) => (
                <div key={index} className="version-group">
                  <h4
                    className="plans-preview-title"
                    id={`plans-preview-title-${run.id}-${index}`}
                    aria-label={`${group.reportCount} Test Plan Versions from ${run.botName} ${group.prevVersion}`}
                  >
                    {group.reportCount} from {group.prevVersion}
                  </h4>
                  <ul
                    className="plans-list"
                    aria-labelledby={`plans-preview-title-${run.id}-${index}`}
                  >
                    {group.reports.map((report, idx) => (
                      <li key={idx}>
                        {report.testPlanVersion.title}{' '}
                        {report.testPlanVersion.versionString},{' '}
                        {report.browser.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="action-footer">
              <button
                className="rerun-button"
                disabled={!run.reportGroups.length}
                onClick={() => onRerunClick(run)}
                aria-label={`Start automated test plan runs for ${totalTestPlans} test plan versions using ${run.botName} ${run.newVersion}`}
              >
                Start Updates
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </>
);

RerunDashboard.propTypes = {
  activeRuns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      botName: PropTypes.string.isRequired,
      newVersion: PropTypes.string.isRequired,
      reportGroups: PropTypes.arrayOf(
        PropTypes.shape({
          prevVersion: PropTypes.string.isRequired,
          reportCount: PropTypes.number.isRequired,
          reports: PropTypes.arrayOf(
            PropTypes.shape({
              testPlanVersion: PropTypes.shape({
                title: PropTypes.string.isRequired,
                versionString: PropTypes.string.isRequired
              }).isRequired,
              browser: PropTypes.shape({
                name: PropTypes.string.isRequired
              }).isRequired
            })
          ).isRequired
        })
      ).isRequired
    })
  ).isRequired,
  onRerunClick: PropTypes.func.isRequired
};

export default RerunDashboard;
