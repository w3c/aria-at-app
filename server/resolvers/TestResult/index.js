const title = require('./titleResolver');
const index = require('./indexResolver');
const referenceFilePath = require('./referenceFilePathResolver');
const assertions = require('./assertionsResolver');
const assertionsCount = require('./assertionsCountResolver');
const assertionsPassed = require('./assertionsPassedResolver');
const unexpectedBehaviorCount = require('./unexpectedBehaviorCountResolver');
const isComplete = require('./isCompleteResolver');
const isSkipped = require('./isSkippedResolver');

module.exports = {
    title,
    index,
    referenceFilePath,
    assertions,
    assertionsCount,
    assertionsPassed,
    unexpectedBehaviorCount,
    isComplete,
    isSkipped
};
