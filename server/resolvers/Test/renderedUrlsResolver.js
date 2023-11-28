const renderedUrls = async (test, _, context) => {
    const ats = await context.atLoader.getAll();

    return Object.entries(test.renderedUrls).map(([atId, renderedUrl]) => {
        const at = ats.find(at => at.id == atId);
        return { at, renderedUrl };
    });
};

module.exports = renderedUrls;
