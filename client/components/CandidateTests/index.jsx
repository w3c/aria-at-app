import React from 'react';
import { useQuery } from '@apollo/client';
import { Route, Routes, Navigate } from 'react-router';
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
        <Routes>
            <Route
                exact
                path="/candidate-tests"
                children={
                    <TestPlans
                        testPlanReports={data.testPlanReports}
                        triggerPageUpdate={refetch}
                    />
                }
            />
            <Navigate to="/404" />
        </Routes>
    );
};

export default CandidateTests;
