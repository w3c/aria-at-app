export const calculateTestPlanReportCompletionPercentage = ({
    metrics,
    draftTestPlanRuns
}) => {
    if (!metrics || !draftTestPlanRuns) return 0;
    const assignedUserCount = draftTestPlanRuns.length;
    const totalTestsPossible = metrics.testsCount * assignedUserCount;
    const totalTestsCompleted =
        metrics.testsFailedCount + metrics.testsPassedCount;
    const percentage = (totalTestsCompleted / totalTestsPossible) * 100;
    if (isNaN(percentage)) return 0;
    return Math.floor(percentage);
};
