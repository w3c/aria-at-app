const { dbCleaner } = require('../util/db-cleaner');
const RunService = require('../../services/RunService');

jest.unmock('../../models/index.js');

describe('RunService', () => {
    describe('RunService.configureRuns', () => {
        it('should create all possible runs if no previous runs exist', async () => {
			const data = { test_version_id: 1, apg_example_ids: 1, at_browser_pairs: []};
            await expect(RunService.configureRuns(data)).resolves.toEqual({});
        });
    });

    describe('RunService.getActionableRuns', () => {
        it('should create all possible runs if no previous runs exist', () => {
			return dbCleaner(async () => {
				await expect(RunService.getActionableRuns()).resolves.toEqual(2);
			});
        });
    });
});
