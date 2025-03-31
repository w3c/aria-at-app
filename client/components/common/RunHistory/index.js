import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { dates } from 'shared';
import { TestPlanReportPropType } from '../proptypes';
import styles from './RunHistory.module.css';

const RunHistory = ({ testPlanReports, testId }) => {
  if (!testPlanReports || testPlanReports.length === 0) {
    return null;
  }

  const lines = useMemo(() => {
    const l = [];
    for (const testPlanReport of testPlanReports) {
      const { draftTestPlanRuns, at, browser } = testPlanReport;
      for (const draftTestPlanRun of draftTestPlanRuns) {
        const { testResults, tester } = draftTestPlanRun;
        const testResult = testResults.find(item => item.test.id === testId);
        if (testResult?.completedAt) {
          l.push(
            <li
              className={styles.runHistoryItem}
              key={`${testResult.atVersion.id}-${testResult.browserVersion.id}-${testResult.test.id}-${tester.username}`}
            >
              Tested with{' '}
              <b>
                {at.name} {testResult.atVersion.name}
              </b>{' '}
              and{' '}
              <b>
                {browser.name} {testResult.browserVersion.name}
              </b>{' '}
              by{' '}
              <b>
                <a href={`https://github.com/${tester.username}`}>
                  {tester.username}
                </a>
              </b>{' '}
              on{' '}
              {dates.convertDateToString(
                testResult.completedAt,
                'MMMM DD, YYYY'
              )}
              .
            </li>
          );
        }
      }
    }
    return l;
  }, [testPlanReports, testId]);

  if (lines.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        marginBottom: '0'
      }}
    >
      {lines}
    </ul>
  );
};

RunHistory.propTypes = {
  testPlanReports: PropTypes.arrayOf(TestPlanReportPropType),
  testId: PropTypes.string
};

export default RunHistory;
