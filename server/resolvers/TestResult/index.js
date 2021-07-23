const title = require('./titleResolver');
const index = require('./indexResolver');
const referenceFilePath = require('./referenceFilePathResolver');
const assertions = require('./assertionsResolver');
const assertionCount = require('./assertionCountResolver');
const optionalAssertionCount = require('./optionalAssertionCountResolver');
const isComplete = require('./isCompleteResolver');
const isSkipped = require('./isSkippedResolver');
const assertionsPassed = require('./assertionsPassedResolver');
const optionalAssertionsPassed = require('./optionalAssertionsPassedResolver');
const unexpectedBehaviorCount = require('./unexpectedBehaviorCountResolver');
const rawResultData = require('./rawResultDataResolver');
const rawSerializedFormData = require('./rawSerializedFormDataResolver');

module.exports = {
    title,
    index,
    referenceFilePath,
    assertions,
    assertionCount,
    optionalAssertionCount,
    isComplete,
    isSkipped,
    assertionsPassed,
    optionalAssertionsPassed,
    unexpectedBehaviorCount,
    rawResultData,
    rawSerializedFormData
};
