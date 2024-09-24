/* eslint-disable no-console */
const fs = require('fs');
const { sequelize } = require('../../models');
const populateFakeTestResults = require('./populateFakeTestResults');

const populateTestDatabase = async transaction => {
  const testDataScript = fs.readFileSync(
    __dirname + '/pg_dump_test_data.sql',
    'utf-8'
  );

  await sequelize.query(testDataScript, { transaction });

  await populateFakeTestResults(
    1,
    [
      'completeAndPassing',
      'incompleteAndPassing',
      'incompleteAndFailingDueToNoOutputAssertions',
      'incompleteAndEmpty',
      null,
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndFailingDueToNoOutputAssertions',
      'completeAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  // Convenient way to generate conflicts between TestPlanRuns attached to
  // the same TestPlanReport
  const conflicts = [
    ['completeAndPassing', 'completeAndFailingDueToIncorrectAssertions'],
    [
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndFailingDueToNoOutputAssertions'
    ],
    ['completeAndPassing', 'completeAndFailingDueToUnexpectedBehaviors'],
    [
      'completeAndFailingDueToNoOutputAssertions',
      'completeAndFailingDueToMultiple'
    ]
  ];

  await populateFakeTestResults(
    2,
    [
      'completeAndPassing',
      null,
      null,
      conflicts[0][0],
      conflicts[1][0],
      conflicts[2][0],
      conflicts[3][0],
      'incompleteAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    3,
    [
      'completeAndPassing',
      null,
      null,
      conflicts[0][1],
      conflicts[1][1],
      conflicts[2][1],
      conflicts[3][1],
      'incompleteAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    4,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndFailingDueToNoOutputAssertions',
      'completeAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    5,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndPassing',
      'completeAndFailingDueToNoOutputAssertions',
      'completeAndPassing',
      'completeAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    6,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndPassing',
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    7,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndFailingDueToIncorrectAssertions',
      'completeAndPassing',
      'completeAndFailingDueToNoOutputAssertions'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    8,
    [
      'completeAndPassing',
      conflicts[0][0],
      'completeAndPassing',
      'completeAndPassing',
      conflicts[2][0]
    ],
    { transaction, numFakeTestResultConflicts: 'ALL' }
  );

  await populateFakeTestResults(9, ['completeAndPassing'], { transaction });

  await populateFakeTestResults(10, ['completeAndPassing'], { transaction });

  await populateFakeTestResults(11, ['completeAndPassing'], { transaction });

  await populateFakeTestResults(12, ['completeAndPassing'], { transaction });

  await populateFakeTestResults(13, ['completeAndPassing'], { transaction });

  await populateFakeTestResults(14, ['completeAndPassing'], {
    transaction
  });

  await populateFakeTestResults(15, ['completeAndPassing'], {
    transaction
  });

  await populateFakeTestResults(16, ['completeAndPassing'], {
    transaction
  });

  await populateFakeTestResults(17, ['completeAndPassing'], {
    transaction
  });

  await populateFakeTestResults(18, ['completeAndPassing'], {
    transaction
  });

  await populateFakeTestResults(19, ['completeAndPassing'], {
    transaction
  });

  // Slightly different from older already recommended TestPlanRun 13
  await populateFakeTestResults(
    20,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndFailingDueToUnexpectedBehaviors'
    ],
    { transaction }
  );

  // Conflicting with TestPlanRun 8
  await populateFakeTestResults(
    21,
    [
      'completeAndPassing',
      conflicts[0][1],
      'incompleteAndFailingDueToUnexpectedBehaviors',
      'completeAndPassing',
      conflicts[2][1]
    ],
    {
      transaction,
      numFakeTestResultConflicts: 'ALL'
    }
  );

  console.info(
    'Successfully populated. Please wait a moment for the process to close.'
  );
};

if (require.main === module)
  sequelize.transaction(populateTestDatabase).catch(error => {
    console.error(error);
  });

module.exports = populateTestDatabase;
