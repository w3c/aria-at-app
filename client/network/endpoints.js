export const getTestPlanRunIssuesByTestResultIndex = (
    testPlanRunId,
    testResultIndex
) =>
    `/api/test/issues?testPlanRunId=${testPlanRunId}&testResultIndex=${testResultIndex}`;

export const testPlanRunIssues = `/api/test/issues`;
