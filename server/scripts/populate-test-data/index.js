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
      'completeAndFailingDueToUnexpectedBehaviors',
      'completeAndPassing'
    ],
    { transaction }
  );

  // Report 2 contains conflicts which is convenient to have in sample data
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
      'incompleteAndPassing'
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
      'incompleteAndFailingDueToUnexpectedBehaviors',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing'
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
      'completeAndFailingDueToUnexpectedBehaviors',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing'
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
      'completeAndFailingDueToUnexpectedBehaviors',
      'completeAndPassing'
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
      'completeAndFailingDueToUnexpectedBehaviors',
      'completeAndPassing'
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
      'completeAndFailingDueToNoOutputAssertions',
      'completeAndPassing'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    8,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    9,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    10,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    11,
    [
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing',
      'completeAndPassing'
    ],
    { transaction }
  );

  await populateFakeTestResults(
    12,
    ['completeAndPassing', 'completeAndPassing', 'completeAndPassing'],
    { transaction }
  );

  await populateFakeTestResults(
    13,
    ['completeAndPassing', 'completeAndPassing', 'completeAndPassing'],
    { transaction }
  );

  await populateFakeTestResults(14, new Array(16).fill('completeAndPassing'), {
    transaction
  });

  await populateFakeTestResults(15, new Array(8).fill('completeAndPassing'), {
    transaction
  });

  await populateFakeTestResults(16, new Array(3).fill('completeAndPassing'), {
    transaction
  });

  await populateFakeTestResults(17, new Array(3).fill('completeAndPassing'), {
    transaction
  });

  await populateFakeTestResults(18, new Array(3).fill('completeAndPassing'), {
    transaction
  });

  console.info(
    'Successfully populated. Please wait a moment for the process to close.'
  );
};

if (require.main === module)
  sequelize.transaction(populateTestDatabase).catch(error => {
    console.error(error);
  });

module.exports = populateTestDatabase;
