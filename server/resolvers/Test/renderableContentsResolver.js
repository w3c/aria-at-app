const populateData = require('../../services/PopulatedData/populateData');

const renderableContents = async (test, _, context) => {
    const ats = await context.atLoader.getAll();

    const { testPlanVersion } = await populateData(
        { testId: test.id },
        { context }
    );

    const isV2 = testPlanVersion.metadata.testFormatVersion === 2;
    if (isV2) {
        // TODO: This is only accounting for 1 test however so this needs to be fixed
        return [
            {
                at: ats.find(at => at.id === test.atIds[0]),
                renderableContent: test.renderableContent // { renderableContent: { info, ... } }
            }
        ];
    }

    // v1: { renderableContent: { 1: { info, ... }, 2: { ... }, ... } }
    return Object.entries(test.renderableContent).map(
        ([atId, renderableContent]) => {
            const at = ats.find(at => at.id == atId);
            return { at, renderableContent };
        }
    );

    // console.log(Object.entries(test.renderableContent))
    // console.log(test.atIds)
    // return Object.entries(test.renderableContent).map(
    //     ([atIds, renderableContent]) => {
    //         // console.log(renderableContent);
    //         // console.log(atIds);
    //
    //         // if (renderableContent.info) {
    //         //     console.log('INFO');
    //         //     const at = ats.find(at => at.id == atId);
    //         //     return { at, renderableContent };
    //         // }
    //         // const at = ats.find(at => at.id == atIds);
    //         const at = ats.find(at => at.id == test.atIds);
    //         console.log(at);
    //         return { at, renderableContent };
    //     }
    // );
};

module.exports = renderableContents;
