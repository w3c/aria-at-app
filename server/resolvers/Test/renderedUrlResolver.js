const { UserInputError } = require('apollo-server');

const renderedUrl = (
    test,
    { atId },
    context // eslint-disable-line no-unused-vars
) => {
    if (!atId && !test.inferredAtId) {
        throw new UserInputError(
            'although the atId is optional when it can be inferred from ' +
                'context, it cannot be inferred in this case and must be ' +
                'explicitly provided.'
        );
    }

    // Support for V1 test format
    if (test.renderedUrls) return test.renderedUrls[atId ?? test.inferredAtId];

    // Support for V2 test format
    return test.renderedUrl;
};

module.exports = renderedUrl;
