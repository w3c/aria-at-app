/* eslint-disable no-console */
const fs = require('fs');
const db = require('../../models');
const populateFakeTestResults = require('./populateFakeTestResults');

const populateTestDatabase = async () => {
    const testDataScript = fs.readFileSync(
        __dirname + '/pg_dump_2021_05_test_data.sql',
        'utf-8'
    );

    await db.sequelize.query(testDataScript);

    await populateFakeTestResults(1, [
        'completeAndPassing',
        'incompleteAndPassing',
        'incompleteAndFailingDueToNoOutputAssertions',
        'incompleteAndEmpty',
        null,
        'completeAndFailingDueToIncorrectAssertions',
        'completeAndFailingDueToNoOutputAssertions',
        'completeAndFailingDueToUnexpectedBehaviors',
        'completeAndPassing'
    ]);

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

    await populateFakeTestResults(2, [
        'completeAndPassing',
        null,
        null,
        conflicts[0][0],
        conflicts[1][0],
        conflicts[2][0],
        conflicts[3][0],
        'incompleteAndPassing'
    ]);

    await populateFakeTestResults(3, [
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
    ]);

    await populateFakeTestResults(4, [
        'completeAndPassing',
        null,
        'completeAndFailingDueToIncorrectAssertions',
        'completeAndFailingDueToNoOutputAssertions',
        'completeAndFailingDueToUnexpectedBehaviors',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(5, [
        'completeAndPassing',
        null,
        'completeAndFailingDueToIncorrectAssertions',
        'completeAndPassing',
        'completeAndFailingDueToNoOutputAssertions',
        'completeAndPassing',
        'completeAndFailingDueToUnexpectedBehaviors',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(6, [
        'completeAndPassing',
        null,
        'completeAndFailingDueToIncorrectAssertions',
        'completeAndPassing',
        'completeAndFailingDueToIncorrectAssertions',
        'completeAndFailingDueToUnexpectedBehaviors',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(7, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndFailingDueToIncorrectAssertions',
        'completeAndPassing',
        'completeAndFailingDueToNoOutputAssertions',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(8, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(9, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(10, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(11, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(12, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    await populateFakeTestResults(13, [
        'completeAndPassing',
        'completeAndPassing',
        'completeAndPassing'
    ]);

    console.info(
        'Successfully populated. Please wait a moment for the process to close.'
    );
};

if (require.main === module)
    populateTestDatabase().catch(error => {
        console.error(error);
    });

module.exports = populateTestDatabase;
