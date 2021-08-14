const title = require('./titleResolver');
const index = require('./indexResolver');
const testFilePath = require('./testFilePathResolver');
const testJson = require('./testJsonResolver');
const commandJson = require('./commandJsonResolver');

module.exports = {
    title,
    index,
    testFilePath,
    testJson,
    commandJson
};
