const { UserInputError } = require('apollo-server');

const renderableContent = (
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
    let explicitRenderableContent =
        test.renderableContent[atId ?? test.inferredAtId];
    if (explicitRenderableContent) {
        return explicitRenderableContent;
    }

    // Support for V2 test format
    return test.renderableContent;
};

module.exports = renderableContent;
