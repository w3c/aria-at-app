const getTestPlanVersionTitle = (
    testPlanVersion,
    { includeVersionString = false } = {}
) => {
    const title = `${
        testPlanVersion.title || testPlanVersion.testPlan.directory
    }`;

    if (!includeVersionString) return title;
    return `${title} ${testPlanVersion.versionString}`;
};

const getTestPlanTargetTitle = ({ at, browser, atVersion }) => {
    if (!atVersion) return `${at.name} and ${browser.name}`;
    return `${at.name} ${atVersion.name} and ${browser.name}`;
};

export { getTestPlanTargetTitle, getTestPlanVersionTitle };
