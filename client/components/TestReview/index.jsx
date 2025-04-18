import React, { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_REVIEW_PAGE_QUERY } from './queries';
import { Container } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageStatus from '../common/PageStatus';
import InstructionsRenderer from '../CandidateReview/CandidateTestPlanRun/InstructionsRenderer';
import FilterButtons from '../common/FilterButtons';
import { derivePhaseName } from '../../utils/aria';
import { dates } from 'shared';
import supportJson from '../../resources/support.json';
import SortableIssuesTable from '../SortableIssuesTable';
import createIssueLink from '../../utils/createIssueLink';
import styles from './TestReview.module.css';
import commonStyles from '../common/styles.module.css';

const TestReview = () => {
  const location = useLocation();
  const { testPlanVersionId } = useParams();

  const { loading, data, error } = useQuery(TEST_REVIEW_PAGE_QUERY, {
    variables: { testPlanVersionId },
    fetchPolicy: 'cache-and-network'
  });
  const [activeFilter, setActiveFilter] = useState('All ATs');

  // GraphQL results are read only so they need to be cloned
  // before passing to SortableIssuesTable
  const issues = useMemo(() => {
    return data ? [...data.testPlanVersion.testPlan.issues] : [];
  }, [data]);

  if (loading) {
    return (
      <PageStatus
        title="Loading - Test Plan Version | ARIA-AT"
        heading="Test Plan Version"
      />
    );
  }
  if (error || !data?.testPlanVersion) {
    const errorMessage =
      error?.message ??
      `Failed to find a test plan version with ID ${testPlanVersionId}`;
    return (
      <PageStatus
        title="Test Plan Version | ARIA-AT"
        heading="Test Plan Version"
        message={errorMessage}
        isError
      />
    );
  }
  const testPlanVersion = data.testPlanVersion;
  const atNames = supportJson.ats.map(at => at.name);
  const isV2 = testPlanVersion.metadata.testFormatVersion === 2;

  let testPlanVersionTests;
  if (isV2) {
    testPlanVersionTests = [];
    testPlanVersion.tests.forEach(test => {
      const testIndex = testPlanVersionTests.findIndex(
        el => el.title === test.title
      );

      if (testIndex < 0) testPlanVersionTests.push(test);
      else {
        testPlanVersionTests[testIndex] = {
          ...testPlanVersionTests[testIndex],
          id: `${testPlanVersionTests[testIndex].id}${test.id}`,
          ats: [...testPlanVersionTests[testIndex].ats, ...test.ats],
          renderableContents: [
            ...testPlanVersionTests[testIndex].renderableContents,
            ...test.renderableContents
          ],
          renderedUrls: [
            ...testPlanVersionTests[testIndex].renderedUrls,
            ...test.renderedUrls
          ]
        };
      }
    });
  } else {
    testPlanVersionTests = testPlanVersion.tests;
  }

  let filteredTests;
  if (activeFilter === 'All ATs') {
    filteredTests = testPlanVersionTests;
  } else {
    filteredTests = testPlanVersionTests.filter(test =>
      test.ats.find(at => at.name === activeFilter)
    );
  }

  const filterOptions = Object.fromEntries(
    ['All ATs', ...atNames].map(key => {
      let count;
      if (key === 'All ATs') {
        count = testPlanVersionTests.length;
      } else {
        count = testPlanVersionTests.filter(test =>
          test.ats.find(at => at.name === key)
        ).length;
      }
      return [key, `${key} (${count})`];
    })
  );

  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>{`${testPlanVersion.title} Test Plan ${testPlanVersion.versionString} | ARIA-AT`}</title>
      </Helmet>
      <h1>
        {`${testPlanVersion.title} Test Plan ` +
          `${testPlanVersion.versionString}` +
          `${testPlanVersion.deprecatedAt ? ' (Deprecated)' : ''}`}
      </h1>
      <h2>About This Test Plan</h2>
      <ul>
        <li>
          <strong>Phase:&nbsp;</strong>
          {derivePhaseName(testPlanVersion.phase)}
        </li>
        <li>
          <strong>Version:&nbsp;</strong>
          {`${testPlanVersion.versionString} `}
          <Link to={`/data-management/${testPlanVersion.testPlan.directory}`}>
            (View all versions of this test plan)
          </Link>
        </li>
        <li>
          <strong>Version History:&nbsp;</strong>
          <ul className={commonStyles.bulletList}>
            <li>
              {`R&D completed on ${dates.convertDateToString(
                testPlanVersion.updatedAt,
                'MMM D, YYYY'
              )}.`}
            </li>
            {!testPlanVersion.draftPhaseReachedAt ? null : (
              <li>
                {`ARIA-AT draft review process started on ` +
                  `${dates.convertDateToString(
                    testPlanVersion.draftPhaseReachedAt,
                    'MMM D, YYYY'
                  )} ` +
                  `for this version.`}
              </li>
            )}
            {!testPlanVersion.candidatePhaseReachedAt ? null : (
              <li>
                {`ARIA-AT candidate review process started on ` +
                  `${dates.convertDateToString(
                    testPlanVersion.candidatePhaseReachedAt,
                    'MMM D, YYYY'
                  )} ` +
                  `for this version.`}
              </li>
            )}
            {!testPlanVersion.recommendedPhaseReachedAt ? null : (
              <li>
                {`Version reached ARIA-AT recommended status on ` +
                  `${dates.convertDateToString(
                    testPlanVersion.recommendedPhaseReachedAt,
                    'MMM D, YYYY'
                  )}.`}
              </li>
            )}
            {!testPlanVersion.deprecatedAt ? null : (
              <li>
                {`Version deprecated on ` +
                  `${dates.convertDateToString(
                    testPlanVersion.deprecatedAt,
                    'MMM D, YYYY'
                  )}.`}
              </li>
            )}
          </ul>
        </li>
        <li>
          <strong>Latest Commit:&nbsp;</strong>
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://github.com/w3c/aria-at/commit/${testPlanVersion.gitSha}`}
          >
            {testPlanVersion.gitMessage}
          </a>
        </li>
      </ul>

      <h2>Supporting Documentation</h2>
      <ul>
        {testPlanVersionTests[0].renderableContents[0].renderableContent.info.references.map(
          reference => {
            if (isV2) {
              let refValue = '';
              let refLinkText = '';
              if (
                reference.refId === 'example' ||
                reference.refId === 'designPattern' ||
                reference.refId === 'developmentDocumentation'
              ) {
                refValue = reference.value;
                refLinkText = reference.linkText;
              }
              return refValue ? (
                <li key={refValue}>
                  <a href={refValue} rel="noreferrer" target="_blank">
                    {refLinkText}
                  </a>
                </li>
              ) : null;
            } else {
              return (
                <li key={reference.value}>
                  <a href={reference.value} rel="noreferrer" target="_blank">
                    {reference.refId}
                  </a>
                </li>
              );
            }
          }
        )}
      </ul>
      <SortableIssuesTable
        issues={issues}
        issueLink={createIssueLink({
          testPlanTitle: testPlanVersion.title,
          testPlanDirectory: testPlanVersion.testPlan.directory,
          versionString: testPlanVersion.versionString,
          testReviewLink: `https://aria-at-.w3.org${location.pathname}`,
          versionPhase: testPlanVersion.versionPhase
        })}
      />
      <h2>Tests</h2>
      <div className={styles.filterButtonsContainer}>
        <FilterButtons
          filterLabel="Filter tests by covered AT"
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={selectedFilter => {
            setActiveFilter(selectedFilter);
          }}
        />
      </div>
      {filteredTests.map((test, index) => {
        const isFirst = index === 0;
        const hasAriaReference =
          test.renderableContents[0].renderableContent.info.references.some(
            reference => reference.type === 'aria'
          );

        let filteredAts;
        if (activeFilter === 'All ATs') {
          filteredAts = test.ats;
        } else {
          filteredAts = test.ats.filter(at => at.name === activeFilter);
        }

        return (
          <Fragment key={test.id}>
            {isFirst ? null : <hr />}
            <h3>{`Test ${index + 1}: ${test.title}`}</h3>
            {/* A defined 'aria' type is only available in v2 */}
            {isV2 && hasAriaReference ? (
              <>
                <p>{supportJson.testPlanStrings.ariaSpecsPreface}</p>
                <ul>
                  {test.renderableContents[0].renderableContent.info.references.map(
                    reference => {
                      let refValue = '';
                      let refLinkText = '';
                      if (reference.type === 'aria') {
                        refValue = reference.value;
                        refLinkText = reference.linkText;
                      }
                      return refValue ? (
                        <li key={refValue}>
                          <a href={refValue} rel="noreferrer" target="_blank">
                            {refLinkText}
                          </a>
                        </li>
                      ) : null;
                    }
                  )}
                </ul>
              </>
            ) : null}
            {filteredAts.map(at => {
              const renderableContent = test.renderableContents.find(
                ({ at: renderableContentAt }) =>
                  at.id === renderableContentAt.id
              ).renderableContent;

              return (
                <Fragment key={at.id}>
                  <h4>{at.name}</h4>
                  <h5>Instructions</h5>
                  <InstructionsRenderer
                    test={{ ...test, renderableContent }}
                    testPageUrl={testPlanVersion.testPageUrl}
                    at={at}
                    headingLevel={5}
                    testFormatVersion={
                      testPlanVersion.metadata.testFormatVersion
                    }
                  />
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </Container>
  );
};

export default TestReview;
