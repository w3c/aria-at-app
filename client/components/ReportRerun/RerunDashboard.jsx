import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ReportRerun.module.css';
import { convertStringFormatToAnotherFormat } from 'shared/dates';
import DisclosureComponent from '../common/DisclosureComponent';

const RerunDashboard = ({ activeRuns, onRerunClick }) => {
  const [expandedStates, setExpandedStates] = useState({});

  const toggleDisclosure = runId => {
    setExpandedStates(prevStates => ({
      ...prevStates,
      [runId]: !prevStates[runId]
    }));
  };

  return (
    <>
      <h2 id="rerun-heading" className={styles.rerunHeader}>
        Available Updates
      </h2>
      {activeRuns.map(run => {
        const totalReports = run.reportGroups.reduce(
          (sum, group) => sum + group.reportCount,
          0
        );

        const previousVersionCount = run.reportGroups.length;

        const flatReports = run.reportGroups.flatMap(group =>
          group.reports.map(report => ({
            prevVersion: group.prevVersion,
            releasedAt: group.releasedAt,
            testPlanTitle: report.testPlanVersion.title,
            testPlanVersionString: report.testPlanVersion.versionString,
            browserName: report.browser.name,
            markedFinalAt: report.markedFinalAt
          }))
        );

        flatReports.sort(
          (a, b) => new Date(b.releasedAt) - new Date(a.releasedAt)
        );

        const buttonAriaLabel = `Start generating reports for ${totalReports} reports with ${run.botName} ${run.newVersion}`;

        const disclosureTitle = (
          <span className={styles.botName}>
            {' '}
            {run.botName} {run.newVersion}
            <span className={styles.reportCount}>
              {' '}
              ({totalReports} {totalReports === 1 ? 'Report' : 'Reports'}{' '}
              Available)
            </span>
          </span>
        );

        return (
          <div key={run.id} className={styles.rerunOpportunity}>
            <DisclosureComponent
              componentId={`rerun-disclosure-${run.id}`}
              title={disclosureTitle}
              expanded={!!expandedStates[run.id]}
              onClick={() => toggleDisclosure(run.id)}
              disclosureContainerView={
                <>
                  <div className={styles.reportDescription}>
                    {' '}
                    <p>
                      {run.botName} {run.newVersion} has been recently added to
                      the system.
                    </p>
                    <p>
                      The following {totalReports}{' '}
                      {totalReports === 1 ? 'report' : 'reports'} generated with{' '}
                      {previousVersionCount}{' '}
                      {previousVersionCount === 1
                        ? 'earlier version'
                        : 'earlier versions'}{' '}
                      of {run.botName} can be automatically updated with the
                      &quot;Start Generating Reports&quot; button below.
                    </p>
                  </div>

                  <div className={styles.actionHeader}>
                    <button
                      className={styles.rerunButton}
                      disabled={totalReports === 0}
                      onClick={() => onRerunClick(run)}
                      aria-label={buttonAriaLabel}
                    >
                      Start Generating Reports
                    </button>
                  </div>

                  <div className={styles.reportTableContainer}>
                    <table className={`${styles.reportTable}`}>
                      <caption className="sr-only">{`Reports generated from prior ${run.botName} versions`}</caption>
                      <thead>
                        <tr>
                          <th scope="col">AT Version</th>
                          <th scope="col">Test Plan</th>
                          <th scope="col">Report Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flatReports.map((report, index) => (
                          <tr key={index}>
                            <td>{report.prevVersion}</td>
                            <td>{report.testPlanTitle}</td>
                            <td>
                              {convertStringFormatToAnotherFormat(
                                report.markedFinalAt,
                                'YYYY-MM-DDTHH:mm:ss.SSSZ',
                                'D MMM YYYY'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              }
            />
          </div>
        );
      })}
    </>
  );
};

RerunDashboard.propTypes = {
  activeRuns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      botName: PropTypes.string.isRequired,
      newVersion: PropTypes.string.isRequired,
      reportGroups: PropTypes.arrayOf(
        PropTypes.shape({
          prevVersion: PropTypes.string.isRequired,
          releasedAt: PropTypes.string.isRequired,
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
