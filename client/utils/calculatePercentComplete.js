export const calculatePercentComplete = ({ metrics, draftTestPlanRuns }) => {
    if (!metrics || !draftTestPlanRuns) return 0;
    const assignedUserCount = draftTestPlanRuns.length || 1;
    const totalTestsPossible = metrics.testsCount * assignedUserCount;
    let totalTestsCompleted = 0;
    draftTestPlanRuns.forEach(draftTestPlanRun => {
        totalTestsCompleted += draftTestPlanRun.testResults.filter(
            ({ completedAt }) => !!completedAt
        ).length;
    });
    const percentage = (totalTestsCompleted / totalTestsPossible) * 100;
    if (isNaN(percentage) || !isFinite(percentage)) return 0;
    return Math.floor(percentage);
};
