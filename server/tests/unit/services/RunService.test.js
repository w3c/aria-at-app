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
                    at_name_id: at.AtName.id,
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

                // Populate the database with the data to change
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
                    at_name_id: at.AtName.id,
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

                await tech.reload();
                expect(tech.active).toBe(true);
            });
        });
        it('update active tech pairs when there is existing tech pair data', async () => {
            await dbCleaner(async () => {
            
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                const browserVersionNumber2 = '3.4.5';
                const atVersionNumber2 = '5.4.3';

                let testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });
                const apgExample = await db.ApgExample.findOne({
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

                // Create tech pair to deactivate
                let atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                let browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                let techPairDeactivate = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                // Configure the runs with new tech pair
                const activeRuns = await RunService.configureRuns({
                    test_version_id: testVersion.id,
                    apg_example_ids: [apgExample.id],
                    at_browser_pairs: [
                        {
                            at_name_id: at.at_name_id,
                            at_version: atVersionNumber2,
                            browser_id: browser.id,
                            browser_version: browserVersionNumber2
                        }
                    ],
                    run_status_id: runStatus.id
                });

                const keys = Object.keys(activeRuns);
                const runId = parseInt(keys[0]);
                expect(keys.length).toEqual(1);
                expect(activeRuns[runId]).toEqual({
                    id: runId,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber2,
                    browser_name: browser.name,
                    at_id: at.id,
                    at_key: at.key,
                    at_name: at.AtName.name,
                    at_version: atVersionNumber2,
                    apg_example_directory: apgExample.directory,
                    apg_example_name: apgExample.name,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion.id,
                    testers: []
                });

                await techPairDeactivate.reload();
                expect(techPairDeactivate.active).toBe(false);

                const activeBrowserVersionToAtVersions = await db.BrowserVersionToAtVersion.findAll(
                    { where: { active: true } }
                );
                expect(activeBrowserVersionToAtVersions.length).toBe(1);
            });
        });
        it('sets an existing inactive run to active', async () => {
            await dbCleaner(async () => {
                // Data setup for inactive run
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                const testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });
                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
                });

                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                const atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const browser = await db.Browser.findOne();
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                const user = await db.Users.create();
                const testCycle = await db.TestCycle.create({
                    test_version_id: testVersion.id,
                    created_user_id: user.id
                });

                let tech = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                // Create an inactive run
                const previouslyInactiveRunEntry = await db.Run.create({
                    browser_version_id: browserVersion.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    test_cycle_id: testCycle.id,
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id,
                    active: false,
                    run_status_id: runStatus.id
                });

                let previouslyInactiveRun = await db.Run.findOne({where:{ id: previouslyInactiveRunEntry.id }});

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
                    ],
                    run_status_id: runStatus.id
                });

                const keys = Object.keys(activeRuns);
                const runId = parseInt(keys[0]);
                expect(keys.length).toEqual(1);
                // Verify that the run is the one previously populated
                expect(runId).toEqual(previouslyInactiveRunEntry.id);
                expect(activeRuns[runId]).toEqual({
                    id: runId,
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

                // Verify that pre-existing run is now active
                await previouslyInactiveRun.reload();
                expect(previouslyInactiveRun.active).toBe(true);
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
                    at_name_id: atName.id,
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
        it('should return an empty object if there are no published runs', async () => {
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
                const rawRunStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                // Raw Run
                await db.Run.create({
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    browser_version_to_at_versions_id:
                        browserVersionToAtVersion.id,
                    apg_example_id: apgExample.id,
                    run_status_id: rawRunStatus.id,
                    test_version_id: testVersion.id
                });

                const draftRunStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.DRAFT }
                });

                // Draft run
                await db.Run.create({
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    browser_version_to_at_versions_id:
                        browserVersionToAtVersion.id,
                    apg_example_id: apgExample.id,
                    run_status_id: draftRunStatus.id,
                    test_version_id: testVersion.id
                });

                // Run without any status
                await db.Run.create({
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    browser_version_to_at_versions_id:
                        browserVersionToAtVersion.id,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id
                });

                const publishedRuns = await RunService.getPublishedRuns();
                expect(publishedRuns).toEqual({});
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

                // Published/Final run
                const run = await db.Run.create({
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

                const publishedRuns = await RunService.getPublishedRuns();
                expect(Object.keys(publishedRuns).length).toEqual(1);
                expect(publishedRuns[run.id]).toEqual({
                    id: run.id,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: db.Browser.CHROME,
                    at_id: at.id,
                    at_key: at.key,
                    at_name: atNameString,
                    at_name_id: atName.id,
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

    describe('RunService.getActiveRunsConfiguration', () => {
        it('should return the active config without anything active', async () => {
            await dbCleaner(async () => {
                const config = await RunService.getActiveRunsConfiguration();
                expect(config).toEqual({
                    active_test_version: {},
                    active_at_browser_pairs: [],
                    active_apg_examples: [],
                    browsers: [
                        { id: expect.any(Number), name: db.Browser.FIREFOX },
                        { id: expect.any(Number), name: db.Browser.CHROME },
                        { id: expect.any(Number), name: db.Browser.SAFARI }
                    ]
                });
            });
        });

        it('should return the active config', async () => {
            await dbCleaner(async () => {
                const testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_2
                    },
                    include: [db.ApgExample]
                });
                await testVersion.update({ active: true });

                const apgExample1 = testVersion.ApgExamples[0];
                await apgExample1.update({ active: true });

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

                const inactiveAtVersion = await db.AtVersion.create({
                    at_name_id: atName.id,
                    version: '1.1.1'
                });
                const browser = await db.Browser.findOne({
                    where: { name: db.Browser.CHROME }
                });
                const browserVersionNumber = '1.2.3';
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });
                await db.BrowserVersionToAtVersion.create({
                    browser_version_id: browserVersion.id,
                    at_version_id: atVersion.id,
                    active: true
                });
                await db.BrowserVersionToAtVersion.create({
                    browser_version_id: browserVersion.id,
                    at_version_id: inactiveAtVersion.id,
                    active: false
                });

                const config = await RunService.getActiveRunsConfiguration();
                expect(config).toEqual({
                    active_test_version: {
                        id: testVersion.id,
                        git_repo: testVersion.git_repo,
                        git_tag: testVersion.git_tag,
                        git_hash: testVersion.git_hash,
                        git_commit_msg: testVersion.git_commit_msg,
                        date: testVersion.datetime,
                        supported_ats: [
                            {
                                at_id: expect.any(Number),
                                at_key: 'voiceover_macos',
                                at_name: 'VoiceOver for macOS',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'nvda',
                                at_name: 'NVDA',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'jaws',
                                at_name: 'JAWS',
                                at_name_id: expect.any(Number)
                            }
                        ],
                        apg_examples: [
                            {
                                id: expect.any(Number),
                                directory: 'combobox-autocomplete-both',
                                name:
                                    '(NOT READY! DO NOT TEST!) Editable Combobox With Both List and Inline Autocomplete Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'menubar-editor',
                                name: 'Editor Menubar Example'
                            },
                            {
                                id: apgExample1.id,
                                directory: apgExample1.directory,
                                name: apgExample1.name
                            }
                        ]
                    },
                    active_at_browser_pairs: [
                        {
                            browser_id: browser.id,
                            browser_version: browserVersionNumber,
                            at_name_id: atName.id,
                            at_version: atVersionNumber
                        }
                    ],
                    active_apg_examples: [apgExample1.id],
                    browsers: [
                        { id: expect.any(Number), name: db.Browser.FIREFOX },
                        { id: expect.any(Number), name: db.Browser.CHROME },
                        { id: expect.any(Number), name: db.Browser.SAFARI }
                    ]
                });
            });
        });
    });

    describe('RunService.getNewTestVersions', () => {
        it('should return all test versions if there are no active versions', async () => {
            await dbCleaner(async () => {
                const testVersion1 = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    },
                    include: [db.ApgExample]
                });
                const testVersion2 = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_2
                    },
                    include: [db.ApgExample]
                });

                const testVersions = await RunService.getNewTestVersions();
                expect(testVersions).toEqual([
                    {
                        id: testVersion1.id,
                        git_repo: testVersion1.git_repo,
                        git_tag: testVersion1.git_tag,
                        git_hash: testVersion1.git_hash,
                        git_commit_msg: testVersion1.git_commit_msg,
                        date: testVersion1.datetime,
                        supported_ats: [
                            {
                                at_id: expect.any(Number),
                                at_key: 'jaws',
                                at_name: 'JAWS',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'nvda',
                                at_name: 'NVDA',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'voiceover_macos',
                                at_name: 'VoiceOver for macOS',
                                at_name_id: expect.any(Number)
                            }
                        ],
                        apg_examples: [
                            {
                                id: expect.any(Number),
                                directory: 'menubar-editor',
                                name: 'Editor Menubar Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'combobox-autocomplete-both',
                                name:
                                    '(NOT READY! DO NOT TEST!) Editable Combobox With Both List and Inline Autocomplete Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'checkbox',
                                name: 'Checkbox Example (Two State)'
                            }
                        ]
                    },
                    {
                        id: testVersion2.id,
                        git_repo: testVersion2.git_repo,
                        git_tag: testVersion2.git_tag,
                        git_hash: testVersion2.git_hash,
                        git_commit_msg: testVersion2.git_commit_msg,
                        date: testVersion2.datetime,
                        supported_ats: [
                            {
                                at_id: expect.any(Number),
                                at_key: 'jaws',
                                at_name: 'JAWS',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'nvda',
                                at_name: 'NVDA',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'voiceover_macos',
                                at_name: 'VoiceOver for macOS',
                                at_name_id: expect.any(Number)
                            }
                        ],
                        apg_examples: [
                            {
                                id: expect.any(Number),
                                directory: 'menubar-editor',
                                name: 'Editor Menubar Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'combobox-autocomplete-both',
                                name:
                                    '(NOT READY! DO NOT TEST!) Editable Combobox With Both List and Inline Autocomplete Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'checkbox',
                                name: 'Checkbox Example (Two State)'
                            }
                        ]
                    }
                ]);
            });
        });

        it('should return only the newest test versions if there are old versions', async () => {
            await dbCleaner(async () => {
                const testVersion2 = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_2
                    },
                    include: [db.ApgExample]
                });
                await testVersion2.update({ active: true });

                const testVersion3 = await db.TestVersion.create({
                    git_repo: 'git@git.com',
                    git_tag: '1.1.1',
                    git_hash: 'asda123ads2',
                    git_commit_msg: 'Add new test',
                    datetime: Date.now()
                });

                const testVersions = await RunService.getNewTestVersions();
                expect(testVersions).toEqual([
                    {
                        id: testVersion2.id,
                        git_repo: testVersion2.git_repo,
                        git_tag: testVersion2.git_tag,
                        git_hash: testVersion2.git_hash,
                        git_commit_msg: testVersion2.git_commit_msg,
                        date: testVersion2.datetime,
                        supported_ats: [
                            {
                                at_id: expect.any(Number),
                                at_key: 'jaws',
                                at_name: 'JAWS',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'nvda',
                                at_name: 'NVDA',
                                at_name_id: expect.any(Number)
                            },
                            {
                                at_id: expect.any(Number),
                                at_key: 'voiceover_macos',
                                at_name: 'VoiceOver for macOS',
                                at_name_id: expect.any(Number)
                            }
                        ],
                        apg_examples: [
                            {
                                id: expect.any(Number),
                                directory: 'menubar-editor',
                                name: 'Editor Menubar Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'combobox-autocomplete-both',
                                name:
                                    '(NOT READY! DO NOT TEST!) Editable Combobox With Both List and Inline Autocomplete Example'
                            },
                            {
                                id: expect.any(Number),
                                directory: 'checkbox',
                                name: 'Checkbox Example (Two State)'
                            }
                        ]
                    },
                    {
                        id: testVersion3.id,
                        git_repo: testVersion3.git_repo,
                        git_tag: testVersion3.git_tag,
                        git_hash: testVersion3.git_hash,
                        git_commit_msg: testVersion3.git_commit_msg,
                        date: testVersion3.datetime,
                        supported_ats: [],
                        apg_examples: []
                    }
                ]);
            });
        });
    });
});
