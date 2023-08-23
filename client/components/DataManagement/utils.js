// Get the version information based on the latest or earliest date info from a group of

import { TEST_PLAN_VERSION_PHASES } from '../../utils/constants';

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

export const DATA_MANAGEMENT_TABLE_SORT_OPTIONS = {
    NAME: 'NAME',
    ATS: 'ATS',
    PHASE: 'PHASE'
};

export const DATA_MANAGEMENT_TABLE_FILTER_OPTIONS = {
    ALL: 'ALL',
    ...TEST_PLAN_VERSION_PHASES
};
