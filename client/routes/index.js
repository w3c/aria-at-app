import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import App from '@components/App';
import CycleSummary from '@components/CycleSummary';
import ConfigureActiveRuns from '@components/ConfigureActiveRuns';
import ConfirmAuth from '@components/ConfirmAuth';
import Home from '@components/Home';
import NotFound from '@components/NotFound';
import RunResultsPage from '@components/RunResultsPage';
import ResultsPage from '@components/ResultsPage';
import SignupInstructions from '@components/SignupInstructions';
import TesterHome from '@components/TesterHome';
import TestQueue from '@components/TestQueue';
import TestRun from '@components/TestRun';
import UserSettings from '@components/UserSettings';

export default [
    {
        component: App,
        routes: [
            {
                path: '/',
                exact: true,
                component: Home
            },
            {
                path: '/signupInstructions',
                exact: true,
                component: SignupInstructions
            },
            {
                path: '/account/settings',
                exact: true,
                component: () => {
                    return (
                        <ConfirmAuth requiredPermission="tester">
                            <Route component={UserSettings} />
                        </ConfirmAuth>
                    );
                }
            },
            {
                path: '/test-queue/:cycleId(\\d+)',
                component: () => {
                    return (
                        <ConfirmAuth requiredPermission="tester">
                            <Route component={TestQueue} />
                        </ConfirmAuth>
                    );
                }
            },
            {
                path: '/test-queue',
                exact: true,
                component: () => {
                    return (
                        <ConfirmAuth requiredPermission="tester">
                            <Route component={TesterHome} />
                        </ConfirmAuth>
                    );
                }
            },
            {
                path: '/results',
                exact: true,
                component: ResultsPage
            },
            {
                path: '/cycles/:cycleId(\\d+)',
                exact: true,
                component: () => {
                    return (
                        <ConfirmAuth requiredPermission="admin">
                            <Route component={CycleSummary} />
                        </ConfirmAuth>
                    );
                }
            },
            {
                path: '/admin/configure-runs',
                exact: true,
                component: () => {
                    return (
                        <ConfirmAuth requiredPermission="admin">
                            <Route component={ConfigureActiveRuns} />
                        </ConfirmAuth>
                    );
                }
            },
            {
                path: '/results/cycles/:cycleId(\\d+)/run/:runId(\\d+)',
                component: RunResultsPage
            },
            {
                path: '/cycles/:cycleId(\\d+)/run/:runId(\\d+)',
                component: TestRun
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
        ]
    }
];
