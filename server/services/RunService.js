const db = require('../models/index');
const { Op } = require("sequelize");
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
        // TODO: Get the active test version. if the test version has changed:
        //         mark all the runs from the old test version as inactive
        //         mark all the old apg_examples as inactive


        // Activate/deactive APGExample rows

        const apgExamples = db.ApgExample.findAll({
            where: {
                test_version_id
            }
        });

        let updateActiveApgExample = [];
        let updateInactiveApgExample = [];
        foreach (let agpExample of apgExamples) {
            if (
                apg_example_id.includes(apgExample.id)
                && apgExample.active !== true
            ) {
                updateActiveApgExample.push(apgExample.id)
            }
            else if (
                !apg_example_id.includes(apgExample.id)
                && apgExample.active === true
            ) {
                updateInactiveApgExample.push(apgExample.id)
            }
        }


        // Add at or browser versions to database if new versions are found

        for (let techPair of at_browser_pairs) {
            const browserVersionRow = await db.BrowserVersion.findOrCreate({
                where: {
                    browser_id: techPair.browser_id,
                    version: techPair.browser_version
                }
            });
            techPair.browser_version_id = browserVersionRow[0].id;


            const atVersionRow = await db.AtVersion.findOrCreate({
                where: {
                    version: techPair.at_version,
                    at_name_id: techPair.at_name_id
                }
            });
            techPair.at_version_id = atVersionRow[0].id;
        }

        // Add/Activate/Deactivate BrowserVersionToAtVersion rows

        const techPairs = db.BrowserVersionToAtVersion.findAll({
            include: [
                { model: db.AtVersion, include: [db.AtNAme] }
                { model: db.BrowserVersion, include: [db.Browser] }
            ]
        });

        let updateActiveTechPair = [];
        let updateInactiveTechPair = [];
        let addTechPair = [...at_browser_pairs]; // delete from this as you find in the database
        foreach (let techPair of techPairs) {

            // Find whether or the database techpairs match the
            // configuration
            let matchIndex = addTechPair.findIndex(t => {
                return (
                    t.at_name_id === techPair.atVersion.AtName.id
                    && t.at_version_id === techPair.atVersion.id
                    && t.browser_id === techPair.BrowserVersion.Browser.id
                    && t.browser_version_id === techPair.BrowserVersion.id
                )
            });

            // Remove the element because you don't need ot add just add/updare
            if (matchIndex) {
                addTechPair.splice(matchIndex, 1);

                if (!techPair.active) {
                    updateActiveTechPair.push(techPair);
                }
            }
            else if (techPair.active) {
                updateInactiveTechPair.push(techPair);
            }
        }

        // Add/Activate/Deactivate runs

        const existingRuns = await db.Run.findAll({
            where: {
                test_version_id
            },
            include: [
                db.ApgExample,
                {
                    model: db.BrowserVersionToAtVersion,
                    include: [
                        { mode: db.AtVersion, include [db.AtName] }
                        { model: db.BrowserVersion, include: [db.Browser] }
                    ]
                },
                db.Users
            ]
        });
        console.log("existingRuns:", existingRuns.map(e => e.dataValues));


        // TODO: create this basted on all possible at/browser/apgexample pairs
        const addRuns = [];
        const updateActiveRuns = [];
        const updateInactiveRuns = [];
        for (let existingRun of existingRuns) {
            let matchIndex = addRuns.findIndex(r => {
                return (
                    r.apg_example_id: existingRun.ApgExample.id,
                    r.browser_version_to_at_version: existingRun.BrowserVersionToAtVersion.id
                )
            });

            // Remove the element because you don't need ot add just add/update
            if (matchIndex) {
                addRruns.splice(matchIndex, 1);

                if (!existingRun.active) {
                    updateActiveRuns.push(techPair);
                }
            }
            else if (existingRun.active) {
                updateInactiveRun.push(techPair);
            }
        }

        // TODO:
        // - [ ] add active to TestVersions model

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
                    model: db.BrowserVersionToAtVersion,
                    include: [
                        { mode: db.AtVersion, include [db.AtName] }
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
                    activeRun.BrowserVersionToAtVersion.BrowserVersion
                        .browser_id,
                browser_version:
                    activeRun.BrowserVersionToAtVersion.BrowserVersion
                        .version,
                browser_name:
                    activeRun.BrowserVersionToAtVersion.BrowserVersion
                        .Browser.name,
                // TODO: We might have to add AT Name back another way?
                at_name:
                    activeRun.BrowserVersionToAtVersion.AtVersion.AtName.name,
                at_version:
                    activeRun.BrowserVersionToAtVersion.AtVersion.version,
                apg_example_directory: activeRun.ApgExample.directory,
                apg_example_name: activeRun.ApgExample.name,
                apg_example_id: activeRun.apg_example_id,
                run_status_id: activeRun.run_status_id,
                run_status: activeRun.RunStatus.name,
                test_version_id: activeRun.test_version_id,
                testers: activeRun.Users.map(u => u.id)
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
