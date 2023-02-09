import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
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

export default () => (
    <Routes>
        <Route index path="/" exact element={<Home />} />
        <Route
            exact
            path="/signup-instructions"
            element={<SignupInstructions />}
        />
        <Route
            exact
            path="/account/settings"
            element={
                <ConfirmAuth requiredPermission="TESTER">
                    <UserSettings />
                </ConfirmAuth>
            }
        />
        <Route
            exact
            path="/candidate-test-plan/:testPlanVersionId(\\d+)/:atId"
            element={
                <ConfirmAuth requiredPermission="VENDOR">
                    <CandidateTestPlanRun />
                </ConfirmAuth>
            }
        />
        <Route exact path="/test-queue" element={<TestQueue />} />
        <Route
            exact
            path="/test-plan-report/:testPlanReportId(\\d+)"
            element={<TestRun />}
        />
        <Route
            exact
            path="/run/:runId(\\d+)"
            element={
                <ConfirmAuth requiredPermission="TESTER">
                    <TestRun />
                </ConfirmAuth>
            }
        />
        <Route exact path="/reports" element={<Reports />} />
        <Route exact path="/report/:testPlanVersionId" element={<Report />} />
        <Route
            exact
            path="/candidate-tests"
            element={
                <ConfirmAuth requiredPermission="VENDOR">
                    <CandidateTests />
                </ConfirmAuth>
            }
        />
        <Route exact path="/invalid-request" element={<InvalidRequest />} />
        <Route exact path="/404" element={<NotFound />} />
        <Route exact path="*" element={<Navigate to="/404" replace />} />
    </Routes>
);

// export default [
//     {
//         path: '/',
//         exact: true,
//         element: <Home />
//     },
//     {
//         path: '/signup-instructions',
//         exact: true,
//         element: <SignupInstructions />
//     },
//     {
//         path: '/account/settings',
//         exact: true,
//         element: (
//             <ConfirmAuth requiredPermission="TESTER">
//                 <UserSettings />
//             </ConfirmAuth>
//         )
//     },
//     {
//         path: '/candidate-test-plan/:testPlanVersionId(\\d+)/:atId',
//         element: (
//             <ConfirmAuth requiredPermission="VENDOR">
//                 <CandidateTestPlanRun />
//             </ConfirmAuth>
//         )
//     },
//     {
//         path: '/test-queue',
//         exact: true,
//         element: <TestQueue />
//     },
//     {
//         path: '/test-plan-report/:testPlanReportId(\\d+)',
//         element: <TestRun />
//     },
//     {
//         path: '/run/:runId(\\d+)',
//         element: (
//             <ConfirmAuth requiredPermission="TESTER">
//                 <TestRun />
//             </ConfirmAuth>
//         )
//     },
//     {
//         path: '/reports',
//         exact: true,
//         element: <Reports />
//     },
//     {
//         path: '/report/:testPlanVersionId',
//         element: <Report />
//     },
//     {
//         path: '/candidate-tests',
//         element: (
//             <ConfirmAuth requiredPermission="VENDOR">
//                 <CandidateTests />
//             </ConfirmAuth>
//         )
//     },
//     // {
//     //     path: '/test-management',
//     //     exact: true,
//     //     component: () => {
//     //         return (
//     //             <ConfirmAuth requiredPermission="ADMIN">
//     //                 <Route component={TestManagement} />
//     //             </ConfirmAuth>
//     //         );
//     //     }
//     // },
//     {
//         path: '/invalid-request',
//         exact: true,
//         element: <InvalidRequest />
//     },
//     {
//         path: '/404',
//         exact: true,
//         element: <NotFound />
//     },
//     // {
//     //     path: '*',
//     //     element: <Navigate to="/404" replace />
//     // }
// ];
