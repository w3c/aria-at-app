import React from 'react';
import PropTypes from 'prop-types';
import styles from './ReportRerun.module.css';

const RerunDashboard = ({ activeRuns, onRerunClick }) => (
  <>
    <h2 id="rerun-heading" className={styles.rerunHeader}>
      Available Updates
    </h2>
    <div className={styles.rerunDashboard}>
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
          <div key={run.id} className={styles.rerunOpportunity}>
            <h3
              id={`rerun-heading-${run.id}`}
              className={styles.botName}
              aria-label={`Re-run available for ${run.botName} ${run.newVersion}`}
            >
              {run.botName} {run.newVersion}
            </h3>

            <p className="sr-only">{versionDescription}</p>

            <div className={styles.versionUpdate} aria-hidden="true">
              <div className={styles.versionInfo}>
                <div className={styles.versionGroupsContainer}>
                  {run.reportGroups.map((group, index) => (
                    <div key={index} className={styles.versionBox}>
                      <span className={styles.versionNumber}>
                        {group.prevVersion}
                      </span>
                      <span className={styles.versionCount}>
                        {group.reportCount} run{group.reportCount !== 1 && 's'}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className={`${styles.versionBox} ${styles.highlight}${
                    !run.reportGroups.length ? ` ${styles.noReports}` : ''
                  }`}
                >
                  <span className={styles.versionNumber}>{run.newVersion}</span>
                  {!run.reportGroups.length && (
                    <span className={styles.versionCount}>
                      No reports to update
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.planSummary} aria-hidden="true">
              {run.reportGroups.length ? (
                <div className={styles.planCount}>
                  <span className={styles.planCountNumber}>
                    {totalTestPlans}
                  </span>
                  <span className={styles.planCountLabel}>
                    {totalTestPlans === 1
                      ? 'Test plan version can be re-run'
                      : 'Test plan versions can be re-run'}
                  </span>
                </div>
              ) : (
                <div className={styles.planCount}>
                  <span className={styles.planCountLabel}>
                    No reports available for update
                  </span>
                </div>
              )}
            </div>

            <div className={styles.testPlansPreview}>
              {run.reportGroups.map((group, index) => (
                <div key={index} className={styles.versionGroup}>
                  <h4
                    className={styles.plansPreviewTitle}
                    id={`plans-preview-title-${run.id}-${index}`}
                    aria-label={`${group.reportCount} Test Plan Versions from ${run.botName} ${group.prevVersion}`}
                  >
                    {group.reportCount} from {group.prevVersion}
                  </h4>
                  <ul
                    className={styles.plansList}
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

            <div className={styles.actionFooter}>
              <button
                className={styles.rerunButton}
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
