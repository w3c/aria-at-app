import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ReportRerun.module.css';
import { convertStringFormatToAnotherFormat } from 'shared/dates'; // For formatting dates
import DisclosureComponent from '../common/DisclosureComponent'; // Import DisclosureComponent

const RerunDashboard = ({ activeRuns, onRerunClick }) => {
  // Manage expanded state for all disclosures in one object
  const [expandedStates, setExpandedStates] = useState({});

  // Function to toggle state for a specific run ID
  const toggleDisclosure = runId => {
    setExpandedStates(prevStates => ({
      ...prevStates,
      [runId]: !prevStates[runId] // Toggle the boolean value
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

        // Flatten reports for the table view
        const flatReports = run.reportGroups.flatMap(group =>
          group.reports.map(report => ({
            prevVersion: group.prevVersion,
            releasedAt: group.releasedAt,
            testPlanTitle: report.testPlanVersion.title,
            testPlanVersionString: report.testPlanVersion.versionString,
            browserName: report.browser.name
          }))
        );

        const buttonAriaLabel = `Start generating reports for ${totalReports} test plans with ${run.botName} ${run.newVersion}`;

        // Title for the disclosure component
        const disclosureTitle = (
          <span className={styles.botName}>
            {' '}
            {/* Reuse botName style for title */}
            {run.botName} {run.newVersion} ({totalReports}{' '}
            {totalReports === 1 ? 'Report' : 'Reports'} Available)
          </span>
        );

        return (
          <div key={run.id} className={styles.rerunOpportunity}>
            <DisclosureComponent
              componentId={`rerun-disclosure-${run.id}`}
              title={disclosureTitle}
              // Get expanded state from the state object
              expanded={!!expandedStates[run.id]} // Use !! to ensure boolean
              onClick={() => toggleDisclosure(run.id)} // Use the new toggle function
              disclosureContainerView={
                <>
                  {/* Action Button */}
                  <div className={styles.actionHeader}>
                    <button
                      className={styles.rerunButton}
                      disabled={totalReports === 0}
                      onClick={() => onRerunClick(run)}
                      aria-label={buttonAriaLabel}
                    >
                      Start Updates
                    </button>
                  </div>

                  {/* Table */}
                  <div className={styles.reportTableContainer}>
                    <table
                      className={`${styles.reportTable} ${styles.themeTable}`}
                    >
                      {' '}
                      {/* Use themeTable for base styles */}
                      <caption
                        className={styles.reportTableCaption}
                      >{`Reports generated from prior ${run.botName} versions`}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{`${run.botName} Version`}</th>
                          <th scope="col">Test Plan</th>
                          <th scope="col">Version Released</th>
                          <th scope="col">Browser</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flatReports.map((report, index) => (
                          <tr key={index}>
                            <td>{report.prevVersion}</td>
                            <td>{`${report.testPlanTitle} ${report.testPlanVersionString}`}</td>
                            <td>
                              {convertStringFormatToAnotherFormat(
                                report.releasedAt,
                                'YYYY-MM-DDTHH:mm:ss.SSSZ', // Assume ISO
                                'D MMM YYYY' // Display format
                              )}
                            </td>
                            <td>{report.browserName}</td>
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
