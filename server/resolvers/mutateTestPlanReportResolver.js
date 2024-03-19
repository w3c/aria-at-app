const mutateTestPlanReportResolver = (
  _,
  { id, ids },
  context // eslint-disable-line no-unused-vars
) => {
  return { parentContext: { id, ids } };
};

module.exports = mutateTestPlanReportResolver;
