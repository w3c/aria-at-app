const getTestPlanVersionTitle = (
  testPlanVersion,
  { includeVersionString = false } = {}
) => {
  let title = testPlanVersion.title || testPlanVersion.testPlan?.directory;
  if (includeVersionString && testPlanVersion.versionString)
    title = `${title} ${testPlanVersion.versionString}`;
  return title;
};

const getTestPlanTargetTitle = ({
  at,
  browser,
  atVersion,
  isMinimumAtVersion
}) => {
  if (!atVersion) return `${at.name} and ${browser.name}`;
  return `${at.name} ${atVersion.name}${
    isMinimumAtVersion ? ' or later' : ''
  } and ${browser.name}`;
};

export { getTestPlanTargetTitle, getTestPlanVersionTitle };
