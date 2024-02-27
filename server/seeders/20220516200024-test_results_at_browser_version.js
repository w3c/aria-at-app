'use strict';

const {
    getTestPlanRuns,
    updateTestPlanRunById
} = require('../models/services/TestPlanRunService');
const { getAtVersionByQuery } = require('../models/services/AtService');
const {
    getBrowserVersionByQuery
} = require('../models/services/BrowserService');
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
                    atVersions[atId] = await getAtVersionByQuery({
                        where: { atId },
                        transaction
                    });
                if (!browserVersions[browserId])
                    browserVersions[browserId] = await getBrowserVersionByQuery(
                        { where: { browserId }, transaction }
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

                await updateTestPlanRunById({
                    id: runId,
                    values: { testResults: testResultInputs },
                    pagination: { transaction }
                });
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
                await updateTestPlanRunById({
                    id: runId,
                    values: { testResults },
                    transaction
                });
            }
        });
    }
};
