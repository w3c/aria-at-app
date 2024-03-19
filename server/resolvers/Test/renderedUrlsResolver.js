const populateData = require('../../services/PopulatedData/populateData');
const AtLoader = require('../../models/loaders/AtLoader');

const renderedUrls = async (test, _, context) => {
  const { transaction } = context;

  const ats = await AtLoader().getAll({ transaction });

  const { testPlanVersion } = await populateData(
    { testId: test.id },
    { transaction }
  );

  const isV2 = testPlanVersion.metadata.testFormatVersion === 2;
  if (isV2) {
    return test.atIds.map(atId => {
      return {
        at: ats.find(at => at.id === atId),
        renderedUrl: test.renderedUrl // { renderedUrl: '/url/file/path.html' }
      };
    });
  }

  // v1: { renderedUrls: { 1: '/url/file/path.html' } }
  return Object.entries(test.renderedUrls).map(([atId, renderedUrl]) => {
    const at = ats.find(at => at.id == atId);
    return { at, renderedUrl };
  });
};

module.exports = renderedUrls;
