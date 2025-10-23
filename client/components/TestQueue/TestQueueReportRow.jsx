import React, { useCallback } from 'react';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import { TEST_QUEUE_EXPANDED_ROW_QUERY } from './queries';
import { AtVersion, BrowserVersion } from '../common/AtBrowserVersion';
import RowStatus from './RowStatus';
import AssignTesters from './AssignTesters';
import Actions from './Actions';
import BotRunTestStatusList from '../BotRunTestStatusList';
import pillStyles from '../common/VersionString/VersionString.module.css';
import styles from './TestQueue.module.css';

const TestQueueReportRow = ({
  testPlan,
  testPlanVersion,
  testPlanReport,
  me,
  testers
}) => {
  const { data, refetch } = useQuery(TEST_QUEUE_EXPANDED_ROW_QUERY, {
    variables: { testPlanReportId: testPlanReport.id }
  });

  const isDataLoaded = !!data?.testPlanReport;

  const expandedReport = isDataLoaded
    ? data.testPlanReport
    : {
        ...testPlanReport,
        draftTestPlanRuns: []
      };

  const hasBotRun = expandedReport.draftTestPlanRuns?.some(
    ({ tester }) => tester?.isBot
  );

  const handleMutationComplete = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <tr>
      <td>
        <AtVersion
          at={testPlanReport.at}
          minimumAtVersion={testPlanReport.minimumAtVersion}
          exactAtVersion={testPlanReport.exactAtVersion}
        />
      </td>
      <td>
        <BrowserVersion browser={testPlanReport.browser} />
      </td>
      <td>
        {isDataLoaded ? (
          <AssignTesters
            me={me}
            testers={testers}
            testPlanReport={expandedReport}
            triggerUpdate={handleMutationComplete}
          />
        ) : null}
      </td>
      <td>
        <div className={styles.statusContainer}>
          {isDataLoaded ? (
            <>
              <RowStatus
                testPlanVersion={testPlanVersion}
                testPlanReport={expandedReport}
                shouldPoll={!!hasBotRun}
              />
              {expandedReport.onHold ? (
                <span
                  className={`${pillStyles.styledPill} ${pillStyles.autoWidth}`}
                >
                  On hold
                </span>
              ) : null}
              {hasBotRun ? (
                <BotRunTestStatusList testPlanReportId={testPlanReport.id} />
              ) : null}
            </>
          ) : null}
        </div>
      </td>
      <td>
        {isDataLoaded ? (
          <Actions
            me={me}
            testers={testers}
            testPlan={testPlan}
            testPlanReport={expandedReport}
            triggerUpdate={handleMutationComplete}
          />
        ) : null}
      </td>
    </tr>
  );
};

TestQueueReportRow.propTypes = {
  testPlan: PropTypes.object.isRequired,
  testPlanVersion: PropTypes.object.isRequired,
  testPlanReport: PropTypes.object.isRequired,
  me: PropTypes.object,
  testers: PropTypes.array.isRequired
};

export default TestQueueReportRow;
