import React from 'react';
import { convertDateToString } from '../../utils/formatter';

export const getTestersRunHistory = (
  testPlanReport,
  testId,
  draftTestPlanRuns = []
) => {
  const { id: testPlanReportId, at, browser } = testPlanReport;
  let lines = [];

  draftTestPlanRuns.forEach(draftTestPlanRun => {
    const { testPlanReport, testResults, tester } = draftTestPlanRun;

    const testResult = testResults.find(item => item.test.id === testId);
    if (testPlanReportId === testPlanReport.id && testResult?.completedAt) {
      lines.push(
        <li
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
          on {convertDateToString(testResult.completedAt, 'MMMM DD, YYYY')}.
        </li>
      );
    }
  });

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
