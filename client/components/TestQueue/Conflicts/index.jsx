import { useQuery } from '@apollo/client';
import React, { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { TEST_QUEUE_CONFLICTS_PAGE_QUERY } from '../queries';
import PageStatus from '../../common/PageStatus';
import DisclosureComponent from '../../common/DisclosureComponent';
import ConflictSummaryTable from './ConflictSummaryTable';
import createIssueLink from '../../../utils/createIssueLink';
import { evaluateAuth } from '../../../utils/evaluateAuth';

const PageContainer = styled(Container)`
  max-width: 1200px;
  padding: 2rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
`;

const MetadataList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 2rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
`;

const MetadataItem = styled.li`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const MetadataLabel = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
  min-width: 200px;
`;

const ConflictCount = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  background-color: #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: inline-block;
`;

const TestQueueConflicts = () => {
  const [openDisclosures, setOpenDisclosures] = useState([]);
  const [uniqueConflictsByAssertion, setUniqueConflictsByAssertion] = useState(
    []
  );

  const { testPlanReportId } = useParams();
  const { data, error, loading } = useQuery(TEST_QUEUE_CONFLICTS_PAGE_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: {
      testPlanReportId: testPlanReportId
    }
  });

  useEffect(() => {
    if (data) {
      // Each conflict per test is counted so it could cause duplicate
      // disclosures
      //
      // eg. tester1 and tester2 marking 2 assertions in test1 the opposite way
      //     would create 2 disclosures
      const createUniqueConflictId = (testId = '', commands = []) =>
        `${testId}-${commands.map(({ text }) => text).join('')}`;

      const uniqueConflictsByAssertions = [];
      data?.testPlanReport?.conflicts?.map(conflict => {
        const conflictId = createUniqueConflictId(
          conflict.conflictingResults[0].test.id,
          conflict.conflictingResults[0].scenario.commands
        );

        if (
          !uniqueConflictsByAssertions.find(
            conflict =>
              createUniqueConflictId(
                conflict.conflictingResults[0].test.id,
                conflict.conflictingResults[0].scenario.commands
              ) === conflictId
          )
        ) {
          uniqueConflictsByAssertions.push(conflict);
        }
      });
      setUniqueConflictsByAssertion(uniqueConflictsByAssertions);
      setOpenDisclosures(uniqueConflictsByAssertions.map(() => false));
    }
  }, [data]);

  const getConflictTestNumberFilteredByAt = conflict => {
    const testIndex = data.testPlanReport.runnableTests.findIndex(
      test => test.id === conflict.conflictingResults[0].test.id
    );
    return testIndex + 1;
  };

  const getIssueLink = conflict => {
    if (!conflict) return;

    const { testPlanVersion } = data.testPlanReport;
    return createIssueLink({
      testPlanTitle: testPlanVersion.title,
      testPlanDirectory: testPlanVersion.testPlan.directory,
      versionString: testPlanVersion.versionString,
      testTitle: conflict.conflictingResults[0].test.title,
      testRowNumber: conflict.conflictingResults[0].test.rowNumber,
      testSequenceNumber: getConflictTestNumberFilteredByAt(conflict),
      testRenderedUrl: conflict.conflictingResults[0].test.renderedUrl,
      atName: data.testPlanReport.at.name,
      browserName: data.testPlanReport.browser.name,
      atVersionName: data.testPlanReport.exactAtVersion?.name
        ? data.testPlanReport.exactAtVersion?.name
        : `${data.testPlanReport.minimumAtVersion?.name} and above`
    });
  };

  const { isAdmin } = useMemo(() => evaluateAuth(data?.me), [data?.me]);

  const disclosureLabels = useMemo(() => {
    return uniqueConflictsByAssertion.map(conflict => {
      const testIndex = getConflictTestNumberFilteredByAt(conflict);
      return `Test ${testIndex}: ${
        conflict.conflictingResults[0].test.title
      } (${conflict.conflictingResults[0].scenario.commands
        .map(({ text }) => text)
        .join(' then ')})`;
    });
  }, [uniqueConflictsByAssertion]);

  const disclosureContents = useMemo(() => {
    return uniqueConflictsByAssertion.map(conflict => {
      const issues = data?.testPlanReport?.issues?.filter(
        issue =>
          issue.testNumberFilteredByAt ===
          getConflictTestNumberFilteredByAt(conflict)
      );
      return (
        <ConflictSummaryTable
          issues={issues}
          issueLink={getIssueLink(conflict)}
          isAdmin={isAdmin}
          key={conflict.conflictingResults[0].test.id}
          conflictingResults={conflict.conflictingResults}
          testIndex={getConflictTestNumberFilteredByAt(conflict)}
        />
      );
    });
  }, [uniqueConflictsByAssertion]);

  const disclosureClickHandlers = useMemo(() => {
    return uniqueConflictsByAssertion.map((_, index) => () => {
      setOpenDisclosures(prevState => {
        const newOpenDisclosures = [...prevState];
        newOpenDisclosures[index] = !newOpenDisclosures[index];
        return newOpenDisclosures;
      });
    });
  }, [uniqueConflictsByAssertion]);

  if (error) {
    return (
      <PageStatus
        title="Conflicts | ARIA-AT"
        heading="Conflicts"
        message={error.message}
        isError
      />
    );
  }

  if (loading) {
    return (
      <PageStatus title="Loading - Conflicts | ARIA-AT" heading="Conflicts" />
    );
  }

  const {
    title,
    versionString,
    id: testPlanVersionId
  } = data?.testPlanReport.testPlanVersion ?? {};
  const { name: browserName } = data?.testPlanReport.browser ?? {};
  const { name: atName } = data?.testPlanReport.at ?? {};
  const { name: exactAtVersionName } =
    data?.testPlanReport.exactAtVersion ?? {};
  const { name: minimumAtVersionName } =
    data?.testPlanReport.minimumAtVersion ?? {};

  const uniqueTestsLength = new Set(
    data?.testPlanReport?.conflicts.map(
      conflict => conflict.conflictingResults[0].test.id
    )
  ).size;

  return (
    <PageContainer id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>
          Conflicts {title} {versionString} | ARIA-AT
        </title>
      </Helmet>
      <h1>
        Conflicts for Test Plan Report {title} {versionString}
      </h1>

      <Section>
        <SectionTitle>Introduction</SectionTitle>
        <p>
          This page displays conflicts identified in the current test plan
          report. Conflicts occur when different testers report different
          outcomes for the same test assertions or unexpected behaviors.
        </p>
      </Section>

      <Section>
        <SectionTitle>Test Plan Report</SectionTitle>
        <MetadataList>
          <MetadataItem>
            <MetadataLabel>Test Plan Version:</MetadataLabel>
            <a href={`/test-review/${testPlanVersionId}`}>
              {title} {versionString}
            </a>
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Assistive Technology:</MetadataLabel>
            {atName}
            {exactAtVersionName
              ? ` (${exactAtVersionName})`
              : ` (${minimumAtVersionName} and above)`}
          </MetadataItem>
          <MetadataItem>
            <MetadataLabel>Browser:</MetadataLabel>
            {browserName}
          </MetadataItem>
        </MetadataList>
      </Section>

      <Section>
        <SectionTitle>Conflicts</SectionTitle>
        <ConflictCount>
          There are currently
          <strong> {data?.testPlanReport?.conflicts?.length} conflicts </strong>
          across
          <strong> {uniqueTestsLength} tests </strong>
          and
          <strong> {uniqueConflictsByAssertion.length} assertions </strong>
          for this test plan report.
        </ConflictCount>
        <DisclosureComponent
          title={disclosureLabels}
          stacked
          onClick={disclosureClickHandlers}
          disclosureContainerView={disclosureContents}
          expanded={openDisclosures}
        />
      </Section>
    </PageContainer>
  );
};

export default TestQueueConflicts;
