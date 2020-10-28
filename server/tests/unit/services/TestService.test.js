const { dbCleaner } = require('../../util/db-cleaner');
const db = require('../../../models/index');
const TestService = require('../../../services/TestService');

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
    done();
});

describe('RunService', () => {
    describe('TestService.deleteTestResultsForRunAndUser', () => {
        it('should delete a users test results for a run', async () => {
            await dbCleaner(async () => {
                let testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });
                await db.TestVersion.update(
                    { active: true },
                    { where: { id: testVersion.id } }
                );

                let apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
                });
                await db.ApgExample.update(
                    { active: true },
                    { where: { id: apgExample.id } }
                );

                let test = await db.Test.findOne({
                    where: {
                        test_version_id: testVersion.id,
                        apg_example_id: apgExample.id
                    }
                });

                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';
                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                let atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const browser = await db.Browser.findOne();
                let browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                let runStatus = await db.RunStatus.findOne({
                    where: { name: 'raw' }
                });

                let tech = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                let run = await db.Run.create({
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                const user1 = await db.Users.create();
                const user2 = await db.Users.create();

                await db.TestResult.bulkCreate([
                    {
                        test_id: test.id,
                        run_id: run.id,
                        user_id: user1.id
                    },
                    {
                        test_id: test.id,
                        run_id: run.id,
                        user_id: user2.id
                    }
                ]);

                let deletedCount = await TestService.deleteTestResultsForRunAndUser(
                    {
                        userId: user1.id,
                        runId: run.id
                    }
                );

                expect(deletedCount).toBe(1);

                let testResults = await db.TestResult.findAll({
                    where: {
                        run_id: run.id
                    }
                });

                expect(testResults.length).toBe(1);
                expect(testResults[0].user_id).toBe(user2.id);
            });
        });
    });
});
