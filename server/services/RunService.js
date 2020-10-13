const db = require('../models/index');
/**
 * @typedef AtBrowserPairing
 * @type {object}
 * @property {number} at_name_id
 * @property {string} at_version
 * @property {number} browser_id
 * @property {string} browser_version
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
 *
 * @typedef ApgExample
 * @type {object}
 * @property {number} id
 * @property {name} directory
 * @property {string} directory
 *
 * @typedef TestSuiteVersion
 * @type {object}
 * @property {number} id
 * @property {string} git_repo
 * @property {string} git_tag
 * @property {string} git_hash
 * @property {string} git_commit_msg
 * @property {Object.Date} date
 * @property {Array.<At>}          supported_ats
 * @property {Array.<ApgExample>} apg_examples
 *
 * @typedef At
 * @type {object}
 * @property {number} at_name_id
 * @property {string} at_name
 * @property {string} at_key
 * @property {number} at_id
 *
 * @typedef Browser
 * @type {object}
 * @property {number} id
 * @property {string} name
 *
 * @typedef ApgExample
 * @type {object}
 * @property {number} id
 * @property {string} directory
 * @property {string} name
 *
 * @typedef RunConfigration
 * @type {object}
 * @property {TestSuiteVersion}         active_test_version
 *                                      TestVersion where active: true
 * @property {Array.<AtBrowserPairing>} active_at_browser_pairs
 *                                      browser_version_to_at_version where
 *                                      active true
 * @property {Array.<number>}           active_apg_examples
 *                                      ApgExample where: active true
 * @property {Array.<Browser>}          browsers
 *                                      All Browsers;
 *
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
        // (De)activate TestVersion
        await db.TestVersion.update({ active: false }, { where: {} });
        await db.TestVersion.update(
            { active: true },
            { where: { id: test_version_id } }
        );
        // (De)activate/deactive ApgExamples
        await db.ApgExample.update({ active: false }, { where: {} });
        await db.ApgExample.update(
            { active: true },
            {
                where: {
                    ...test_version_id,
                    id: apg_example_ids
                }
            }
        );

        // Add at or browser versions to database if new versions are found

        for (let techPair of at_browser_pairs) {
            const browserVersionRows = await db.BrowserVersion.findCreateFind({
                where: {
                    browser_id: techPair.browser_id,
                    version: techPair.browser_version
                }
            });
            techPair.browser_version_id = browserVersionRows[0].id;

            const atVersionRows = await db.AtVersion.findCreateFind({
                where: {
                    version: techPair.at_version,
                    at_name_id: techPair.at_name_id
                }
            });

            techPair.at_version_id = atVersionRows[0].id;
        }

        // Add/Activate/Deactivate BrowserVersionToAtVersion rows
        //
        // TODO MAYBE: Rebecca's Idea for how to rewrite this code
        // Deactive all BrowserVersionToAtVersions
        // Bulk find/create all matching pairs
        //   insert into BrowserVersionToAtVersions with data from
        //   at_browser_pairs and active=true, relying on the uniqueness constraint
        // Bulk active those
        //   UPDATE BrowserVersionToAtVersions active=true where hassame values
        //   as at_browser_pairs

        /// all the browser_version_To_At_version

        const techPairs = await db.BrowserVersionToAtVersion.findAll({
            include: [
                { model: db.AtVersion, include: [db.AtName] },
                { model: db.BrowserVersion, include: [db.Browser] }
            ]
        });

        let updateActiveTechPairs = [];
        let updateInactiveTechPairs = [];
        let addTechPairs = [...at_browser_pairs]; // delete from this as you find in the database
        let activeTechPairIds = [];
        for (let techPair of techPairs) {
            // Find whether or the database techpairs match the
            // configuration
            /// where bowser_version_to_at_version has the save values as at_browser_pairs
            let matchIndex = addTechPairs.findIndex(t => {
                return (
                    t.at_version_id === techPair.at_version_id &&
                    t.browser_version_id === techPair.browser_version_id
                );
            });

            // Remove the element because you don't need ot add just add/updare
            if (matchIndex > -1) {
                activeTechPairIds.push(techPair.id);
                addTechPairs.splice(matchIndex, 1);

                if (!techPair.active) {
                    updateActiveTechPairs.push(techPair);
                }
            } else if (techPair.active) {
                updateInactiveTechPairs.push(techPair);
            }
        }

        if (updateActiveTechPairs.length) {
            let ids = updateActiveTechPairs.map(t => t.id);
            await db.BrowserVersionToAtVersion.update(
                { active: true },
                { where: { id: ids } }
            );
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

            let newRows = await db.BrowserVersionToAtVersion.bulkCreate(
                dbTechPairs
            );
            activeTechPairIds = activeTechPairIds.concat(
                newRows.map(r => r.id)
            );
        }

        // WE CAN DELETE THIS WHEN WE REMOVE NULL CONSTRAINTS
        let activeTechPairData = [];
        for (let id of activeTechPairIds) {
            let techPair = await db.BrowserVersionToAtVersion.findOne({
                where: { id },
                include: [
                    { model: db.AtVersion, include: [db.AtName] },
                    { model: db.BrowserVersion, include: [db.Browser] }
                ]
            });
            activeTechPairData.push({
                id,
                browser_version_id: techPair.browser_version_id,
                at_version_id: techPair.at_version_id,
                at_name_id: techPair.AtVersion.at_name_id
            });
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

        await db.Run.update(
            { active: false },
            {
                where: {
                    test_version_id: {
                        [db.Sequelize.Op.not]: test_version_id
                    }
                }
            }
        );

        // Creating all possible at/browser/apgexample trios to figure out which
        // runs need to be added to teh database
        const addRuns = [];
        for (let apg_example_id of apg_example_ids) {
            for (let techPair of activeTechPairData) {
                addRuns.push({
                    apg_example_id,
                    at_version_id: techPair.at_version_id,
                    browser_version_id: techPair.browser_version_id,
                    browser_version_to_at_version_id: techPair.id,
                    at_name_id: techPair.at_name_id
                });
            }
        }

        const updateActiveRuns = [];
        const updateInactiveRuns = [];
        for (let existingRun of existingRuns) {
            let matchIndex = addRuns.findIndex(r => {
                return (
                    r.apg_example_id === existingRun.ApgExample.id &&
                    r.browser_version_to_at_version_id ===
                        existingRun.BrowserVersionToAtVersion.id
                );
            });

            // Remove the element because you don't need ot add just add/update
            if (matchIndex > -1) {
                addRuns.splice(matchIndex, 1);

                if (!existingRun.active) {
                    updateActiveRuns.push(existingRun);
                }
            } else if (existingRun.active) {
                updateInactiveRuns.push(existingRun);
            }
        }

        if (updateActiveRuns.length) {
            let ids = updateActiveRuns.map(t => t.id);
            await db.Run.update({ active: true }, { where: { id: ids } });
        }

        if (updateInactiveRuns.length) {
            let ids = updateInactiveRuns.map(t => t.id);
            await db.Run.update({ active: false }, { where: { id: ids } });
        }

        let runStatus = await db.RunStatus.findOne({
            where: { name: 'raw' }
        });

        // TODO: we should remove this
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
            user = await db.Users.create({});
        }
        const testCycles = await db.TestCycle.findCreateFind({
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
                    at_version_id: r.at_version_id, // eventually will remove column
                    test_cycle_id: testCycles[0].id, // eventually will remove column
                    at_id, // eventually will remove column
                    browser_version_to_at_versions_id:
                        r.browser_version_to_at_version_id,
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

async function sequelizeRunsToJsonRuns(sequelizeRuns) {
    let ats = {};
    if (sequelizeRuns.length > 0) {
        ats = await db.At.findAll({
            where: {
                test_version_id: sequelizeRuns[0].test_version_id
            }
        });
    }

    return sequelizeRuns.reduce((acc, run) => {
        let atNameId = run.BrowserVersionToAtVersion.AtVersion.AtName.id;
        let at = ats.find(at => at.at_name_id == atNameId);

        acc[run.id] = {
            id: run.id,
            browser_id: run.BrowserVersionToAtVersion.BrowserVersion.browser_id,
            browser_version:
                run.BrowserVersionToAtVersion.BrowserVersion.version,
            browser_name:
                run.BrowserVersionToAtVersion.BrowserVersion.Browser.name,
            at_id: at.id,
            at_key: at.key,
            at_name: run.BrowserVersionToAtVersion.AtVersion.AtName.name,
            at_name_id: run.BrowserVersionToAtVersion.AtVersion.AtName.id,
            at_version: run.BrowserVersionToAtVersion.AtVersion.version,
            apg_example_directory: run.ApgExample.directory,
            apg_example_name: run.ApgExample.name,
            apg_example_id: run.apg_example_id,
            run_status_id: run.run_status_id,
            run_status: run.RunStatus.name,
            test_version_id: run.test_version_id,
            testers: run.Users.map(u => u.id)
        };
        return acc;
    }, {});
}

/**
 * Gets all active runs
 *
 * @return {Object.<number, Run>} - A mapping from run_id to Run
 */
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

        return await sequelizeRunsToJsonRuns(activeRuns);
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
async function getPublishedRuns() {
    try {
        const publishedRuns = await db.Run.findAll({
            where: {},
            include: [
                { model: db.RunStatus, where: { name: db.RunStatus.FINAL } },
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

        return await sequelizeRunsToJsonRuns(publishedRuns);
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

function sequelizeTestVersionToJsonTestSuiteVersion(sequelizeTestVersion) {
    if (sequelizeTestVersion) {
        const supportedAts = sequelizeTestVersion.Ats.reduce((acc, at) => {
            acc.push({
                at_name_id: at.at_name_id,
                at_name: at.AtName.name,
                at_key: at.key,
                at_id: at.id
            });
            return acc;
        }, []);
        const apgExamples = sequelizeTestVersion.ApgExamples.reduce(
            (acc, apgExample) => {
                acc.push({
                    id: apgExample.id,
                    name: apgExample.name,
                    directory: apgExample.directory
                });
                return acc;
            },
            []
        );
        return {
            id: sequelizeTestVersion.id,
            git_repo: sequelizeTestVersion.git_repo,
            git_tag: sequelizeTestVersion.git_tag,
            git_hash: sequelizeTestVersion.git_hash,
            git_commit_msg: sequelizeTestVersion.git_commit_msg,
            date: sequelizeTestVersion.datetime,
            supported_ats: supportedAts,
            apg_examples: apgExamples
        };
    } else {
        return {};
    }
}

/**
 * Gets the currently active test version, apg examples and browser version to AT version pairs
 *
 * @return {Object.<RunConfiguration>}
 *
 */
async function getActiveRunsConfiguration() {
    try {
        const activeTestVersion = await db.TestVersion.findOne({
            where: { active: true },
            include: [db.ApgExample, { model: db.At, include: db.AtName }]
        });
        const activeTestVersionJson = sequelizeTestVersionToJsonTestSuiteVersion(
            activeTestVersion
        );
        let activeApgExampleIds = [];
        if (activeTestVersion) {
            activeApgExampleIds = activeTestVersion.ApgExamples.filter(
                apgExample => apgExample.active
            ).map(apgExample => apgExample.id);
        }
        const activeAtBrowserPairs = await db.BrowserVersionToAtVersion.findAll(
            {
                where: { active: true },
                include: [db.AtVersion, db.BrowserVersion]
            }
        ).reduce((acc, tech) => {
            acc.push({
                at_name_id: tech.AtVersion.at_name_id,
                at_version: tech.AtVersion.version,
                browser_id: tech.BrowserVersion.browser_id,
                browser_version: tech.BrowserVersion.version
            });
            return acc;
        }, []);
        const browsers = await db.Browser.findAll().reduce((acc, browser) => {
            acc.push({
                id: browser.id,
                name: browser.name
            });
            return acc;
        }, []);
        return {
            active_test_version: activeTestVersionJson,
            active_apg_examples: activeApgExampleIds,
            active_at_browser_pairs: activeAtBrowserPairs,
            browsers: browsers
        };
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all more recent versions of the ARIA-AT test repository in order of there release.
 *
 * @return {Array.<TestSuiteVersion>}
 *
 */
async function getNewTestVersions() {
    try {
        const activeTestVersion = await db.TestVersion.findOne({
            where: { active: true },
            attributes: ['datetime']
        });
        let where = {};
        if (activeTestVersion) {
            where = {
                datetime: { [db.Sequelize.Op.gte]: activeTestVersion.datetime }
            };
        }
        return await db.TestVersion.findAll({
            where: where,
            include: [db.ApgExample, { model: db.At, include: db.AtName }]
        }).reduce((acc, testVersion) => {
            acc.push(sequelizeTestVersionToJsonTestSuiteVersion(testVersion));
            return acc;
        }, []);
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    configureRuns,
    getActiveRuns,
    getPublishedRuns,
    getActiveRunsConfiguration,
    getNewTestVersions
};
