const { UserInputError } = require('apollo-server');

const renderedUrl = (test, { atId }) => {
    if (!atId && !test.inferredAtId) {
        throw new UserInputError(
            'although the atId is optional when it can be inferred from ' +
                'context, it cannot be inferred in this case and must be ' +
                'explicitly provided.'
        );
    }
    return test.renderedUrls[atId ?? test.inferredAtId];
};

module.exports = renderedUrl;
