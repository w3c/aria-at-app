const { UserInputError } = require('apollo-server');

const renderableContent = (test, { atId }) => {
    if (!atId && !test.inferredAtId) {
        throw new UserInputError(
            'atId was not provided and could not be inferred'
        );
    }
    return test.renderableContent[atId ?? test.inferredAtId];
};

module.exports = renderableContent;
