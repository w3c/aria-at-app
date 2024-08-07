import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import styled from '@emotion/styled';
import alphabetizeObjectBy from '../../utils/alphabetizeObjectBy';
import { derivePhaseName } from '../../utils/aria';
import { none } from './None';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import ClippedProgressBar from '@components/common/ClippedProgressBar';
import { TestPlanVersionPropType } from '../common/proptypes';

const FullHeightContainer = styled(Container)`
  min-height: calc(100vh - 64px);
`;

const PhaseText = styled.span`
  font-size: 12px;
  margin-left: 6px;
  padding: 4px 6px;
  border-radius: 12px;
  overflow: hidden;
  white-space: nowrap;
  color: white;

  &.candidate {
    background: #f87f1b;
  }

  &.recommended {
    background: #b253f8;
  }
`;

const SummarizeTestPlanReports = ({ testPlanVersions }) => {
  if (!testPlanVersions.length) {
    return (
      <FullHeightContainer id="main" as="main" tabIndex="-1">
        <Helmet>
          <title>AT Interop Reports | ARIA-AT</title>
        </Helmet>
        <h1>Assistive Technology Interoperability Reports</h1>
        <p>There are no results to show just yet. Please check back soon!</p>
      </FullHeightContainer>
    );
  }

  let testPlanTargetsById = {};
  testPlanVersions.forEach(testPlanVersion => {
    const { testPlanReports } = testPlanVersion;

    testPlanReports.forEach(testPlanReport => {
      const { at, browser } = testPlanReport;
      // Construct testPlanTarget
      const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
      testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
    });
  });
  testPlanTargetsById = alphabetizeObjectBy(testPlanTargetsById, keyValue =>
    getTestPlanTargetTitle(keyValue[1])
  );

  return (
    <FullHeightContainer id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>AT Interop Reports | ARIA-AT</title>
      </Helmet>
      <h1>Assistive Technology Interoperability Reports</h1>
      <h2>Introduction</h2>
      <p>
        This page offers a high-level view of all results which have been
        collected, reviewed and published by the ARIA-AT project. Follow a link
        in the table below to view detailed results.
      </p>
      <h2>Support Levels</h2>
      <p id="support-levels-table-description">
        The percentage of assertions which passed when each Test Plan was
        executed by a given Assistive Technology and Browser.
      </p>
      <Table bordered responsive aria-label="Support Levels">
        <thead>
          <tr>
            <th>Test Plan</th>
            {Object.values(testPlanTargetsById).map(testPlanTarget => (
              <th key={testPlanTarget.id}>
                {getTestPlanTargetTitle(testPlanTarget)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(testPlanVersions)
            .sort((a, b) => (a.title < b.title ? -1 : 1))
            .map(testPlanVersion => {
              const phase = testPlanVersion.phase;
              const testPlanReports = testPlanVersion.testPlanReports;

              return (
                <tr key={testPlanVersion.id}>
                  <td>
                    <Link
                      to={`/report/${testPlanVersion.id}`}
                      aria-label={`${getTestPlanVersionTitle(
                        testPlanVersion
                      )}, ${phase} report`}
                    >
                      {getTestPlanVersionTitle(testPlanVersion)}
                    </Link>
                    <PhaseText className={phase.toLowerCase()} aria-hidden>
                      {derivePhaseName(phase)}
                    </PhaseText>
                  </td>
                  {Object.values(testPlanTargetsById).map(testPlanTarget => {
                    const testPlanReport = testPlanReports.find(
                      testPlanReport =>
                        testPlanReport.at.id === testPlanTarget.at.id &&
                        testPlanReport.browser.id === testPlanTarget.browser.id
                    );

                    if (!testPlanReport) {
                      return (
                        <td key={`${testPlanVersion.id}-${testPlanTarget.id}`}>
                          {none}
                        </td>
                      );
                    }
                    const metrics = testPlanReport.metrics;
                    return (
                      <td key={testPlanReport.id}>
                        <Link
                          to={
                            `/report/${testPlanVersion.id}` +
                            `/targets/${testPlanReport.id}`
                          }
                          aria-label={`${metrics.supportPercent}%`}
                        >
                          <ClippedProgressBar
                            progress={metrics.supportPercent}
                          />
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </Table>
    </FullHeightContainer>
  );
};

SummarizeTestPlanReports.propTypes = {
  testPlanVersions: PropTypes.arrayOf(TestPlanVersionPropType).isRequired
};

export default SummarizeTestPlanReports;
