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
        // CODE: Get the active test version. if the test version has changed:
        //         mark all the runs from the old test version as inactive
        //         mark all the old apg_examples as inactive
        //         mark all the at_browser_pairs as inactive

        // TODO: There is probably a way to get this is a subquery in db.Run.findAll
        let statusesNotFinal = await db.RunStatus.findAll({
            attributes: ['id'],
            where: {
                [Op.not]: {
                    name: 'final'
                }
            }
        }).map(r => r.id);


        // CODE: get all the runs with the new test_version_id
        const existingRuns = await db.Run.findAll({
            where: {
                test_version_id,
                run_status_id: statusesNotFinal
            },
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
        console.log("existingRuns:", existingRuns.map(e => e.dataValues));

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

        // TODO: there might be a way to combine the following two queries
        const atIds = ab.At.findAll({
            where: { test_version_id }
        }).map(a => a.id);
        const techPairs = db.BrowserVersionToAtAndAtVersion.findAll({
            where: {
                test_version_id,
                at_id: atIds
            },
            include: [
                { model: db.At, include: [db.AtName] },
                db.AtVersion,
                { model: db.BrowserVersion, include: [db.Browser] }
            ]
        });

        // TODO: is there all the appropriate entries in at_version?
        // TODO: is there all the appropriate entries in browser_version?
        //let atVersionsString = 


        let updateActiveTechPair = [];
        let updateInactiveTechPair = [];
        let addTechPair = [...at_browser_pairs]; // delete from this as you find in the database
        foreach (let techPair of techPairs) {

            // Find whether or the database techpairs match the
            // configuration
            let matchIndex = addTechPair.findIndex(t => {
                return (
                    t.at_id === techPair.at_id
                    && t.at_version === techPair.atVersion.version
                    && t.browser_id === techPair.BrowserVersion.Browser.id
                    && t.browser_version === techPair.BrowserVersion.version
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

        // THEN go through all the runs and somehow mark as active or inactive
        // and make new runs for new pairs??


        // ----------------------
        // We need to go through all the apg examples
        //   If apg examples removed
        //     remove "active" from runs with apg example
        //   If apg example added
        //     add "active" to all runs with apg example

        // We need to go through all the at_browser_pairs
        //   If at_browser_pair removed
        //     remove "active" from runs with at_browser_pair
        //   If at_browser_pair added
        //      add "active" as long as it's not an of a deactived apg_example


        // ^ instead, go through each run and update it's active or invactive status based on above?

        // TODO:
        // - [X] double check this aligns with the notes
        // - [X] put tests into the test db
        // - [ ] implement this part
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
