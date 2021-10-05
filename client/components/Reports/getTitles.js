const getTestPlanVersionTitle = testPlanVersion => {
    return testPlanVersion.title || `"${testPlanVersion.testPlan.directory}"`;
};

const getTestPlanTargetTitle = ({ browser, browserVersion, at, atVersion }) => {
    return `${at.name} ${atVersion} and ${browser.name} ${browserVersion}`;
};

export { getTestPlanTargetTitle, getTestPlanVersionTitle };
