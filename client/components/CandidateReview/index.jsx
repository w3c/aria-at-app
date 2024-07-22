import React from 'react';
import { useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import TestPlans from './TestPlans';
import { CANDIDATE_REVIEW_PAGE_QUERY } from './queries';

const CandidateReview = () => {
  const { loading, data, error } = useQuery(CANDIDATE_REVIEW_PAGE_QUERY, {
    fetchPolicy: 'cache-and-network'
  });

  if (error) {
    return (
      <PageStatus
        title="Candidate Review | ARIA-AT"
        heading="Candidate Review"
        message={error.message}
        isError
      />
    );
  }

  if (loading) {
    return (
      <PageStatus
        title="Loading - Candidate Review | ARIA-AT"
        heading="Candidate Review"
      />
    );
  }

  if (!data) return null;

  const testPlanVersions = data.testPlanVersions;

  return <TestPlans testPlanVersions={testPlanVersions} />;
};

export default CandidateReview;
