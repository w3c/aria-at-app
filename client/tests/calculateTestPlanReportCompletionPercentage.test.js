import { calculateTestPlanReportCompletionPercentage } from '../components/TestPlanReportStatusDialog/calculateTestPlanReportCompletionPercentage';

describe('calculateTestPlanReportCompletionPercentage', () => {
  test('returns 0 when metrics or draftTestPlanRuns is not defined', () => {
    expect(calculateTestPlanReportCompletionPercentage({})).toBe(0);
    expect(calculateTestPlanReportCompletionPercentage({ metrics: {} })).toBe(
      0
    );
    expect(
      calculateTestPlanReportCompletionPercentage({
        draftTestPlanRuns: []
      })
    ).toBe(0);
  });

  test('returns 0 when draftTestPlanRuns is empty', () => {
    expect(
      calculateTestPlanReportCompletionPercentage({
        metrics: { testsCount: 5 },
        draftTestPlanRuns: []
      })
    ).toBe(0);
  });

  test('returns 0 and not Infinity when total tests possible is 0', () => {
    const metrics = { testsCount: 0 };
    const draftTestPlanRuns = [
      { testResults: [1, 2, 3] },
      { testResults: [1, 2, 3, 4, 5] }
    ];

    expect(
      calculateTestPlanReportCompletionPercentage({
        metrics,
        draftTestPlanRuns
      })
    ).toBe(0);
  });

  test('calculates and returns the correct percentage when draftTestPlanRuns has testResults', () => {
    const metrics = { testsCount: 5 };
    const draftTestPlanRuns = [
      { testResults: [1, 2] },
      { testResults: [1, 2, 3] }
    ];

    // Output should follow this formula:
    // (NUMBER_COMPLETED_TESTS_BY_ALL_TESTERS / (NUMBER_ASSIGNED_TESTERS * NUMBER_TESTS_IN_PLAN)) * 100
    // (5 / (2 * 5)) * 100 = 50
    expect(
      calculateTestPlanReportCompletionPercentage({
        metrics,
        draftTestPlanRuns
      })
    ).toBe(50);
  });
});
