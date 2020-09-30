const { dbCleaner } = require('../../util/db-cleaner');
const db = require('../../../models/index');
const RunService = require('../../../services/RunService');

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
    done();
});

describe('RunService', () => {
    describe('RunService.configureRuns', () => {
        // Same test version with new tech pairs and preserving old tech pairs

        it('should create all possible runs if no previous runs exist', async () => {
            await dbCleaner(async () => {
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                let testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });
                let apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
                });
                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                const browser = await db.Browser.findOne();

                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                const activeRuns = await RunService.configureRuns({
                    test_version_id: testVersion.id,
                    apg_example_ids: [apgExample.id],
                    at_browser_pairs: [
                        {
                            at_name_id: at.at_name_id,
                            at_version: atVersionNumber,
                            browser_id: browser.id,
                            browser_version: browserVersionNumber
                        }
                    ]
                });
                const keys = Object.keys(activeRuns);
                const runId = keys[0];
                expect(keys.length).toEqual(1);
                delete activeRuns[runId].id; // Deleting id because we don't know it
                expect(activeRuns[runId]).toEqual({
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: browser.name,
                    at_id: at.id,
                    at_key: at.key,
                    at_name: at.AtName.name,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExample.directory,
                    apg_example_name: apgExample.name,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion.id,
                    testers: []
                });

                await testVersion.reload();
                expect(testVersion.active).toBe(true);
                await apgExample.reload();
                expect(apgExample.active).toBe(true);
                const activeBrowserVersionToAtVersions = await db.BrowserVersionToAtVersion.findAll(
                    { where: { active: true } }
                );
                expect(activeBrowserVersionToAtVersions.length).toBe(1);
                // TODO: Check that the correct browser version and at version
                // is active
            });
        });

        it('should create all possible runs and deactive all old runs if only new runs are created', async () => {
            await dbCleaner(async () => {
                // New test version with previously active test versions
                // Change the test_version but don't change the active tech
                // (Should right another test were to you change the test)

                //
                // Should deactive old test version
                // Should deactive old apg_examples
                // Should deactive old runs
                // Should deactive old tech pairs

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

                // We will need to remove this column!!
                const user = await db.Users.create();
                const testCycle = await db.TestCycle.create({
                    test_version_id: testVersion.id,
                    created_user_id: user.id
                });

                await db.Run.create({
                    browser_version_id: browserVersion.id, // eventually will remove columns
                    at_version_id: atVersion.id, // eventually will remove column
                    at_id: at.id, // eventually will remove this column maybe
                    test_cycle_id: testCycle.id, // eventually will remove column
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                // Get information to add run under different test version

                let testVersion2 = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_2
                    }
                });
                let apgExample2 = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion2.id }
                });

                const at2 = await db.At.findOne({
                    where: { test_version_id: testVersion2.id },
                    include: [db.AtName]
                });

                const data = {
                    test_version_id: testVersion2.id,
                    apg_example_ids: [apgExample2.id],
                    at_browser_pairs: [
                        {
                            at_name_id: at.at_name_id,
                            at_version: atVersionNumber,
                            browser_id: browser.id,
                            browser_version: browserVersionNumber
                        }
                    ]
                };

                const activeRuns = await RunService.configureRuns(data);
                const keys = Object.keys(activeRuns);
                const runId = parseInt(keys[0]);
                expect(keys.length).toEqual(1);
                expect(activeRuns[runId]).toEqual({
                    id: runId,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: browser.name,
                    at_id: at2.id,
                    at_key: at.key,
                    at_name: at.AtName.name,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExample2.directory,
                    apg_example_name: apgExample2.name,
                    apg_example_id: apgExample2.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion2.id,
                    testers: []
                });
                await testVersion.reload();
                expect(testVersion.active).toBe(false);
                await testVersion2.reload();
                expect(testVersion2.active).toBe(true);

                await apgExample.reload();
                expect(apgExample.active).toBe(false);
                await apgExample2.reload();
                expect(apgExample2.active).toBe(true);

                const activeBrowserVersionToAtVersions = await db.BrowserVersionToAtVersion.findAll(
                    { where: { active: true } }
                );
                expect(activeBrowserVersionToAtVersions.length).toBe(1);

                // This test should not change the active tech only the run
                // because I only change the test version and APG example
                // This is a bugs
                // After this another test should be writtent hat is like
                // excalty the same but the active tech also changes.
                //
                // Ideally another test maybe were you kept one and add a new
                // one...
                await tech.reload();
                expect(tech.active).toBe(true);
            });
        });
    });

    describe('RunService.getActiveRuns', () => {
        it('should return an empty object if there are no active runs', async () => {
            await dbCleaner(async () => {
                const testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });
                const apgExampleDirectory = 'checkbox';
                const apgExampleName = 'Checkbox Example (Two State)';
                const apgExample = await db.ApgExample.create({
                    test_version_id: testVersion.id,
                    directory: apgExampleDirectory,
                    name: apgExampleName
                });
                const user = await db.Users.create();
                const testCycle = await db.TestCycle.create({
                    test_version_id: testVersion.id,
                    created_user_id: user.id
                });
                const atNameString = 'NVDA';
                const atName = await db.AtName.findOne({
                    where: {
                        name: atNameString
                    }
                });
                const atVersionNumber = '3.2.1';
                const atVersion = await db.AtVersion.create({
                    at_name_id: atName.id,
                    version: atVersionNumber
                });
                const at = await db.At.findOne({
                    where: {
                        at_name_id: atName.id,
                        test_version_id: testVersion.id
                    }
                });
                const browser = await db.Browser.findOne({
                    where: { name: db.Browser.CHROME }
                });
                const browserVersionNumber = '1.2.3';
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });
                const browserVersionToAtVersion = await db.BrowserVersionToAtVersion.create(
                    {
                        browser_version_id: browserVersion.id,
                        at_version_id: atVersion.id
                    }
                );
                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.FINAL }
                });
                await db.Run.create({
                    active: false,
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    browser_version_to_at_versions_id:
                        browserVersionToAtVersion.id,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    test_version_id: testVersion.id
                });

                const activeRuns = await RunService.getActiveRuns();
                expect(activeRuns).toEqual({});
            });
        });

        it('should return the data from an active run', async () => {
            await dbCleaner(async () => {
                const testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });
                const apgExampleDirectory = 'checkbox';
                const apgExampleName = 'Checkbox Example (Two State)';
                const apgExample = await db.ApgExample.create({
                    test_version_id: testVersion.id,
                    directory: apgExampleDirectory,
                    name: apgExampleName
                });
                const user = await db.Users.create();
                const testCycle = await db.TestCycle.create({
                    test_version_id: testVersion.id,
                    created_user_id: user.id
                });
                const atNameString = 'NVDA';
                const atName = await db.AtName.findOne({
                    where: {
                        name: atNameString
                    }
                });
                const atVersionNumber = '3.2.1';
                const atVersion = await db.AtVersion.create({
                    at_name_id: atName.id,
                    version: atVersionNumber
                });
                const at = await db.At.findOne({
                    where: {
                        at_name_id: atName.id,
                        test_version_id: testVersion.id
                    }
                });
                const browser = await db.Browser.findOne({
                    where: { name: db.Browser.CHROME }
                });
                const browserVersionNumber = '1.2.3';
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });
                const browserVersionToAtVersion = await db.BrowserVersionToAtVersion.create(
                    {
                        browser_version_id: browserVersion.id,
                        at_version_id: atVersion.id
                    }
                );
                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.FINAL }
                });
                const run = await db.Run.create({
                    active: true,
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    browser_version_to_at_versions_id:
                        browserVersionToAtVersion.id,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    test_version_id: testVersion.id
                });

                const activeRuns = await RunService.getActiveRuns();
                expect(Object.keys(activeRuns).length).toEqual(1);
                expect(activeRuns[run.id]).toEqual({
                    id: run.id,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: db.Browser.CHROME,
                    at_id: at.id,
                    at_key: at.key,
                    at_name: atNameString,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExampleDirectory,
                    apg_example_name: apgExampleName,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.FINAL,
                    test_version_id: testVersion.id,
                    testers: []
                });
            });
        });
    });

    describe('RunService.getPublishedRuns', () => {
        it.skip('should return an empty object if there are no published runs', async () => {});

        it.skip('should return the data from a published run', async () => {});
    });
});
