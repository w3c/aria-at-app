import React from 'react';
import { useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import TestPlans from './TestPlans';
import { CANDIDATE_REVIEW_PAGE_QUERY } from './queries';
import { ME_QUERY } from '../App/queries';

const CandidateReview = () => {
  const { loading, data, error } = useQuery(CANDIDATE_REVIEW_PAGE_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  const { data: meData } = useQuery(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });
  const { me } = meData;

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
  const ats = data.ats;

  return <TestPlans testPlanVersions={testPlanVersions} ats={ats} me={me} />;
};

export default CandidateReview;
