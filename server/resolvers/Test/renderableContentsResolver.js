const populateData = require('../../services/PopulatedData/populateData');

const renderableContents = async (test, _, context) => {
    const { transaction, atLoader } = context;

    const ats = await atLoader.getAll({ transaction });

    const { testPlanVersion } = await populateData(
        { testId: test.id },
        { context }
    );

    const isV2 = testPlanVersion.metadata.testFormatVersion === 2;
    if (isV2) {
        return test.atIds.map(atId => {
            return {
                at: ats.find(at => at.id === atId),
                renderableContent: test.renderableContent // { renderableContent: { info, ... } }
            };
        });
    }
    // v1: { renderableContent: { 1: { info, ... }, 2: { ... }, ... } }
    return Object.entries(test.renderableContent).map(
        ([atId, renderableContent]) => {
            const at = ats.find(at => at.id == atId);
            return { at, renderableContent };
        }
    );
};

module.exports = renderableContents;
