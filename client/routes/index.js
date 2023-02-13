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
            path="/candidate-test-plan/:testPlanVersionId/:atId"
            element={
                <ConfirmAuth requiredPermission="VENDOR">
                    <CandidateTestPlanRun />
                </ConfirmAuth>
            }
        />
        <Route exact path="/test-queue" element={<TestQueue />} />
        <Route
            exact
            path="/test-plan-report/:testPlanReportId"
            element={<TestRun />}
        />
        <Route
            exact
            path="/run/:runId"
            element={
                <ConfirmAuth requiredPermission="TESTER">
                    <TestRun />
                </ConfirmAuth>
            }
        />
        <Route exact path="/reports" element={<Reports />} />
        <Route exact path="/report/:testPlanVersionId/*" element={<Report />} />
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
