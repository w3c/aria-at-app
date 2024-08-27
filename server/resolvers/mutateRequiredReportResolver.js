const mutateRequiredReportResolver = (
  _,
  { atId, browserId, phase },
  context // eslint-disable-line no-unused-vars
) => {
  return { parentContext: { atId, browserId, phase } };
};

module.exports = mutateRequiredReportResolver;
