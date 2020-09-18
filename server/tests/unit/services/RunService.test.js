const { dbCleaner } = require('../../util/db-cleaner');
const db = require('../../../models/index');
const RunService = require('../../../services/RunService');

describe('RunService', () => {
    describe('RunService.configureRuns', () => {
        it.skip('should create all possible runs if no previous runs exist', async () => {
            await dbCleaner(async () => {
                const testVersion = await db.TestVersion.create();
                const apgExampleDirectory = 'checkbox';
                const apgExampleName = 'Checkbox Example (Two State)';
                const apgExample = await db.ApgExample.create({
                    test_version_id: testVersion.id,
                    directory: apgExampleDirectory,
                    name: apgExampleName
                });
                const atNameString = 'NVDA';
                const atName = await db.AtName.create({
                    name: atNameString
                });
                const atKey = 'nvda';
                const at = await db.At.create({
                    at_name_id: atName.id,
                    test_version_id: testVersion.id,
                    key: atKey
                });
                const browser = await db.Browser.findOne({
                    where: { name: db.Browser.CHROME }
                });
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';
                const data = {
                    test_version_id: testVersion.id,
                    apg_example_ids: apgExample.id,
                    at_browser_pairs: [
                        {
                            at_id: at.id,
                            at_version: atVersionNumber,
                            browser_id: browser.id,
                            browser_version: browserVersionNumber
                        }
                    ]
                };

                const activeRuns = await RunService.configureRuns(data);
                const keys = Object.keys(activeRuns);
                const runId = keys[0];
                expect(keys.length).toEqual(1);
                expect(activeRuns[runId]).toEqual({
                    id: runId,
                    browser_id: browser.id,
                    browser_version: browserVersionNumber,
                    browser_name: db.Browser.CHROME,
                    at_id: at.id,
                    at_key: atKey,
                    at_name: atNameString,
                    at_version: atVersionNumber,
                    apg_example_directory: apgExampleDirectory,
                    apg_example_name: apgExampleName,
                    apg_example_id: apgExample.id,
                    run_status_id: null,
                    run_status: null,
                    test_version_id: testVersion.id,
                    testers: []
                });
            });
        });
    });

    describe('RunService.getActiveRuns', () => {
        it('should return an empty object if there are no active runs', async () => {
            await dbCleaner(async () => {
                const testVersion = await db.TestVersion.create();
                const apgExample = await db.ApgExample.create({
                    test_version_id: testVersion.id
                });
                const user = await db.Users.create();
                const testCycle = await db.TestCycle.create({
                    test_version_id: testVersion.id,
                    created_user_id: user.id
                });
                const atName = await db.AtName.create();
                const atVersion = await db.AtVersion.create({
                    at_name_id: atName.id
                });
                const at = await db.At.create({
                    at_name_id: atName.id,
                    test_version_id: testVersion.id
                });
                const browser = await db.Browser.create();
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id
                });
                await db.Run.create({
                    active: false,
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    apg_example_id: apgExample.id
                });

                const activeRuns = await RunService.getActiveRuns();
                expect(activeRuns).toEqual({});
            });
        });

        it('should return the data from an active run', async () => {
            await dbCleaner(async () => {
                const testVersion = await db.TestVersion.create();
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
                const atName = await db.AtName.create({
                    name: atNameString
                });
                const atVersionNumber = '3.2.1';
                const atVersion = await db.AtVersion.create({
                    at_name_id: atName.id,
                    version: atVersionNumber
                });
                const atKey = 'nvda';
                const at = await db.At.create({
                    at_name_id: atName.id,
                    test_version_id: testVersion.id,
                    key: atKey
                });
                const browser = await db.Browser.findOne({
                    where: { name: db.Browser.CHROME }
                });
                const browserVersionNumber = '1.2.3';
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });
                const browserVersionToAtAndAtVersion = await db.BrowserVersionToAtAndAtVersion.create(
                    {
                        browser_version_id: browserVersion.id,
                        at_id: at.id,
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
                    browser_version_to_at_and_at_versions_id:
                        browserVersionToAtAndAtVersion.id,
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
                    at_key: atKey,
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
        it.skip('should return an empty object if there are no published runs', async () => {
        });

        it.skip('should return the data from a published run', async () => {
        });
    });
});
