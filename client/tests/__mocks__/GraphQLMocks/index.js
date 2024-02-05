import { TEST_QUEUE_PAGE_QUERY } from '@components/TestQueue/queries';
import { DATA_MANAGEMENT_PAGE_QUERY } from '@components/DataManagement/queries';
import { TEST_PLAN_REPORT_STATUS_DIALOG_QUERY } from '@components/TestPlanReportStatusDialog/queries';
import { ME_QUERY } from '@components/App/queries';

import TestQueuePageAdminNotPopulatedMock from './TestQueuePageAdminNotPopulatedMock';
import TestQueuePageAdminPopulatedMock from './TestQueuePageAdminPopulatedMock';
import TestQueuePageTesterNotPopulatedMock from './TestQueuePageTesterNotPopulatedMock';
import TestQueuePageTesterPopulatedMock from './TestQueuePageTesterPopulatedMock';
import DataManagementPagePopulatedMock from './DataManagementPagePopulatedMock';
import TestPlanReportStatusDialogMock from './TestPlanReportStatusDialogMock';
import TestQueuePageBaseMock from './TestQueuePageBaseMock';
import { TEST_PLAN_REPORT_AT_BROWSER_QUERY } from '../../../components/TestQueue/queries';
import { TEST_PLAN_RUN_REPORTS_INITIATED_BY_AUTOMATION } from '../../../components/AddTestToQueueWithConfirmation/queries';

export const TEST_QUEUE_PAGE_ADMIN_NOT_POPULATED_MOCK_DATA =
    TestQueuePageAdminNotPopulatedMock(TEST_QUEUE_PAGE_QUERY);

export const TEST_QUEUE_PAGE_ADMIN_POPULATED_MOCK_DATA =
    TestQueuePageAdminPopulatedMock(TEST_QUEUE_PAGE_QUERY);

export const TEST_QUEUE_PAGE_TESTER_NOT_POPULATED_MOCK_DATA =
    TestQueuePageTesterNotPopulatedMock(TEST_QUEUE_PAGE_QUERY);

export const TEST_QUEUE_PAGE_TESTER_POPULATED_MOCK_DATA =
    TestQueuePageTesterPopulatedMock(TEST_QUEUE_PAGE_QUERY);

export const TEST_QUEUE_PAGE_BASE_MOCK_DATA = TestQueuePageBaseMock(
    TEST_PLAN_REPORT_AT_BROWSER_QUERY,
    TEST_PLAN_RUN_REPORTS_INITIATED_BY_AUTOMATION
);

export const DATA_MANAGEMENT_PAGE_POPULATED_MOCK_DATA =
    DataManagementPagePopulatedMock(
        ME_QUERY,
        DATA_MANAGEMENT_PAGE_QUERY,
        TEST_PLAN_REPORT_STATUS_DIALOG_QUERY
    );

export const TEST_PLAN_REPORT_STATUS_DIALOG_MOCK_DATA =
    TestPlanReportStatusDialogMock(
        ME_QUERY,
        TEST_PLAN_REPORT_STATUS_DIALOG_QUERY,
        TEST_PLAN_RUN_REPORTS_INITIATED_BY_AUTOMATION
    );
