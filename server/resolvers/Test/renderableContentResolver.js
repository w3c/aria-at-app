const { UserInputError } = require('apollo-server');

const renderableContent = (test, { atId }) => {
    if (!atId && !test.inferredAtId) {
        throw new UserInputError(
            'although the atId is optional when it can be inferred from ' +
                'context, it cannot be inferred in this case.'
        );
    }
    return test.renderableContent[atId ?? test.inferredAtId];
};

module.exports = renderableContent;
