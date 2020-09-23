const db = require('../models/index');
/**
 * @typedef AtBrowserPairing
 * @type {object}
 * @property at_id
 * @property at_version
 * @property browser_id
 * @property browser_version
 *
 * @typedef Run
 * @type {object}
 * @property {number} id
 * @property {string} browser_id
 * @property {string} browser_version
 * @property {string} browser_name
 * @property {string} at_id
 * @property {string} at_key
 * @property {string} at_name
 * @property {string} at_version
 * @property {string} apg_example_directory
 * @property {string} apg_example_name
 * @property {number} apg_example_id
 * @property {number} run_status_id
 * @property {string} run_status
 * @property {number} test_version_id
 * @property {Array.<number>} testers - user_id of assigned testers
 */

/**
 * Create/Updates the set of all actionable runs.
 *
 * @param {object} data
 * @param {number} data.test_version_id
 * @param {Array.<number>} data.apg_example_ids
 * @param {Array.<AtBrowserPairing>} data.at_browser_pairs
 *
 * @return {Object.<number, Run>} - the actionable runs @see {@link getActionableRuns}
 *
 */

/* eslint-disable no-unused-vars */
async function configureRuns({
    test_version_id,
    apg_example_ids,
    at_browser_pairs
}) {
    try {
        return await this.getActiveRuns();
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all active runs
 *
 * @return {Object.<number, Run>} - A mapping from run_id to Run
 */

/* eslint-disable no-unreachable */
async function getActiveRuns() {
    try {
        const activeRuns = await db.Run.findAll({
            where: { active: true },
            include: [
                db.RunStatus,
                db.ApgExample,
                {
                    model: db.BrowserVersionToAtAndAtVersion,
                    include: [
                        { model: db.At, include: [db.AtName] },
                        db.AtVersion,
                        { model: db.BrowserVersion, include: [db.Browser] }
                    ]
                },
                db.Users
            ]
        });
        return activeRuns.reduce((acc, activeRun) => {
            acc[activeRun.id] = {
                id: activeRun.id,
                browser_id:
                    activeRun.BrowserVersionToAtAndAtVersion.BrowserVersion
                        .browser_id,
                browser_version:
                    activeRun.BrowserVersionToAtAndAtVersion.BrowserVersion
                        .version,
                browser_name:
                    activeRun.BrowserVersionToAtAndAtVersion.BrowserVersion
                        .Browser.name,
                at_id: activeRun.BrowserVersionToAtAndAtVersion.at_id,
                at_key: activeRun.BrowserVersionToAtAndAtVersion.At.key,
                at_name:
                    activeRun.BrowserVersionToAtAndAtVersion.At.AtName.name,
                at_version:
                    activeRun.BrowserVersionToAtAndAtVersion.AtVersion.version,
                apg_example_directory: activeRun.ApgExample.directory,
                apg_example_name: activeRun.ApgExample.name,
                apg_example_id: activeRun.apg_example_id,
                run_status_id: activeRun.run_status_id,
                run_status: activeRun.RunStatus.name,
                test_version_id: activeRun.test_version_id,
                testers: activeRun.Users.map(u => Users.id)
            };
            return acc;
        }, {});
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all published runs
 *
 * @return {Object.<number, Run>} - A mapping from run_id to Run
 */

/* eslint-disable no-unreachable */
async function getPublishedRuns() {
    try {
        return {};
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    configureRuns,
    getActiveRuns,
    getPublishedRuns
};
