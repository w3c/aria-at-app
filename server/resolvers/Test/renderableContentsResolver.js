const renderableContents = async (test, _, context) => {
    const ats = await context.atLoader.getAll();

    // console.log(Object.entries(test.renderableContent))
    // console.log(test.atIds)
    return Object.entries(test.renderableContent).map(
        ([atIds, renderableContent]) => {
            // console.log(renderableContent);
            // console.log(atIds);
            
            // if (renderableContent.info) {
            //     console.log('INFO');
            //     const at = ats.find(at => at.id == atId);
            //     return { at, renderableContent };
            // }
            // const at = ats.find(at => at.id == atIds);
            const at = ats.find(at => at.id == test.atIds);
            console.log(at);
            return { at, renderableContent };
        }
    );
};

module.exports = renderableContents;
