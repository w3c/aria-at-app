const { dbCleaner } = require('../../util/db-cleaner');
const ArrayContainingExactly = require('../../util/array-containing-exactly');
const db = require('../../../models/index');
const RunService = require('../../../services/RunService');

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
    done();
});

describe('RunService', () => {
    describe('RunService.configureRuns', () => {
        const commit = false; // variable passed to configureRuns() to allow for SQL rollback
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

                const activeRuns = await RunService.configureRuns(
                    {
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
                    },
                    commit
                );
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
                    testers: [],
                    tests: expect.any(Array)
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

                const activeRuns = await RunService.configureRuns(data, commit);
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
                    testers: [],
                    tests: expect.any(Array)
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
        it('should create a new test run for a new AT version when there are existing runs for an older version of the same AT', async () => {
            await dbCleaner(async () => {
                // This test preserves browser version, AT name, test version, and APG example
                // It also simulates an inactive test run for the older AT version
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';
                const atVersionNumber2 = '3.2.2';

                let testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });

                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                // Create tech pair with older version
                const atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
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

                // Create an inactive run with the older AT version
                const runWithOlderAt = await db.Run.create({
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

                const activeRuns = await RunService.configureRuns(
                    {
                        test_version_id: testVersion.id,
                        apg_example_ids: [apgExample.id],
                        at_browser_pairs: [
                            {
                                at_name_id: at.at_name_id,
                                at_version: atVersionNumber,
                                browser_id: browser.id,
                                browser_version: browserVersionNumber
                            },
                            {
                                at_name_id: at.at_name_id,
                                at_version: atVersionNumber2,
                                browser_id: browser.id,
                                browser_version: browserVersionNumber
                            }
                        ],
                        run_status_id: runStatus.id
                    },
                    commit
                );

                // Ensure there are two runs differing on AT version only
                const keys = Object.keys(activeRuns);
                expect(keys.length).toEqual(2);

                // Verify that one run has the older AT version and is active
                const activeRunIdOlderAtId = parseInt(keys[0]);
                expect(activeRunIdOlderAtId).toEqual(runWithOlderAt.id);
                expect(activeRuns[activeRunIdOlderAtId]).toEqual({
                    id: runWithOlderAt.id,
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
                    testers: [],
                    tests: expect.any(Array)
                });
                await runWithOlderAt.reload();
                expect(runWithOlderAt.active).toBe(true);

                // Verify that the second run has the new AT version
                const activeRunNewerAtId = parseInt(keys[1]);
                expect(activeRuns[activeRunNewerAtId]).toEqual({
                    id: activeRunNewerAtId,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: browser.name,
                    at_id: at.id,
                    at_key: at.key,
                    at_name: at.AtName.name,
                    at_name_id: at.AtName.id,
                    at_version: atVersionNumber2,
                    apg_example_directory: apgExample.directory,
                    apg_example_name: apgExample.name,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion.id,
                    testers: [],
                    tests: expect.any(Array)
                });
            });
        });
        it('should create a new test run for a new browser version when there are existing runs for an older version of the same browser', async () => {
            await dbCleaner(async () => {
                // This test preserves AT version, test version, and APG example
                // It also simulates an inactive test run for the older browser version
                const browserVersionNumber = '1.2.3';
                const browserVersionNumber2 = '1.2.4';
                const atVersionNumber = '3.2.1';

                let testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });

                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                // Create browser with older version
                const browser = await db.Browser.findOne();
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                const atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
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

                // Create an inactive run with the older browser version
                const runWithOlderBrowser = await db.Run.create({
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

                const activeRuns = await RunService.configureRuns(
                    {
                        test_version_id: testVersion.id,
                        apg_example_ids: [apgExample.id],
                        at_browser_pairs: [
                            {
                                at_name_id: at.at_name_id,
                                at_version: atVersionNumber,
                                browser_id: browser.id,
                                browser_version: browserVersionNumber
                            },
                            {
                                at_name_id: at.at_name_id,
                                at_version: atVersionNumber,
                                browser_id: browser.id,
                                browser_version: browserVersionNumber2
                            }
                        ],
                        run_status_id: runStatus.id
                    },
                    commit
                );

                // Ensure there are two runs differing on AT version only
                const keys = Object.keys(activeRuns);
                expect(keys.length).toEqual(2);

                // Verify that one run has the older AT version and is active
                const activeRunIdOlderBrowserId = parseInt(keys[0]);
                expect(activeRunIdOlderBrowserId).toEqual(
                    runWithOlderBrowser.id
                );
                expect(activeRuns[activeRunIdOlderBrowserId]).toEqual({
                    id: runWithOlderBrowser.id,
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
                    testers: [],
                    tests: expect.any(Array)
                });
                await runWithOlderBrowser.reload();
                expect(runWithOlderBrowser.active).toBe(true);

                // Verify that the second run has the new AT version
                const activeRunNewerBrowserId = parseInt(keys[1]);
                expect(activeRuns[activeRunNewerBrowserId]).toEqual({
                    id: activeRunNewerBrowserId,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber2,
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
                    testers: [],
                    tests: expect.any(Array)
                });
            });
        });
        it('should deactivate tech pairs when there is existing tech pair data to deactivate', async () => {
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

                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                const browser = await db.Browser.findOne();

                // Create tech pair to deactivate
                let atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                let browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                let techPairDeactivate = await db.BrowserVersionToAtVersion.create(
                    {
                        at_version_id: atVersion.id,
                        browser_version_id: browserVersion.id,
                        active: true
                    }
                );

                // Configure the runs with new tech pair
                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
                });

                const activeRuns = await RunService.configureRuns(
                    {
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
                    },
                    commit
                );

                // Check the returned data
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
                    at_name_id: at.AtName.id,
                    at_version: atVersionNumber2,
                    apg_example_directory: apgExample.directory,
                    apg_example_name: apgExample.name,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion.id,
                    testers: [],
                    tests: expect.any(Array)
                });

                // Check that previously activated pair is now inactive
                await techPairDeactivate.reload();
                expect(techPairDeactivate.active).toBe(false);

                const activeBrowserVersionToAtVersions = await db.BrowserVersionToAtVersion.findAll(
                    { where: { active: true } }
                );
                expect(activeBrowserVersionToAtVersions.length).toBe(1);

                // Verify that new browser/at pair was created
                const activeCreatedBrowserVersions = await db.BrowserVersionToAtVersion.findAll(
                    {
                        where: { active: true },
                        include: [db.AtVersion, db.BrowserVersion]
                    }
                );

                expect(activeCreatedBrowserVersions.length).toBe(1);
                expect(
                    activeCreatedBrowserVersions[0].BrowserVersion.version
                ).toBe(browserVersionNumber2);
                expect(activeCreatedBrowserVersions[0].AtVersion.version).toBe(
                    atVersionNumber2
                );
            });
        });
        it('should activate a deactived tech pair when the tech pair is passed', async () => {
            await dbCleaner(async () => {
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                let testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });

                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                const browser = await db.Browser.findOne();

                // Create tech pair to activate
                let atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                let browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                let techPairActivate = await db.BrowserVersionToAtVersion.create(
                    {
                        at_version_id: atVersion.id,
                        browser_version_id: browserVersion.id,
                        active: false,
                        run_status_id: runStatus.id
                    }
                );

                // Configure the runs with new tech pair
                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
                });

                const activeRuns = await RunService.configureRuns(
                    {
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
                    },
                    commit
                );

                // Check that previously deactivated pair is now active
                await techPairActivate.reload();
                expect(techPairActivate.active).toBe(true);

                const activeBrowserVersionToAtVersions = await db.BrowserVersionToAtVersion.findAll();
                expect(activeBrowserVersionToAtVersions.length).toBe(1);

                let runInDb = await db.Run.findAll({
                    where: { id: Object.values(activeRuns)[0].id }
                });
                expect(runInDb.pop().browser_version_to_at_versions_id).toBe(
                    activeBrowserVersionToAtVersions[0].id
                );
            });
        });
        it('should set an existing inactive run to active', async () => {
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
                const previouslyInactiveRun = await db.Run.create({
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

                const activeRuns = await RunService.configureRuns(
                    {
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
                    },
                    commit
                );

                const keys = Object.keys(activeRuns);
                const runId = parseInt(keys[0]);
                expect(keys.length).toEqual(1);
                // Verify that the run is the one previously populated
                expect(runId).toEqual(previouslyInactiveRun.id);
                expect(activeRuns[runId]).toEqual({
                    id: runId,
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
                    testers: [],
                    tests: expect.any(Array)
                });

                // Verify that pre-existing run is now active
                await previouslyInactiveRun.reload();
                expect(previouslyInactiveRun.active).toBe(true);
            });
        });
        it('should set one run inactive, one run active, and creates a new run when the apg examples change', async () => {
            await dbCleaner(async () => {
                // Data setup for one active run and one inactive run
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                const testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });

                // Use all available APG Examples for this test
                const apgExamples = await db.ApgExample.findAll({
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

                // Create an active run
                const previouslyActiveRun = await db.Run.create({
                    browser_version_id: browserVersion.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    test_cycle_id: testCycle.id,
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExamples[0].id,
                    test_version_id: testVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                // Create an inactive run
                const previouslyInactiveRun = await db.Run.create({
                    browser_version_id: browserVersion.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    test_cycle_id: testCycle.id,
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExamples[1].id,
                    test_version_id: testVersion.id,
                    active: false,
                    run_status_id: runStatus.id
                });

                const activeRuns = await RunService.configureRuns(
                    {
                        test_version_id: testVersion.id,
                        apg_example_ids: apgExamples
                            .map(example => example.id)
                            .slice(1), // remove the first element of examples
                        at_browser_pairs: [
                            {
                                at_name_id: at.at_name_id,
                                at_version: atVersionNumber,
                                browser_id: browser.id,
                                browser_version: browserVersionNumber
                            }
                        ],
                        run_status_id: runStatus.id
                    },
                    commit
                );

                await previouslyActiveRun.reload();
                expect(previouslyActiveRun.active).toBe(false);

                await previouslyInactiveRun.reload();
                expect(previouslyInactiveRun.active).toBe(true);

                const newlyCreatedRun = Object.values(activeRuns).filter(
                    run =>
                        run.id !== previouslyActiveRun.id &&
                        run.id !== previouslyInactiveRun.id
                );
                expect(newlyCreatedRun.length).toBe(1);
                expect(activeRuns[newlyCreatedRun[0].id]).toEqual({
                    id: newlyCreatedRun[0].id,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: browser.name,
                    at_id: at.id,
                    at_key: at.key,
                    at_name: at.AtName.name,
                    at_name_id: at.AtName.id,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExamples[2].directory,
                    apg_example_name: apgExamples[2].name,
                    apg_example_id: apgExamples[2].id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion.id,
                    testers: [],
                    tests: expect.any(Array)
                });
            });
        });
        it('should create new test run for a different test version and same apg exmaple, AT, and browser', async () => {
            await dbCleaner(async () => {
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                const testVersion = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_1
                    }
                });

                const testVersion2 = await db.TestVersion.findOne({
                    where: {
                        git_hash: process.env.IMPORT_ARIA_AT_TESTS_COMMIT_2
                    }
                });

                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [db.AtName]
                });

                const at2 = await db.At.findOne({
                    where: { test_version_id: testVersion2.id },
                    include: [db.AtName]
                });

                const atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
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

                // Create an inactive run with the older test version
                const activeRunOlderTestVersion = await db.Run.create({
                    browser_version_id: browserVersion.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    test_cycle_id: testCycle.id,
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                const activeRuns = await RunService.configureRuns(
                    {
                        test_version_id: testVersion2.id,
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
                    },
                    commit
                );

                // Ensure there is only one run
                const keys = Object.keys(activeRuns);
                expect(keys.length).toEqual(1);

                // Verify that the run with older test version is deactivated
                await activeRunOlderTestVersion.reload();
                expect(activeRunOlderTestVersion.active).toBe(false);

                // Verify that the only run has the newer test version
                const runId = parseInt(keys[0]);
                expect(activeRuns[runId]).toEqual({
                    id: runId,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: browser.name,
                    at_id: at2.id,
                    at_key: at2.key,
                    at_name: at2.AtName.name,
                    at_name_id: at2.AtName.id,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExample.directory,
                    apg_example_name: apgExample.name,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: db.RunStatus.RAW,
                    test_version_id: testVersion2.id,
                    testers: [],
                    tests: []
                });
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

        it('should return the data from an published run', async () => {
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

                const inactiveRun = await db.Run.create({
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
                await db.TesterToRun.create({
                    run_id: run.id,
                    user_id: user.id
                });

                const test = await db.Test.create({
                    name: 'Operate a checkbox',
                    file: 'tests/checkbox/test-01-operate',
                    execution_order: 1,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id
                });

                await db.TestToAt.create({
                    test_id: test.id,
                    at_id: at.id
                });

                // Test for another At only shouldn't be included
                await db.Test.create({
                    name: 'Operate a checkbox',
                    file: 'tests/checkbox/test-01-operate',
                    execution_order: 1,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id
                });

                const testStatus = await db.TestStatus.findOne({
                    where: { name: db.TestStatus.COMPLETE }
                });
                const result = '{ result: "It worked" }';
                const testResult = await db.TestResult.create({
                    test_id: test.id,
                    run_id: run.id,
                    user_id: user.id,
                    status_id: testStatus.id,
                    result: result
                });
                // TestResult for different Run should not be included
                await db.TestResult.create({
                    run_id: inactiveRun.id,
                    test_id: test.id,
                    user_id: user.id,
                    status_id: testStatus.id,
                    result: result
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
                    testers: [user.id],
                    tests: [
                        {
                            id: test.id,
                            file: test.file,
                            name: test.name,
                            execution_order: test.execution_order,
                            results: {
                                [user.id]: {
                                    id: testResult.id,
                                    user_id: user.id,
                                    status: db.TestStatus.COMPLETE,
                                    result: result
                                }
                            }
                        }
                    ]
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

                const draftRunStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.DRAFT }
                });
                const draftRun = await db.Run.create({
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
                await db.TesterToRun.create({
                    run_id: run.id,
                    user_id: user.id
                });

                const test = await db.Test.create({
                    name: 'Operate a checkbox',
                    file: 'tests/checkbox/test-01-operate',
                    execution_order: 1,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id
                });

                await db.TestToAt.create({
                    test_id: test.id,
                    at_id: at.id
                });

                // Test for another At only shouldn't be included
                await db.Test.create({
                    name: 'Operate a checkbox',
                    file: 'tests/checkbox/test-01-operate',
                    execution_order: 1,
                    apg_example_id: apgExample.id,
                    test_version_id: testVersion.id
                });

                const testStatus = await db.TestStatus.findOne({
                    where: { name: db.TestStatus.COMPLETE }
                });
                const result = '{ result: "It worked" }';
                const testResult = await db.TestResult.create({
                    test_id: test.id,
                    run_id: run.id,
                    user_id: user.id,
                    status_id: testStatus.id,
                    result: result
                });
                // TestResult for different Run should not be included
                await db.TestResult.create({
                    run_id: draftRun.id,
                    test_id: test.id,
                    user_id: user.id,
                    status_id: testStatus.id,
                    result: result
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
                    testers: [user.id],
                    tests: [
                        {
                            id: test.id,
                            file: test.file,
                            name: test.name,
                            execution_order: test.execution_order,
                            results: {
                                [user.id]: {
                                    id: testResult.id,
                                    user_id: user.id,
                                    status: db.TestStatus.COMPLETE,
                                    result: result
                                }
                            }
                        }
                    ]
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

                const apgExampleDir = 'checkbox';
                const apgExample1 = testVersion.ApgExamples.find(
                    apgExample => apgExample.directory == apgExampleDir
                );
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
                        supported_ats: new ArrayContainingExactly([
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
                        ]),
                        apg_examples: new ArrayContainingExactly([
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
                                directory: apgExampleDir,
                                name: apgExample1.name
                            }
                        ])
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

    describe('RunService.getTestVersions', () => {
        it('should return all test versions', async () => {
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

                const testVersions = await RunService.getTestVersions();
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
    });
});
