const renderableContent = (test, { atId }) => {
    return atId ? test.renderableContent[atId] : test.renderableContent;
};

module.exports = renderableContent;
