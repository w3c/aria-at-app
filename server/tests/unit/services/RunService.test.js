const { dbCleaner } = require('../../util/db-cleaner');
const db = require('../../../models/index');
const RunService = require('../../../services/RunService');

describe('RunService', () => {
    describe('RunService.configureRuns', () => {
        it('should create all possible runs if no previous runs exist', async () => {
            const data = {
                test_version_id: 1,
                apg_example_ids: 1,
                at_browser_pairs: []
            };
            await expect(RunService.configureRuns(data)).resolves.toEqual([]);
        });
    });

    describe('RunService.getActiveRuns', () => {
        it('should create all possible runs if no previous runs exist', async () => {
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
                    test_cycle_id: testCycle.id,
                    at_version_id: atVersion.id,
                    at_id: at.id,
                    browser_version_id: browserVersion.id,
                    apg_example_id: apgExample.id
                });

                const activeRuns = await RunService.getActiveRuns();
                expect(activeRuns.length).toEqual(1);
            });
        });
    });
});
