// Get the version information based on the latest or earliest date info from a group of
// TestPlanVersions
export const getVersionData = (testPlanVersions, dateKey = 'updatedAt') => {
    const earliestVersion = testPlanVersions.reduce((a, b) =>
        new Date(a[dateKey]) < new Date(b[dateKey]) ? a : b
    );
    const earliestVersionDate = new Date(earliestVersion[dateKey]);

    const latestVersion = testPlanVersions.reduce((a, b) =>
        new Date(a[dateKey]) > new Date(b[dateKey]) ? a : b
    );
    const latestVersionDate = new Date(latestVersion[dateKey]);

    return {
        earliestVersion,
        earliestVersionDate,
        latestVersion,
        latestVersionDate
    };
};
