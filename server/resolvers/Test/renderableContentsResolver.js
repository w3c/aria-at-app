const AtLoader = require('../../models/loaders/AtLoader');

const renderableContents = async test => {
    const ats = await AtLoader().getAll();

    return Object.entries(test.renderableContent).map(
        ([atId, renderableContent]) => {
            const at = ats.find(at => at.id == atId);
            return { at, renderableContent };
        }
    );
};

module.exports = renderableContents;
