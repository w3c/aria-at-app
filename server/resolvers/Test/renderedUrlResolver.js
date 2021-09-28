const { UserInputError } = require('apollo-server');

const renderedUrl = (test, { atId }) => {
    if (!atId && !test.inferredAtId) {
        throw new UserInputError(
            'atId was not provided and could not be inferred'
        );
    }
    return test.renderedUrls[atId ?? test.inferredAtId];
};

module.exports = renderedUrl;
