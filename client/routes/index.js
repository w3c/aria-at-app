import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import ConfirmAuth from '@components/ConfirmAuth';
import Home from '@components/Home';
import InvalidRequest from '@components/InvalidRequest';
import NotFound from '@components/NotFound';
import { Reports, Report } from '@components/Reports';
import CandidateReview from '@components/CandidateReview';
import SignupInstructions from '@components/SignupInstructions';
import TestQueue2 from '@components/TestQueue2';
import TestRun from '@components/TestRun';
import UserSettings from '@components/UserSettings';
import CandidateTestPlanRun from '@components/CandidateReview/CandidateTestPlanRun';
import DataManagement from 'client/components/DataManagement';
import TestPlanVersionsPage from '../components/TestPlanVersionsPage';
import TestReview from '../components/TestReview';

export default () => (
  <Routes>
    <Route index path="/" exact element={<Home />} />
    <Route exact path="/signup-instructions" element={<SignupInstructions />} />
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
    <Route exact path="/test-queue" element={<TestQueue2 />} />
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
    <Route
      exact
      path="/test-review/:testPlanVersionId"
      element={<TestReview />}
    />
    <Route exact path="/reports" element={<Reports />} />
    <Route exact path="/report/:testPlanVersionId/*" element={<Report />} />
    <Route
      exact
      path="/candidate-review"
      element={
        <ConfirmAuth requiredPermission="VENDOR">
          <CandidateReview />
        </ConfirmAuth>
      }
    />
    <Route exact path="/data-management" element={<DataManagement />} />
    <Route
      exact
      path="/data-management/:testPlanDirectory/"
      element={<TestPlanVersionsPage />}
    />
    <Route exact path="/invalid-request" element={<InvalidRequest />} />
    <Route exact path="/404" element={<NotFound />} />
    <Route exact path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);
