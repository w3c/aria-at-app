'use strict';

const {
    getTestPlanRuns,
    updateTestPlanRun
} = require('../models/services.deprecated/TestPlanRunService');
const {
    getAtVersionByQuery
} = require('../models/services.deprecated/AtService');
const {
    getBrowserVersionByQuery
} = require('../models/services.deprecated/BrowserService');
const convertTestResultToInput = require('../resolvers/TestPlanRunOperations/convertTestResultToInput');

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            const testRuns = await getTestPlanRuns({ transaction });
            let atVersions = {},
                browserVersions = {};
            for (let run of testRuns) {
                const {
                    id: runId,
                    testPlanReport: { atId, browserId },
                    testResults
                } = run;
                if (!atVersions[atId])
                    atVersions[atId] = await getAtVersionByQuery(
                        { atId },
                        undefined,
                        undefined,
                        { transaction }
                    );
                if (!browserVersions[browserId])
                    browserVersions[browserId] = await getBrowserVersionByQuery(
                        {
                            browserId
                        },
                        undefined,
                        undefined,
                        { transaction }
                    );

                for (let result of testResults) {
                    result.atVersionId = atVersions[atId].id;
                    result.browserVersionId = browserVersions[browserId].id;
                }

                // A bug resulted in TestResults with populated associations
                // getting saved to the database
                const testResultInputs = testResults.map(
                    convertTestResultToInput
                );

                await updateTestPlanRun(
                    runId,
                    { testResults: testResultInputs },
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    { transaction }
                );
            }
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            const testRuns = await getTestPlanRuns({ transaction });
            for (let run of testRuns) {
                const { id: runId, testResults } = run;
                for (let result of testResults) {
                    delete result.atVersionId;
                    delete result.browserVersionId;
                }
                await updateTestPlanRun(
                    runId,
                    { testResults },
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    { transaction }
                );
            }
        });
    }
};
