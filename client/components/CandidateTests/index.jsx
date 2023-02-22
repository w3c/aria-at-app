import React from 'react';
import { useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import TestPlans from './TestPlans';
import { CANDIDATE_TESTS_PAGE_QUERY } from './queries';

const CandidateTests = () => {
    const { loading, data, error, refetch } = useQuery(
        CANDIDATE_TESTS_PAGE_QUERY,
        {
            fetchPolicy: 'cache-and-network'
        }
    );

    if (error) {
        return (
            <PageStatus
                title="Candidate Tests | ARIA-AT"
                heading="Candidate Tests"
                message={error.message}
                isError
            />
        );
    }

    if (loading) {
        return (
            <PageStatus
                title="Loading - Candidate Tests | ARIA-AT"
                heading="Candidate Tests"
            />
        );
    }


    if (!data) return null;

    return (
        <TestPlans
            testPlanReports={data.testPlanReports}
            triggerPageUpdate={refetch}
        />
    );
};

export default CandidateTests;
