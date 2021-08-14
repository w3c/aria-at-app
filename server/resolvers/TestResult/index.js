const title = require('../BaseTest/titleResolver');
const index = require('../BaseTest/indexResolver');
const testFilePath = require('../BaseTest/testFilePathResolver');
const testJson = require('../BaseTest/testJsonResolver');
const commandJson = require('../BaseTest/commandJsonResolver');
const assertions = require('./assertionsResolver');
const assertionsCount = require('./assertionsCountResolver');
const assertionsPassed = require('./assertionsPassedResolver');
const unexpectedBehaviorCount = require('./unexpectedBehaviorCountResolver');
const isComplete = require('./isCompleteResolver');
const isSkipped = require('./isSkippedResolver');

module.exports = {
    title,
    index,
    testFilePath,
    testJson,
    commandJson,
    assertions,
    assertionsCount,
    assertionsPassed,
    unexpectedBehaviorCount,
    isComplete,
    isSkipped
};
