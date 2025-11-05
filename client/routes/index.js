import React, { Suspense, lazy } from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ConfirmAuth from '@components/ConfirmAuth';
import Home from '@components/Home';
import InvalidRequest from '@components/InvalidRequest';
import NotFound from '@components/NotFound';

const Reports = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/Reports').then(m => ({
    default: m.Reports
  }))
);
const Report = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/Reports').then(m => ({
    default: m.Report
  }))
);
const AriaHtmlFeatureDetailReport = lazy(() =>
  import(
    /* webpackPrefetch: true */ '@components/Reports/AriaHtmlFeatureDetailReport'
  )
);
const CandidateReview = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/CandidateReview')
);
const SignupInstructions = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/SignupInstructions')
);
const TestQueue = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/TestQueue')
);
const TestRun = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/TestRun')
);
const UserSettings = lazy(() =>
  import(/* webpackPrefetch: true */ '@components/UserSettings')
);
const CandidateTestPlanRun = lazy(() =>
  import(
    /* webpackPrefetch: true */ '@components/CandidateReview/CandidateTestPlanRun'
  )
);
const DataManagement = lazy(() =>
  import(/* webpackPrefetch: true */ 'client/components/DataManagement')
);
const TestPlanVersionsPage = lazy(() =>
  import(/* webpackPrefetch: true */ '../components/TestPlanVersionsPage')
);
const TestReview = lazy(() =>
  import(/* webpackPrefetch: true */ '../components/TestReview')
);
const TestQueueConflicts = lazy(() =>
  import(/* webpackPrefetch: true */ '../components/TestQueue/Conflicts')
);

const PageLoader = () => (
  <Container id="main" as="main" tabIndex="-1"></Container>
);

export default () => (
  <Routes>
    <Route path="/" element={<Navigate to="/reports" replace />} />
    <Route exact path="/about" element={<Home />} />
    <Route
      exact
      path="/signup-instructions"
      element={
        <Suspense fallback={<PageLoader />}>
          <SignupInstructions />
        </Suspense>
      }
    />
    <Route
      exact
      path="/account/settings"
      element={
        <ConfirmAuth requiredPermission="TESTER">
          <Suspense fallback={<PageLoader />}>
            <UserSettings />
          </Suspense>
        </ConfirmAuth>
      }
    />
    <Route
      exact
      path="/candidate-test-plan/:testPlanVersionId/:atId"
      element={
        <ConfirmAuth requiredPermission="VENDOR" requireVendorForAt={true}>
          <Suspense fallback={<PageLoader />}>
            <CandidateTestPlanRun />
          </Suspense>
        </ConfirmAuth>
      }
    />
    <Route
      path="/test-queue/:testPlanReportId/conflicts"
      element={
        <Suspense fallback={<PageLoader />}>
          <TestQueueConflicts />
        </Suspense>
      }
    />
    <Route path="/test-queue/*" element={<TestQueue />} />
    <Route
      exact
      path="/test-plan-report/:testPlanReportId"
      element={
        <Suspense fallback={<PageLoader />}>
          <TestRun />
        </Suspense>
      }
    />
    <Route
      exact
      path="/run/:runId"
      element={
        <Suspense fallback={<PageLoader />}>
          <TestRun />
        </Suspense>
      }
    />
    <Route
      exact
      path="/test-review/:testPlanVersionId"
      element={
        <Suspense fallback={<PageLoader />}>
          <TestReview />
        </Suspense>
      }
    />
    <Route
      exact
      path="/reports"
      element={
        <Suspense fallback={<PageLoader />}>
          <Reports />
        </Suspense>
      }
    />
    <Route
      exact
      path="/report/:testPlanVersionId/*"
      element={
        <Suspense fallback={<PageLoader />}>
          <Report />
        </Suspense>
      }
    />
    <Route path="/reports/*" element={<Reports />} />
    <Route exact path="/report/:testPlanVersionId/*" element={<Report />} />
    <Route
      exact
      path="/aria-html-feature/:atId/:browserId/:refId"
      element={
        <Suspense fallback={<PageLoader />}>
          <AriaHtmlFeatureDetailReport />
        </Suspense>
      }
    />
    <Route
      exact
      path="/candidate-review"
      element={
        <ConfirmAuth requiredPermission="VENDOR">
          <Suspense fallback={<PageLoader />}>
            <CandidateReview />
          </Suspense>
        </ConfirmAuth>
      }
    />
    <Route
      exact
      path="/data-management"
      element={
        <Suspense fallback={<PageLoader />}>
          <DataManagement />
        </Suspense>
      }
    />
    <Route
      exact
      path="/data-management/:testPlanDirectory/"
      element={
        <Suspense fallback={<PageLoader />}>
          <TestPlanVersionsPage />
        </Suspense>
      }
    />
    <Route exact path="/invalid-request" element={<InvalidRequest />} />
    <Route exact path="/404" element={<NotFound />} />
    <Route exact path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);
