import { useQuery } from '@apollo/client';
import React, { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { TEST_QUEUE_CONFLICTS_PAGE_QUERY } from '../queries';
import PageStatus from '../../common/PageStatus';
import DisclosureComponent from '../../common/DisclosureComponent';
import ConflictSummaryTable from './ConflictSummaryTable';

const TestQueueConflicts = () => {
  const [openDisclosures, setOpenDisclosures] = useState([]);
  const { testPlanReportId } = useParams();
  const { data, error, loading } = useQuery(TEST_QUEUE_CONFLICTS_PAGE_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: {
      testPlanReportId: testPlanReportId
    }
  });

  useEffect(() => {
    if (data) {
      setOpenDisclosures(data.testPlanReport.conflicts.map(() => false));
    }
  }, [data]);

  const disclosureLabels = useMemo(() => {
    return data?.testPlanReport?.conflicts?.map(conflict => {
      const testIndex = data.testPlanReport.runnableTests.findIndex(
        test => test.id === conflict.conflictingResults[0].test.id
      );
      return `Test ${testIndex + 1}: ${
        conflict.conflictingResults[0].test.title
      }`;
    });
  }, [data?.testPlanReport?.conflicts]);

  const disclosureContents = useMemo(() => {
    return data?.testPlanReport?.conflicts?.map(conflict => {
      return (
        <ConflictSummaryTable
          key={conflict.conflictingResults[0].test.id}
          conflictingResults={conflict.conflictingResults}
        />
      );
    });
  }, [data?.testPlanReport?.conflicts]);

  const disclosureClickHandlers = useMemo(() => {
    return data?.testPlanReport?.conflicts?.map((_, index) => () => {
      setOpenDisclosures(prevState => {
        const newOpenDisclosures = [...prevState];
        newOpenDisclosures[index] = !newOpenDisclosures[index];
        return newOpenDisclosures;
      });
    });
  }, [data?.testPlanReport?.conflicts]);

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
  const { name: requiredAtVersionName } =
    data?.testPlanReport.requiredAtVersion ?? {};
  const { name: minimumAtVersionName } =
    data?.testPlanReport.minimumAtVersion ?? {};

  return (
    <Container id="main" as="main" tabIndex="-1">
      <Helmet>
        <title>
          Conflicts {title} {versionString} | ARIA-AT
        </title>
      </Helmet>
      <h1>
        Conflicts:{' '}
        <a href={`/test-review/${testPlanVersionId}`}>
          {title} {versionString}
        </a>{' '}
        using {browserName} and {atName}
        {requiredAtVersionName
          ? ` (${requiredAtVersionName})`
          : ` (${minimumAtVersionName} and above)`}
      </h1>
      <p>
        There are currently {data?.testPlanReport?.conflicts?.length} conflicts.
      </p>
      <DisclosureComponent
        title={disclosureLabels}
        stacked
        onClick={disclosureClickHandlers}
        disclosureContainerView={disclosureContents}
        expanded={openDisclosures}
      />
    </Container>
  );
};

export default TestQueueConflicts;
