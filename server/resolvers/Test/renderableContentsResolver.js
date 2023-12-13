const renderableContents = async (test, _, context) => {
    const ats = await context.atLoader.getAll();

    return Object.entries(test.renderableContent).map(
        ([atId, renderableContent]) => {
            const at = ats.find(at => at.id == atId);
            return { at, renderableContent };
        }
    );
};

module.exports = renderableContents;
