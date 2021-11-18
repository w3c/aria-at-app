const { Base64 } = require('js-base64');

/**
 * While the renderableContent is useful to expose via GraphQL, it should not be
 * used by the server
 */
const encodeRenderableContent = ({ allCollected, atIds }) => {
    const object = Object.fromEntries(
        allCollected.map((collected, index) => {
            return [atIds[index], collected];
        })
    );

    return Base64.encode(JSON.stringify(object), true);
};

const decodeRenderableContent = (encoded, atId) => {
    const decoded = JSON.parse(Base64.decode(encoded));
    return decoded[atId];
};

module.exports = { encodeRenderableContent, decodeRenderableContent };
