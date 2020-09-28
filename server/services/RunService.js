const db = require('../models/index');
const { Op } = require("sequelize");
/**
 * @typedef AtBrowserPairing
 * @type {object}
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
    // if (!t) {
    //     t = await db.sequelize.transaction();
    // }
    try {
        // TODO: add active to TestVersions model
        // TODO: Get the active test version. if the test version has changed:
        //         mark all the runs from the old test version as inactive
        //         mark all the old apg_examples as inactive


        // Activate/deactive APGExample rows

        const apgExamples = await db.ApgExample.findAll({
            where: {
                test_version_id
            },
        });

        let updateActiveApgExample = [];
        let updateInactiveApgExample = [];
        for (let apgExample of apgExamples) {
            if (
                apg_example_ids.includes(apgExample.id)
                && apgExample.active !== true
            ) {
                updateActiveApgExample.push(apgExample.id);
            }
            else if (
                !apg_example_ids.includes(apgExample.id)
                && apgExample.active === true
            ) {
                updateInactiveApgExample.push(apgExample.id);
            }
        }

        // Add at or browser versions to database if new versions are found

        for (let techPair of at_browser_pairs) {
            const browserVersionRow = await db.BrowserVersion.findCreateFind({
                where: {
                    browser_id: techPair.browser_id,
                    version: techPair.browser_version
                }
            });
            techPair.browser_version_id = browserVersionRow[0].id;

            const atVersionRow = await db.AtVersion.findCreateFind({
                where: {
                    version: techPair.at_version,
                    at_name_id: techPair.at_name_id
                }
            });

            techPair.at_version_id = atVersionRow[0].id;
        }

        // Add/Activate/Deactivate BrowserVersionToAtVersion rows

        const techPairs = await db.BrowserVersionToAtVersion.findAll({
            include: [
                { model: db.AtVersion, include: [db.AtName] },
                { model: db.BrowserVersion, include: [db.Browser] }
            ]
        });

        let updateActiveTechPairs = [];
        let updateInactiveTechPairs = [];
        let addTechPairs = [...at_browser_pairs]; // delete from this as you find in the database
        for (let techPair of techPairs) {

            // Find whether or the database techpairs match the
            // configuration
            let matchIndex = addTechPairs.findIndex(t => {
                return (
                    t.at_name_id === techPair.AtVersion.AtName.id
                    && t.at_version_id === techPair.AtVersion.id
                    && t.browser_id === techPair.BrowserVersion.Browser.id
                    && t.browser_version_id === techPair.BrowserVersion.id
                );
            });

            // Remove the element because you don't need ot add just add/updare
            if (matchIndex) {
                addTechPairs.splice(matchIndex, 1);

                if (!techPair.active) {
                    updateActiveTechPairs.push(techPair);
                }
            }
            else if (techPair.active) {
                updateInactiveTechPairs.push(techPair);
            }
        }

        let allActiveTechPairs = []; // techPairs ids in order to create the runs.
        if (updateActiveTechPairs.length) {
            let ids = updateActiveTechPairs.map(t => t.id);
            await db.BrowserVersionToAtVersion.update(
                { active: true },
                { where: { id: ids } }
            );
            allActiveTechPairs.push(updateActiveTechPairs.map(t => {
                return {
                    id: t.id,
                    at_version_id: t.AtVersion.id,
                    browser_version_id: t.BrowserVersion.id
                };
            }));
        }

        if (updateInactiveTechPairs.length) {
            let ids = updateInactiveTechPairs.map(t => t.id);
            await db.BrowserVersionToAtVersion.update(
                { active: false },
                { where: { id: ids } }
            );
        }

        if (addTechPairs.length) {
            let dbTechPairs = addTechPairs.map(t => {
                return {
                    browser_version_id: t.browser_version_id,
                    at_version_id: t.at_version_id,
                    active: true
                };
            });
            let newRows = await db.BrowserVersionToAtVersion.bulkCreate(dbTechPairs);
            allActiveTechPairs.push(newRows.map(t => {
                return {
                    id: t.id,
                    at_version_id: t.at_version_id,
                    browser_version_id: t.browser_version_id
                };
            }));

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
                        { model: db.AtVersion, include: [db.AtName] },
                        { model: db.BrowserVersion, include: [db.Browser] }
                    ]
                },
                db.Users
            ]
        });

        // Creating all possible at/browser/apgexample trios to figure out which
        // runs need to be added to teh database
        const addRuns = [];
        for (let apg_example_id of apg_example_ids) {
            for (let techPair of allActiveTechPairs) {
                addRuns.push([
                    apg_example_id,
                    techPair.at_version_id,
                    techPair.browser_version_id,
                    techPair.id
                ]);
            }
        }

        const updateActiveRuns = [];
        const updateInactiveRuns = [];
        for (let existingRun of existingRuns) {
            let matchIndex = addRuns.findIndex(r => {
                return (
                    r.apg_example_id === existingRun.ApgExample.id
                    && r.browser_version_to_at_version === existingRun.BrowserVersionToAtVersion.id
                );
            });

            // Remove the element because you don't need ot add just add/update
            if (matchIndex) {
                addRuns.splice(matchIndex, 1);

                if (!existingRun.active) {
                    updateActiveRuns.push(existingRun);
                }
            }
            else if (existingRun.active) {
                updateInactiveRuns.push(existingRun);
            }
        }

        if (updateActiveRuns.length) {
            let ids = updateActiveRuns.map(t => t.id);
            await db.Run.update(
                { active: true },
                { where: { id: ids } }
            );
        }

        if (updateInactiveRuns.length) {
            let ids = updateInactiveRuns.map(t => t.id);
            await db.Run.update(
                { active: false },
                { where: { id: ids } }
            );
        }


        let runStatus = await db.RunStatus.findOne({
            where: { name: 'raw' }
        });

        // TODO, not sure if we should remove this
        let ats = await db.At.findAll({
            where: { test_version_id }
        });
        let atNameToAt = ats.reduce((acc, curr) => {
            acc[curr.at_name_id] = curr.id;
            return acc;
        }, {});

        // TODO, remove this:
        let user = await db.Users.findOne();
        if (!user) {
            let user = await db.Users.create({});
        }
        const testCycle = await db.TestCycle.findCreateFind({
            where: {
                test_version_id,
                created_user_id: user.id
            }
        });

        if (addRuns.length) {
            let dbRuns = addRuns.map(r => {
                let at_id = atNameToAt[r.at_name_id];
                return {
                    browser_version_id: r.browser_version_id, // eventually will remove column
                    at_version_id: r.at_version_id,           // eventually will remove column
                    test_cycle_id: testCycle.id,              // eventually will remove column
                    at_id,                                    // maybe eventually will remove column
                    browser_version_to_at_versions_id: r.browser_version_to_at_versions_id,
                    apg_example_id: r.apg_example_id,
                    test_version_id,
                    active: true,
                    run_status_id: runStatus.id
                };
            });
            await db.Run.bulkCreate(dbRuns);
        }

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
                        { model: db.AtVersion, include: [db.AtName] },
                        { model: db.BrowserVersion, include: [db.Browser] }
                    ]
                },
                db.Users
            ]
        });

        const ats = await db.At.findAll({
            where: {
                test_version_id: activeRuns[0].test_version_id
            }
        });

        let atNameIdToAt = ats.reduce((acc, at) => {
            acc[at.at_name_id] = at;
            return acc;
        }, {});

        return activeRuns.reduce((acc, activeRun) => {
            let atNameId = activeRun.BrowserVersionToAtVersion.AtVersion.AtName.id;

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
                at_id: atNameIdToAt[atNameId].id,
                at_key: atNameIdToAt[atNameId].key,
                at_name: activeRun.BrowserVersionToAtVersion.AtVersion.AtName.name,
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
