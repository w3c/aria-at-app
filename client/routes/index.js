import React from 'react';
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
        element: <Home />
    },
    {
        path: '/signup-instructions',
        element: <SignupInstructions />
    },
    {
        path: '/account/settings',
        element: (
            <ConfirmAuth requiredPermission="TESTER">
                <UserSettings />
            </ConfirmAuth>
        )
    },
    {
        path: '/test-queue',
        element: <TestQueue />
    },
    {
        path: '/run/:runId',
        element: (
            <ConfirmAuth requiredPermission="TESTER">
                <TestRun />
            </ConfirmAuth>
        )
    },
    {
        path: '/test-plan-report/:testPlanReportId',
        element: <TestRun />
    },
    {
        path: '/reports',
        element: <Reports />
    },
    {
        path: '/report/:testPlanVersionId/*',
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
    {
        path: '/candidate-test-plan/:testPlanVersionId/:atId',
        element: (
            <ConfirmAuth requiredPermission="VENDOR">
                <CandidateTestPlanRun />
            </ConfirmAuth>
        )
    },
    // {
    //     path: '/test-management',
    //     element: (
    //         <ConfirmAuth requiredPermission="ADMIN">
    //             <TestManagement />
    //         </ConfirmAuth>
    //     )
    // },
    {
        path: '/invalid-request',
        element: <InvalidRequest />
    },
    {
        path: '/404',
        element: <NotFound />
    },
    {
        path: '*',
        element: <NotFound />
    }
];
