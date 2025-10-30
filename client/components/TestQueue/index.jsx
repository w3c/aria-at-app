import React, { Fragment, useRef, useState, useMemo } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import { TEST_QUEUE_PAGE_QUERY } from './queries';
import { Alert, Container, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { evaluateAuth } from '../../utils/evaluateAuth';
import ManageTestQueue from '../ManageTestQueue';
import DisclosureComponent from '../common/DisclosureComponent';
import useForceUpdate from '../../hooks/useForceUpdate';
import VersionString from '../common/VersionString';
import PhasePill from '../common/PhasePill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import TestPlanReportStatusDialogWithButton from '../TestPlanReportStatusDialog/WithButton';
import { AtVersion, BrowserVersion } from '../common/AtBrowserVersion';
import RowStatus from './RowStatus';
import AssignTesters from './AssignTesters';
import Actions from './Actions';
import BotRunTestStatusList from '../BotRunTestStatusList';
import ReportRerun from '../ReportRerun';
import Tabs from '../common/Tabs';
import FilterButtons from '../common/FilterButtons';
import styles from './TestQueue.module.css';
import pillStyles from '../common/VersionString/VersionString.module.css';
import commonStyles from '../common/styles.module.css';

const FILTER_KEYS = {
  ALL: 'all',
  MANUAL: 'manual',
  AUTOMATED: 'automated'
};

const TestQueue = () => {
  const client = useApolloClient();
  const [totalAutomatedRuns, setTotalAutomatedRuns] = useState(null);
  const [activeFilter, setActiveFilter] = useState(FILTER_KEYS.MANUAL);
  const { data, error, refetch } = useQuery(TEST_QUEUE_PAGE_QUERY, {
    fetchPolicy: 'cache-and-network'
  });

  const openDisclosuresRef = useRef({});
  const forceUpdate = useForceUpdate();

  // Process data for hooks - must be done before any early returns
  const processedData = useMemo(() => {
    if (!data) return { testPlans: [], testers: [] };

    const testPlanVersions = [];
    data.testPlans.forEach(testPlan => {
      // testPlan.directory is needed by ManageTestQueue
      const populatedTestPlanVersions = testPlan.testPlanVersions.map(
        testPlanVersion => ({
          ...testPlanVersion,
          testPlan: { directory: testPlan.directory }
        })
      );
      testPlanVersions.push(...populatedTestPlanVersions);
    });

    // Remove any test plans or test plan versions without reports and sort
    const sortTestPlanVersions = testPlanVersions => {
      return [...testPlanVersions]
        .filter(testPlanVersion => testPlanVersion.testPlanReports.length)
        .sort((a, b) => {
          return b.versionString.localeCompare(a.versionString);
        })
        .map(testPlanVersion => {
          return {
            ...testPlanVersion,
            testPlanReports: sortTestPlanReports(
              testPlanVersion.testPlanReports
            )
          };
        });
    };

    const sortTestPlanReports = testPlanReports => {
      return [...testPlanReports].sort((a, b) => {
        if (a.at.name !== b.at.name) {
          return a.at.name.localeCompare(b.at.name);
        }
        if (a.browser.name !== b.browser.name) {
          return a.browser.name.localeCompare(b.browser.name);
        }
        const dateA = new Date(
          (a.minimumAtVersion ?? a.exactAtVersion).releasedAt
        );
        const dateB = new Date(
          (a.minimumAtVersion ?? a.exactAtVersion).releasedAt
        );
        return dateB - dateA;
      });
    };

    const testPlans = data.testPlans
      .filter(testPlan => {
        for (const testPlanVersion of testPlan.testPlanVersions) {
          if (testPlanVersion.testPlanReports.length) return true;
        }
      })
      .map(testPlan => {
        return {
          ...testPlan,
          testPlanVersions: sortTestPlanVersions(testPlan.testPlanVersions)
        };
      })
      .sort((a, b) => {
        return a.title.localeCompare(b.title);
      });

    const testers = data.users
      .filter(user => user.roles.includes('TESTER'))
      .sort((a, b) => a.username.localeCompare(b.username));

    return { testPlans, testers };
  }, [data]);

  const reportHasRunsMatchingFilter = (testPlanReport, filter) => {
    if (filter === FILTER_KEYS.ALL) return true;
    const runs = testPlanReport.draftTestPlanRuns || [];
    if (runs.length === 0) {
      // Reports with no runs should appear under Manual
      return filter === FILTER_KEYS.MANUAL;
    }
    const anyRerun = runs.some(r => !!r.isRerun);
    const anyManual = runs.some(r => !r.isRerun);
    return filter === FILTER_KEYS.AUTOMATED ? anyRerun : anyManual;
  };

  const filterOptions = useMemo(() => {
    let allCount = 0;
    let manualCount = 0;
    let automatedCount = 0;

    processedData.testPlans.forEach(testPlan => {
      testPlan.testPlanVersions.forEach(testPlanVersion => {
        testPlanVersion.testPlanReports.forEach(testPlanReport => {
          allCount++;
          if (reportHasRunsMatchingFilter(testPlanReport, FILTER_KEYS.MANUAL)) {
            manualCount++;
          }
          if (
            reportHasRunsMatchingFilter(testPlanReport, FILTER_KEYS.AUTOMATED)
          ) {
            automatedCount++;
          }
        });
      });
    });

    return {
      [FILTER_KEYS.ALL]: `All test runs (${allCount})`,
      [FILTER_KEYS.MANUAL]: `Manual test runs (${manualCount})`,
      ...(automatedCount > 0 && {
        [FILTER_KEYS.AUTOMATED]: `Automated updates (${automatedCount})`
      })
    };
  }, [processedData.testPlans]);

  const filteredTestPlans = useMemo(() => {
    if (activeFilter === FILTER_KEYS.ALL) return processedData.testPlans;

    return processedData.testPlans
      .map(testPlan => {
        const filteredVersions = testPlan.testPlanVersions
          .map(testPlanVersion => {
            const filteredReports = testPlanVersion.testPlanReports.filter(
              testPlanReport =>
                reportHasRunsMatchingFilter(testPlanReport, activeFilter)
            );

            return {
              ...testPlanVersion,
              testPlanReports: filteredReports
            };
          })
          .filter(
            testPlanVersion => testPlanVersion.testPlanReports.length > 0
          );

        return {
          ...testPlan,
          testPlanVersions: filteredVersions
        };
      })
      .filter(testPlan => testPlan.testPlanVersions.length > 0);
  }, [processedData.testPlans, activeFilter]);

  if (error) {
    return (
      <PageStatus
        title="Test Queue | ARIA-AT"
        heading="Test Queue"
        message={error.message}
        isError
      />
    );
  }

  if (!data) {
    return (
      <PageStatus title="Loading - Test Queue | ARIA-AT" heading="Test Queue" />
    );
  }

  const isSignedIn = !!data.me;

  const { isAdmin } = evaluateAuth(data.me);

  // Use processed data from useMemo hooks
  const { testPlans, testers } = processedData;

  // Create testPlanVersions for ManageTestQueue component
  const testPlanVersions = testPlans.flatMap(testPlan =>
    testPlan.testPlanVersions.map(testPlanVersion => ({
      ...testPlanVersion,
      testPlan: { directory: testPlan.directory }
    }))
  );

  const renderTestPlanDisclosure = ({ testPlan }) => {
    return (
      // TODO: fix the aria-label of this
      <DisclosureComponent
        className={styles.testPlanDisclosure}
        componentId={testPlan.directory}
        title={testPlan.testPlanVersions.map(testPlanVersion => (
          <>
            <VersionString
              iconColor="var(--positive-green)"
              fullWidth={false}
              autoWidth={false}
            >
              {testPlanVersion.versionString}
            </VersionString>
            &nbsp;
            <PhasePill fullWidth={false}>{testPlanVersion.phase}</PhasePill>
            {activeFilter === FILTER_KEYS.AUTOMATED && (
              <span className={styles.automatedTag}>(automated re-run)</span>
            )}
          </>
        ))}
        onClick={testPlan.testPlanVersions.map(testPlanVersion => () => {
          const isOpen = openDisclosuresRef.current[testPlanVersion.id];
          openDisclosuresRef.current[testPlanVersion.id] = !isOpen;
          forceUpdate();
        })}
        expanded={testPlan.testPlanVersions.map(
          testPlanVersion =>
            openDisclosuresRef.current[testPlanVersion.id] || false
        )}
        disclosureContainerView={testPlan.testPlanVersions.map(
          testPlanVersion =>
            renderDisclosureContent({ testPlan, testPlanVersion })
        )}
      />
    );
  };

  const renderDisclosureContent = ({ testPlan, testPlanVersion }) => {
    return (
      <>
        <div className={styles.metadataContainer}>
          <a href={`/test-review/${testPlanVersion.id}`}>
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              size="xs"
              className={commonStyles.darkGray}
            />
            View tests in {testPlanVersion.versionString}
          </a>
          <TestPlanReportStatusDialogWithButton
            triggerUpdate={refetch}
            testPlanVersionId={testPlanVersion.id}
          />
        </div>
        <Table
          aria-label={
            `Reports for ${testPlanVersion.title} ` +
            `${testPlanVersion.versionString} in ` +
            `${testPlanVersion.phase.toLowerCase()} phase`
          }
          bordered
          responsive
          hover={false}
          className={styles.testQueue}
        >
          <thead>
            <tr>
              <th>Assistive Technology</th>
              <th>Browser</th>
              <th>Testers</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testPlanVersion.testPlanReports.map(testPlanReport =>
              renderRow({
                testPlan,
                testPlanVersion,
                testPlanReport
              })
            )}
          </tbody>
        </Table>
      </>
    );
  };

  const renderRow = ({ testPlan, testPlanVersion, testPlanReport }) => {
    const hasBotRun = testPlanReport.draftTestPlanRuns?.some(
      ({ tester }) => tester.isBot
    );

    const shouldPollPercent = testPlanReport.draftTestPlanRuns?.some(
      run => run.collectionJob
    );

    return (
      <tr key={testPlanReport.id}>
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
          <AssignTesters
            me={data.me}
            testers={testers}
            testPlanReport={testPlanReport}
          />
        </td>
        <td>
          <div className={styles.statusContainer}>
            <RowStatus
              testPlanVersion={testPlanVersion}
              testPlanReport={testPlanReport}
              shouldPoll={!!shouldPollPercent}
            />
            {testPlanReport.onHold ? (
              <span
                className={`${pillStyles.styledPill} ${pillStyles.autoWidth}`}
              >
                On hold
              </span>
            ) : null}
            {hasBotRun ? (
              <BotRunTestStatusList testPlanReportId={testPlanReport.id} />
            ) : null}
          </div>
        </td>
        <td>
          <Actions
            me={data.me}
            testers={testers}
            testPlan={testPlan}
            testPlanReport={testPlanReport}
            triggerUpdate={async () => {
              await client.refetchQueries({
                include: ['TestQueuePage', 'TestPlanReportStatusDialog']
              });

              // Refocus on testers assignment dropdown button
              const selector = `#assign-testers-${testPlanReport.id} button`;
              const element = document.querySelector(selector);
              if (element) {
                element.focus();
              }
            }}
          />
        </td>
      </tr>
    );
  };

  const renderNoReportsMessage = () => {
    if (isAdmin) {
      return (
        <>
          <h2 data-testid="no-test-plans">
            There are currently no test plan reports available.
          </h2>
          <Alert variant="danger" data-testid="add-test-plans-queue">
            Add a Test Plan to the Queue
          </Alert>
        </>
      );
    } else {
      return (
        <h2 data-testid="no-test-plans">
          There are currently no test plan reports available.
        </h2>
      );
    }
  };

  const hasTestPlanReports = !!testPlans.length;

  const renderQueueContent = () => (
    <div className={styles.tabContentPadding}>
      {hasTestPlanReports && (
        <p data-testid="test-queue-instructions">
          {isAdmin
            ? 'Manage the test plans, assign yourself a test plan or start executing one that is already assigned to you.'
            : isSignedIn
            ? 'Assign yourself a test plan or start executing one that is already assigned to you.'
            : 'Select a test plan to view. Your results will not be saved.'}
        </p>
      )}

      {hasTestPlanReports && (
        <FilterButtons
          filterLabel="Filter test runs by type"
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {isAdmin && (
        <ManageTestQueue
          ats={data.ats}
          testPlanVersions={testPlanVersions}
          triggerUpdate={refetch}
        />
      )}

      {!filteredTestPlans.length ? renderNoReportsMessage() : null}

      {filteredTestPlans.length
        ? filteredTestPlans.map(testPlan => (
            <Fragment key={testPlan.directory}>
              <h2 tabIndex="-1" id={testPlan.directory}>
                {testPlan.title}
              </h2>
              {renderTestPlanDisclosure({ testPlan })}
            </Fragment>
          ))
        : null}
    </div>
  );

  const tabs = [
    {
      label: 'Manual Test Queue',
      tabKey: 'manual',
      content: renderQueueContent()
    },
    {
      tabKey: 'automated',
      get label() {
        return `Automated Report Updates${
          typeof totalAutomatedRuns === 'number'
            ? ` (${totalAutomatedRuns})`
            : ''
        }`;
      },
      content: (
        <div className={styles.tabContentPadding}>
          <ReportRerun
            onQueueUpdate={refetch}
            onTotalRunsAvailable={setTotalAutomatedRuns}
          />
        </div>
      )
    }
  ];

  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>Test Queue | ARIA-AT</title>
      </Helmet>
      <h1 className="test-queue-heading">Test Queue</h1>
      <Tabs tabs={tabs} />
    </Container>
  );
};

export default TestQueue;
