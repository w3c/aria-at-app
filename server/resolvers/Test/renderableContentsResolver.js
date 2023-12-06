const renderableContents = async (test, _, context) => {
    const ats = await context.atLoader.getAll();

    return Object.entries(test.renderableContent).map(
        ([atId, renderableContent]) => {
            console.log(renderableContent);
            // if (renderableContent.info) {
            //     console.log('INFO');
            //     const at = ats.find(at => at.id == atId);
            //     return { at, renderableContent };
            // }
            const at = ats.find(at => at.id == atId);
            return { at, renderableContent };
        }
    );
};

module.exports = renderableContents;
