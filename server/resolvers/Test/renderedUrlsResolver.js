const AtLoader = require('../../models/loaders/AtLoader');

const renderedUrls = async test => {
    const ats = await AtLoader().getAll();

    return Object.entries(test.renderedUrls).map(([atId, renderedUrl]) => {
        const at = ats.find(at => at.id == atId);
        return { at, renderedUrl };
    });
};

module.exports = renderedUrls;
