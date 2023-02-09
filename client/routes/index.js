import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import ConfirmAuth from '@components/ConfirmAuth';
import Home from '@components/Home';
import InvalidRequest from '@components/InvalidRequest';
import NotFound from '@components/NotFound';
import { Reports, Report } from '@components/Reports';
import CandidateTests from '@components/CandidateTests';
import SignupInstructions from '@components/SignupInstructions';
import TestQueue from '@components/TestQueue';
import TestRun from '@components/TestRun';
import UserSettings from '@components/UserSettings';
import CandidateTestPlanRun from '@components/CandidateTests/CandidateTestPlanRun';
// import TestManagement from '@components/TestManagement';

export default [
    {
        path: '/',
        exact: true,
        element: <Home />
    },
    {
        path: '/signup-instructions',
        exact: true,
        element: <SignupInstructions />
    },
    {
        path: '/account/settings',
        exact: true,
        element: (
            <ConfirmAuth requiredPermission="TESTER">
                <UserSettings />
            </ConfirmAuth>
        )
    },
    {
        path: '/candidate-test-plan/:testPlanVersionId(\\d+)/:atId',
        element: (
            <ConfirmAuth requiredPermission="VENDOR">
                <CandidateTestPlanRun />
            </ConfirmAuth>
        )
    },
    {
        path: '/test-queue',
        exact: true,
        element: <TestQueue />
    },
    {
        path: '/test-plan-report/:testPlanReportId(\\d+)',
        element: <TestRun />
    },
    {
        path: '/run/:runId(\\d+)',
        element: (
            <ConfirmAuth requiredPermission="TESTER">
                <TestRun />
            </ConfirmAuth>
        )
    },
    {
        path: '/reports',
        exact: true,
        element: <Reports />
    },
    {
        path: '/report/:testPlanVersionId',
        element: <Report />
    },
    {
        path: '/candidate-tests',
        element: (
            <ConfirmAuth requiredPermission="VENDOR">
                <CandidateTests />
            </ConfirmAuth>
        )
    },
    // {
    //     path: '/test-management',
    //     exact: true,
    //     component: () => {
    //         return (
    //             <ConfirmAuth requiredPermission="ADMIN">
    //                 <Route component={TestManagement} />
    //             </ConfirmAuth>
    //         );
    //     }
    // },
    {
        path: '/invalid-request',
        exact: true,
        element: <InvalidRequest />
    },
    {
        path: '/404',
        exact: true,
        element: <NotFound />
    },
    {
        path: '*',
        element: <Navigate to="/404" replace />
    }
];
