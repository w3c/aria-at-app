import React, { useMemo, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_VERSIONS_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Table } from 'react-bootstrap';
import VersionString from '../common/VersionString';
import PhasePill from '../common/PhasePill';
import { dates } from 'shared';
import { derivePhaseName } from '../../utils/aria';
import {
  faArrowUpRightFromSquare,
  faCodeCommit
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DisclosureComponent from '../common/DisclosureComponent';
import PageSpacer from '../common/PageSpacer';
import useForceUpdate from '../../hooks/useForceUpdate';
import SortableIssuesTable from '../SortableIssuesTable';
import styles from './TestPlanVersionsPage.module.css';
import commonStyles from '../common/styles.module.css';

const TestPlanVersionsPage = () => {
  const params = useParams();
  const testPlanDirectory = params['*']?.replace(/\/$/, '') || '';

  const { loading, data, error } = useQuery(TEST_PLAN_VERSIONS_PAGE_QUERY, {
    variables: { testPlanDirectory },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });
  const forceUpdate = useForceUpdate();

  const expandedVersionSections = useRef();
  const toggleVersionSections = useRef();

  // GraphQL results are read only so they need to be cloned
  // before passing to SortableIssuesTable
  const issues = useMemo(() => {
    return data?.testPlan?.issues ? [...data.testPlan.issues] : [];
  }, [data]);

  if (data && !data.testPlan) {
    return <Navigate to="/404" replace />;
  }

  if (error) {
    return (
      <PageStatus
        title="Test Plan Versions | ARIA-AT"
        heading="Test Plan Versions"
        message={error.message}
        isError
      />
    );
  }

  if (loading) {
    return (
      <PageStatus
        title="Loading - Test Plan Versions | ARIA-AT"
        heading="Test Plan Versions"
      />
    );
  }

  if (!data) return null;

  const getPhaseChangeDate = testPlanVersion => {
    let date;
    switch (testPlanVersion.phase) {
      case 'DRAFT':
        date = testPlanVersion.draftPhaseReachedAt;
        break;
      case 'CANDIDATE':
        date = testPlanVersion.candidatePhaseReachedAt;
        break;
      case 'RECOMMENDED':
        date = testPlanVersion.recommendedPhaseReachedAt;
        break;
      case 'RD':
        date = testPlanVersion.updatedAt;
        break;
      case 'DEPRECATED':
        date = testPlanVersion.deprecatedAt;
        break;
      default:
        throw new Error('Unexpected case');
    }
    return dates.convertDateToString(date, 'MMM D, YYYY');
  };

  const getIconColor = testPlanVersion => {
    return testPlanVersion.phase === 'DEPRECATED' ||
      testPlanVersion.phase === 'RD'
      ? 'var(--negative-gray)'
      : 'var(--positive-green)';
  };

  const getEventDate = testPlanVersion => {
    return dates.convertDateToString(
      (() => {
        if (testPlanVersion.deprecatedAt) {
          return testPlanVersion.deprecatedAt;
        }
        switch (testPlanVersion.phase) {
          case 'RD':
            return testPlanVersion.updatedAt;
          case 'DRAFT':
            return testPlanVersion.draftPhaseReachedAt;
          case 'CANDIDATE':
            return testPlanVersion.candidatePhaseReachedAt;
          case 'RECOMMENDED':
            return testPlanVersion.recommendedPhaseReachedAt;
          case 'DEPRECATED':
            return testPlanVersion.deprecatedAt;
        }
      })(),
      'MMM D, YYYY'
    );
  };

  const getEventBody = phase => {
    const phasePill = <PhasePill fullWidth={false}>{phase}</PhasePill>;

    switch (phase) {
      case 'RD':
        return <>{phasePill} Complete</>;
      case 'DRAFT':
      case 'CANDIDATE':
        return <>{phasePill} Review Started</>;
      case 'RECOMMENDED':
        return <>{phasePill} Approved</>;
      case 'DEPRECATED':
        return <>{phasePill}</>;
    }
  };

  const deriveDeprecatedDuringPhase = testPlanVersion => {
    let derivedPhaseDeprecatedDuring = 'RD';
    if (testPlanVersion.recommendedPhaseReachedAt)
      derivedPhaseDeprecatedDuring = 'RECOMMENDED';
    else if (testPlanVersion.candidatePhaseReachedAt)
      derivedPhaseDeprecatedDuring = 'CANDIDATE';
    else if (testPlanVersion.draftPhaseReachedAt)
      derivedPhaseDeprecatedDuring = 'DRAFT';

    return derivedPhaseDeprecatedDuring;
  };

  const { testPlan, ats } = data;

  const testPlanVersions = testPlan.testPlanVersions.slice().sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const timelineForAllVersions = [];

  testPlanVersions.forEach(testPlanVersion => {
    const event = {
      id: testPlanVersion.id,
      updatedAt: testPlanVersion.updatedAt,
      versionString: testPlanVersion.versionString
    };
    timelineForAllVersions.push({ ...event, phase: 'RD' });

    if (testPlanVersion.draftPhaseReachedAt)
      timelineForAllVersions.push({
        ...event,
        phase: 'DRAFT',
        draftPhaseReachedAt: testPlanVersion.draftPhaseReachedAt
      });
    if (testPlanVersion.candidatePhaseReachedAt)
      timelineForAllVersions.push({
        ...event,
        phase: 'CANDIDATE',
        candidatePhaseReachedAt: testPlanVersion.candidatePhaseReachedAt
      });
    if (testPlanVersion.recommendedPhaseReachedAt)
      timelineForAllVersions.push({
        ...event,
        phase: 'RECOMMENDED',
        recommendedPhaseReachedAt: testPlanVersion.recommendedPhaseReachedAt
      });
    if (testPlanVersion.deprecatedAt)
      timelineForAllVersions.push({
        ...event,
        phase: 'DEPRECATED',
        deprecatedAt: testPlanVersion.deprecatedAt
      });
  });

  const phaseOrder = {
    RD: 0,
    DRAFT: 1,
    CANDIDATE: 2,
    RECOMMENDED: 3,
    DEPRECATED: 4
  };

  timelineForAllVersions.sort((a, b) => {
    const dateA =
      a.recommendedPhaseReachedAt ||
      a.candidatePhaseReachedAt ||
      a.draftPhaseReachedAt ||
      a.deprecatedAt ||
      a.updatedAt;
    const dateB =
      b.recommendedPhaseReachedAt ||
      b.candidatePhaseReachedAt ||
      b.draftPhaseReachedAt ||
      b.deprecatedAt ||
      b.updatedAt;

    // If dates are the same, compare phases
    if (dateA === dateB) return phaseOrder[a.phase] - phaseOrder[b.phase];
    return new Date(dateA) - new Date(dateB);
  });

  if (!expandedVersionSections.current) {
    expandedVersionSections.current = [];
    toggleVersionSections.current = [];

    for (let i = 0; i < testPlanVersions.length; i += 1) {
      expandedVersionSections.current[i] = false;
      toggleVersionSections.current[i] = () => {
        expandedVersionSections.current[i] =
          !expandedVersionSections.current[i];
        forceUpdate();
      };
    }
  }

  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>{testPlan.title} Test Plan Versions | ARIA-AT</title>
      </Helmet>
      <h1>{testPlan.title} Test Plan Versions</h1>
      <div className={styles.pageCommitHistory}>
        <FontAwesomeIcon
          icon={faCodeCommit}
          size="xs"
          className={commonStyles.darkGray}
        />
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://github.com/w3c/aria-at/commits/master/tests/${testPlanDirectory}`}
        >
          Commit History for aria-at/tests/{testPlanDirectory}
        </a>
      </div>
      {!testPlanVersions.length ? null : (
        <>
          <h3
            id="version-summary"
            className={clsx(
              styles.customThemeTableHeader,
              commonStyles.themeTableHeader
            )}
          >
            Version Summary
          </h3>
          <Table
            bordered
            responsive
            aria-labelledby="version-summary"
            className={commonStyles.themeTable}
          >
            <thead>
              <tr>
                <th>Version</th>
                <th>Latest Phase</th>
                <th>Phase Change Date</th>
              </tr>
            </thead>
            <tbody>
              {testPlanVersions.map(testPlanVersion => (
                <tr key={testPlanVersion.id}>
                  <th>
                    <VersionString
                      iconColor={getIconColor(testPlanVersion)}
                      autoWidth={false}
                      linkHref={`/test-review/${testPlanVersion.id}`}
                    >
                      {testPlanVersion.versionString}
                    </VersionString>
                  </th>
                  <td>
                    {(() => {
                      // Gets the derived phase even if deprecated by checking
                      // the known dates on the testPlanVersion object
                      const derivedDeprecatedAtPhase =
                        deriveDeprecatedDuringPhase(testPlanVersion);

                      const phasePill = (
                        <PhasePill fullWidth={false}>
                          {derivedDeprecatedAtPhase}
                        </PhasePill>
                      );

                      if (testPlanVersion.deprecatedAt) {
                        const deprecatedPill = (
                          <PhasePill fullWidth={false}>DEPRECATED</PhasePill>
                        );

                        const draftPill = (
                          <PhasePill fullWidth={false}>DRAFT</PhasePill>
                        );

                        if (derivedDeprecatedAtPhase === 'RD') {
                          return (
                            <>
                              {deprecatedPill}
                              {` before `}
                              {draftPill}
                              {` review `}
                            </>
                          );
                        }

                        if (derivedDeprecatedAtPhase === 'RECOMMENDED') {
                          return (
                            <>
                              {deprecatedPill}
                              {` after being approved as `}
                              {phasePill}
                            </>
                          );
                        }

                        return (
                          <>
                            {deprecatedPill}
                            {` during `}
                            {phasePill}
                            {` review `}
                          </>
                        );
                      }
                      return phasePill;
                    })()}
                  </td>
                  <td>{getPhaseChangeDate(testPlanVersion)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PageSpacer />
        </>
      )}
      <SortableIssuesTable issues={issues} />
      <PageSpacer />
      <h3
        id="timeline-for-all-versions"
        className={clsx(
          styles.customThemeTableHeader,
          commonStyles.themeTableHeader
        )}
      >
        Timeline for All Versions
      </h3>
      <Table
        bordered
        responsive
        aria-labelledby="timeline-for-all-versions"
        className={commonStyles.themeTable}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          {timelineForAllVersions.map(testPlanVersion => {
            const versionString = (
              <VersionString
                iconColor={getIconColor(testPlanVersion)}
                fullWidth={false}
                autoWidth={false}
              >
                {testPlanVersion.versionString}
              </VersionString>
            );

            const eventBody = getEventBody(testPlanVersion.phase);

            return (
              <tr key={`${testPlanVersion.id}-${testPlanVersion.phase}`}>
                <th>{getEventDate(testPlanVersion)}</th>
                <td>
                  {versionString}&nbsp;{eventBody}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <PageSpacer />
      <DisclosureComponent
        className={styles.testPlanVersionsCustomDisclosureComponent}
        componentId="versionHistory"
        title={testPlanVersions.map(testPlanVersion => {
          return (
            <span
              key={testPlanVersion.id}
              aria-label={`${testPlanVersion.versionString} ${derivePhaseName(
                testPlanVersion.phase
              )} on ${getEventDate(testPlanVersion)}`}
            >
              <VersionString
                iconColor={getIconColor(testPlanVersion)}
                fullWidth={false}
                autoWidth={false}
              >
                {testPlanVersion.versionString}
              </VersionString>
              &nbsp;
              <PhasePill fullWidth={false}>{testPlanVersion.phase}</PhasePill>
              &nbsp;on&nbsp;
              {getEventDate(testPlanVersion)}
            </span>
          );
        })}
        disclosureContainerView={testPlanVersions.map(testPlanVersion => {
          const hasFinalReports = testPlanVersion.testPlanReports.some(
            testPlanReport => testPlanReport.isFinal
          );

          return (
            <div key={testPlanVersion.id}>
              <div>
                <ul className={styles.versionsList}>
                  <li>
                    <FontAwesomeIcon
                      icon={faCodeCommit}
                      size="xs"
                      className={commonStyles.darkGray}
                    />
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://github.com/w3c/aria-at/commit/${testPlanVersion.gitSha}`}
                    >
                      Commit {testPlanVersion.gitSha.substr(0, 7)}:{' '}
                      {testPlanVersion.gitMessage}
                    </a>
                  </li>
                  <li>
                    <a href={`/test-review/${testPlanVersion.id}`}>
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        size="xs"
                        className={commonStyles.darkGray}
                      />
                      View tests in {testPlanVersion.versionString}
                    </a>
                  </li>
                  {!hasFinalReports ? null : (
                    <li>
                      <a href={`/report/${testPlanVersion.id}`}>
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          size="xs"
                          className={commonStyles.darkGray}
                        />
                        View reports generated from{' '}
                        {testPlanVersion.versionString}
                      </a>
                    </li>
                  )}
                </ul>
                <dl className={styles.coveredAtList}>
                  <dt>Covered AT</dt>
                  <dd>
                    <ul>
                      {ats.map(at => (
                        <li key={at.id}>{at.name}</li>
                      ))}
                    </ul>
                  </dd>
                </dl>
                <h3
                  id={`timeline-for-${testPlanVersion.versionString}`}
                  className={clsx(
                    styles.customThemeTableHeader,
                    styles.timelineForVersionTitle,
                    commonStyles.themeTableHeader
                  )}
                >
                  Timeline for {testPlanVersion.versionString}
                </h3>
                <Table
                  bordered
                  responsive
                  aria-labelledby={`timeline-for-${testPlanVersion.versionString}`}
                  className={commonStyles.themeTable}
                >
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let events = [
                        ['RD', testPlanVersion.updatedAt],
                        ['DRAFT', testPlanVersion.draftPhaseReachedAt],
                        ['CANDIDATE', testPlanVersion.candidatePhaseReachedAt],
                        [
                          'RECOMMENDED',
                          testPlanVersion.recommendedPhaseReachedAt
                        ],
                        ['DEPRECATED', testPlanVersion.deprecatedAt]
                      ]
                        .filter(event => event[1])
                        .sort((a, b) => {
                          const dateSort = new Date(a[1]) - new Date(b[1]);
                          if (dateSort === 0) return 1; // maintain order above
                          return dateSort;
                        });

                      return events.map(([phase, date]) => (
                        <tr key={phase}>
                          <th>
                            {dates.convertDateToString(date, 'MMM D, YYYY')}
                          </th>
                          <td>{getEventBody(phase)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </Table>
              </div>
            </div>
          );
        })}
        onClick={toggleVersionSections.current}
        expanded={expandedVersionSections.current}
        headingLevel="2"
      />
    </Container>
  );
};

export default TestPlanVersionsPage;
