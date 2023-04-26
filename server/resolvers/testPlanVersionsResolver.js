const fs = require('fs');
const path = require('path');
const {
    getTestPlanVersions,
    isInvalidDirectoryOrTitles
} = require('../models/services/TestPlanVersionService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const { TEST_PLAN_VERSION_ATTRIBUTES } = require('../models/services/helpers');

const testPlanVersionsResolver = async (root, args, context, info) => {
    const where = {};
    const directoryNamesObject = {};

    const { attributes: testPlanVersionAttributes } = retrieveAttributes(
        'testPlanVersion',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info
    );

    const isDirectoryIncluded = testPlanVersionAttributes.includes('directory');
    if (isDirectoryIncluded) {
        // This can only be verified `testPlan.directory` is also being referenced
        // But should we force `directory` to be a part of testPlanVersion queries?
        const directoryNames = fs
            .readFileSync(
                path.resolve(
                    __dirname,
                    '../scripts/import-tests/directory_names.txt'
                )
            )
            .toString();

        const directoryNamesSplit = directoryNames.trim().split('\n');
        directoryNamesSplit.forEach(i => {
            const directoryNameSplit = i.split(','); // eg. 'alert,Alert Example'
            const directory = directoryNameSplit[0]; // eg. 'alert'
            directoryNamesObject[directory] = directoryNameSplit[1]; // Alert Example;
        });

        const directories = Object.keys(directoryNamesObject);

        // If there is a directory which is not included in the most recently updated version of
        // `directory_names.txt`, it will not be shown.
        if (directories.length) where.directory = directories;
    }

    const testPlanVersions = await getTestPlanVersions(
        null,
        where,
        testPlanVersionAttributes,
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        {
            order: [
                ['updatedAt', 'desc'],
                ['title', 'asc'],
                ['directory', 'asc']
            ]
        }
    );

    if (isDirectoryIncluded) {
        // Check if there are any invalid titles before mutating result object.
        // Any without a title, or a title which doesn't fall into `Object.values(directoryNamesObject)
        const isTitlesValid = await isInvalidDirectoryOrTitles({
            titles: Object.values(directoryNamesObject)
        });

        if (!isTitlesValid) {
            testPlanVersions.forEach(t => {
                t.title = directoryNamesObject[t.directory];
            });
        }
    }

    return testPlanVersions;
};

module.exports = testPlanVersionsResolver;
