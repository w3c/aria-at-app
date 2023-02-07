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
        component: Home
    },
    {
        path: '/signup-instructions',
        exact: true,
        component: SignupInstructions
    },
    {
        path: '/account/settings',
        exact: true,
        component: () => {
            return (
                <ConfirmAuth requiredPermission="TESTER">
                    <Route element={<UserSettings/>} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/candidate-test-plan/:testPlanVersionId(\\d+)/:atId',
        component: () => {
            return (
                <ConfirmAuth requiredPermission="VENDOR">
                    <Route element={<CandidateTestPlanRun/>} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/test-queue',
        exact: true,
        component: TestQueue
    },
    {
        path: '/test-plan-report/:testPlanReportId(\\d+)',
        component: TestRun
    },
    {
        path: '/run/:runId(\\d+)',
        component: () => {
            return (
                <ConfirmAuth requiredPermission="TESTER">
                    <Route element={<TestRun/>} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/reports',
        exact: true,
        component: Reports
    },
    {
        path: '/report/:testPlanVersionId',
        component: Report
    },
    {
        path: '/candidate-tests',
        component: () => {
            return (
                <ConfirmAuth requiredPermission="VENDOR">
                    <Route element={<CandidateTests/>} />
                </ConfirmAuth>
            );
        }
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
        component: InvalidRequest
    },
    {
        path: '/404',
        exact: true,
        component: NotFound
    },
    {
        component: () => {
            return <Navigate to={{ pathname: '/404' }} />;
        }
    }
];
