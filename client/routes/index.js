import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import ConfirmAuth from '@components/ConfirmAuth';
import Home from '@components/Home';
import InvalidRequest from '@components/InvalidRequest';
import NotFound from '@components/NotFound';
import Reports from '@components/Reports';
import SignupInstructions from '@components/SignupInstructions';
import TestQueue from '@components/TestQueue';
import TestRun from '@components/TestRun';
import UserSettings from '@components/UserSettings';
import TestPlanVersionUpdater from '../components/TestPlanVersionUpdater';

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
                    <Route component={UserSettings} />
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
                    <Route component={TestRun} />
                </ConfirmAuth>
            );
        }
    },
    {
        path: '/test-plan-version-updater',
        component: TestPlanVersionUpdater
    },
    {
        // Note that this component includes a nested router!
        path: '/reports',
        component: Reports
    },
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
            return <Redirect to={{ pathname: '/404' }} />;
        }
    }
];
