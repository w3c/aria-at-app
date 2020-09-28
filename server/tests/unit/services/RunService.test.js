const { dbCleaner } = require('../../util/db-cleaner');
const db = require('../../../models/index');
const RunService = require('../../../services/RunService');

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
    done();
});

describe('RunService', () => {
    // describe('RunService.configureRuns', () => {
    //     it('should create all possible runs if no previous runs exist', async () => {
    //         await dbCleaner(async () => {
    //             const testVersion = await db.TestVersion.create();
    //             const apgExampleDirectory = 'checkbox';
    //             const apgExampleName = 'Checkbox Example (Two State)';
    //             const apgExample = await db.ApgExample.create({
    //                 test_version_id: testVersion.id,
    //                 directory: apgExampleDirectory,
    //                 name: apgExampleName
    //             });
    //             const atNameString = 'NVDA';
    //             const atName = await db.AtName.create({
    //                 name: atNameString
    //             });
    //             const atKey = 'nvda';
    //             const at = await db.At.create({
    //                 at_name_id: atName.id,
    //                 test_version_id: testVersion.id,
    //                 key: atKey
    //             });
    //             const browser = await db.Browser.findOne({
    //                 where: { name: db.Browser.CHROME }
    //             });
    //             const browserVersionNumber = '1.2.3';
    //             const atVersionNumber = '3.2.1';
    //             const data = {
    //                 test_version_id: testVersion.id,
    //                 apg_example_ids: apgExample.id,
    //                 at_browser_pairs: [
    //                     {
    //                         at_id: at.id,
    //                         at_version: atVersionNumber,
    //                         browser_id: browser.id,
    //                         browser_version: browserVersionNumber
    //                     }
    //                 ]
    //             };

    //             const activeRuns = await RunService.configureRuns(data);
    //             const keys = Object.keys(activeRuns);
    //             const runId = keys[0];
    //             expect(keys.length).toEqual(1);
    //             expect(activeRuns[runId]).toEqual({
    //                 id: runId,
    //                 browser_id: browser.id,
    //                 browser_version: browserVersionNumber,
    //                 browser_name: db.Browser.CHROME,
    //                 at_id: at.id,
    //                 at_key: atKey,
    //                 at_name: atNameString,
    //                 at_version: atVersionNumber,
    //                 apg_example_directory: apgExampleDirectory,
    //                 apg_example_name: apgExampleName,
    //                 apg_example_id: apgExample.id,
    //                 run_status_id: null,
    //                 run_status: null,
    //                 test_version_id: testVersion.id,
    //                 testers: []
    //             });
    //         });
    //     });
    // });

    describe('RunService.configureRuns', () => {
        it('Activate deactived run', async () => {
            await dbCleaner(async () => {
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                // Get information to add run under one test version

                const testVersion = await db.TestVersion.findOne({
                    where: { git_hash: '413183a5f6909940f163a433931bd17ab6b48886' }
                });
                const apgExample = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion.id }
                });
                const at = await db.At.findOne({
                    where: { test_version_id: testVersion.id },
                    include: [ db.AtName ]
                });
                let atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                })

                // Get information to add run under different test version

                const testVersion2 = await db.TestVersion.findOne({
                    where: { git_hash: '826d2c2a6a9c5b9c7045d6fa7e1b575ce4fb9762' }
                });
                const apgExample2 = await db.ApgExample.findOne({
                    where: { test_version_id: testVersion2.id }
                });
                const at2 = await db.At.findOne({
                    where: { test_version_id: testVersion2.id },
                    include: [ db.AtName ]
                });

                // ADD RUNS FOR TESTING

                const browser = await db.Browser.findOne();
                let browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                })

                let runStatus = await db.RunStatus.findOne({
                    where: { name: 'raw' }
                });

                let tech = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: false,
                    run_status_id: runStatus.id
                });
                let tech2 = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: false,
                    run_status_id: runStatus.id
                });

                // We will need to remove this column!!
                const user = await db.Users.create();
                const testCycle = await db.TestCycle.create({
                    test_version_id: testVersion.id,
                    created_user_id: user.id
                });

                await db.Run.bulkCreate([
                    {
                        browser_version_id: browserVersion.id, // eventually will remove columns
                        at_version_id: atVersion.id, // eventually will remove column
                        at_id: at.id, // eventually will remove this column maybe
                        test_cycle_id: testCycle.id, // eventually will remove column
                        browser_version_to_at_versions_id: tech.id,
                        apg_example_id: apgExample.id,
                        test_version_id: testVersion.id,
                        active: false,
                        run_status_id: runStatus.id
                    },
                    {
                        browser_version_id: browserVersion.id, // eventually will remove columns
                        at_version_id: atVersion.id, // eventually will remove column
                        at_id: at2.id, // eventually will remove this column maybe
                        test_cycle_id: testCycle.id, // eventually will remove column
                        browser_version_to_at_versions_id: tech2.id,
                        apg_example_id: apgExample2.id,
                        test_version_id: testVersion2.id,
                        active: false,
                        run_status_id: runStatus.id
                    }
                ]);

                // No change in activeRuns
                const data = {
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
                    at_id: at.id,
                    at_key: at.key,
                    at_name: at.AtName.name,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExample.directory,
                    apg_example_name: apgExample.name,
                    apg_example_id: apgExample.id,
                    run_status_id: runStatus.id,
                    run_status: runStatus.name,
                    test_version_id: testVersion.id,
                    testers: []
                });
            });
        });
    });


    // describe('RunService.getActiveRuns', () => {
    //     it('should return an empty object if there are no active runs', async () => {
    //         await dbCleaner(async () => {
    //             const testVersion = await db.TestVersion.create();
    //             const apgExample = await db.ApgExample.create({
    //                 test_version_id: testVersion.id
    //             });
    //             const user = await db.Users.create();
    //             const testCycle = await db.TestCycle.create({
    //                 test_version_id: testVersion.id,
    //                 created_user_id: user.id
    //             });
    //             const atName = await db.AtName.create();
    //             const atVersion = await db.AtVersion.create({
    //                 at_name_id: atName.id
    //             });
    //             const at = await db.At.create({
    //                 at_name_id: atName.id,
    //                 test_version_id: testVersion.id
    //             });
    //             const browser = await db.Browser.create();
    //             const browserVersion = await db.BrowserVersion.create({
    //                 browser_id: browser.id
    //             });
    //             await db.Run.create({
    //                 active: false,
    //                 test_cycle_id: testCycle.id,
    //                 at_version_id: atVersion.id,
    //                 at_id: at.id,
    //                 browser_version_id: browserVersion.id,
    //                 apg_example_id: apgExample.id
    //             });

    //             const activeRuns = await RunService.getActiveRuns();
    //             expect(activeRuns).toEqual({});
    //         });
    //     });

    //     it('should return the data from an active run', async () => {
    //         await dbCleaner(async () => {
    //             const testVersion = await db.TestVersion.create();
    //             const apgExampleDirectory = 'checkbox';
    //             const apgExampleName = 'Checkbox Example (Two State)';
    //             const apgExample = await db.ApgExample.create({
    //                 test_version_id: testVersion.id,
    //                 directory: apgExampleDirectory,
    //                 name: apgExampleName
    //             });
    //             const user = await db.Users.create();
    //             const testCycle = await db.TestCycle.create({
    //                 test_version_id: testVersion.id,
    //                 created_user_id: user.id
    //             });
    //             const atNameString = 'NVDA';
    //             const atName = await db.AtName.create({
    //                 name: atNameString
    //             });
    //             const atVersionNumber = '3.2.1';
    //             const atVersion = await db.AtVersion.create({
    //                 at_name_id: atName.id,
    //                 version: atVersionNumber
    //             });
    //             const atKey = 'nvda';
    //             const at = await db.At.create({
    //                 at_name_id: atName.id,
    //                 test_version_id: testVersion.id,
    //                 key: atKey
    //             });
    //             const browser = await db.Browser.findOne({
    //                 where: { name: db.Browser.CHROME }
    //             });
    //             const browserVersionNumber = '1.2.3';
    //             const browserVersion = await db.BrowserVersion.create({
    //                 browser_id: browser.id,
    //                 version: browserVersionNumber
    //             });
    //             const browserVersionToAtVersion = await db.BrowserVersionToAtVersion.create(
    //                 {
    //                     browser_version_id: browserVersion.id,
    //                     at_version_id: atVersion.id
    //                 }
    //             );
    //             const runStatus = await db.RunStatus.findOne({
    //                 where: { name: db.RunStatus.FINAL }
    //             });
    //             const run = await db.Run.create({
    //                 active: true,
    //                 test_cycle_id: testCycle.id,
    //                 at_version_id: atVersion.id,
    //                 at_id: at.id,
    //                 browser_version_id: browserVersion.id,
    //                 browser_version_to_at_versions_id:
    //                     browserVersionToAtVersion.id,
    //                 apg_example_id: apgExample.id,
    //                 run_status_id: runStatus.id,
    //                 test_version_id: testVersion.id
    //             });

    //             const activeRuns = await RunService.getActiveRuns();
    //             expect(Object.keys(activeRuns).length).toEqual(1);
    //             expect(activeRuns[run.id]).toEqual({
    //                 id: run.id,
    //                 browser_id: browser.id,
    //                 browser_version: browserVersionNumber,
    //                 browser_name: db.Browser.CHROME,
    //                 at_id: at.id,
    //                 at_key: atKey,
    //                 at_name: atNameString,
    //                 at_version: atVersionNumber,
    //                 apg_example_directory: apgExampleDirectory,
    //                 apg_example_name: apgExampleName,
    //                 apg_example_id: apgExample.id,
    //                 run_status_id: runStatus.id,
    //                 run_status: db.RunStatus.FINAL,
    //                 test_version_id: testVersion.id,
    //                 testers: []
    //             });
    //         });
    //     });
    // });

    // describe('RunService.getPublishedRuns', () => {
    //     it.skip('should return an empty object if there are no published runs', async () => {});

    //     it.skip('should return the data from a published run', async () => {});
    // });
});
