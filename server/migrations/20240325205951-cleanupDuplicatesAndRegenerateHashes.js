'use strict';

const { regenerateResultsAndRecalculateHashes } = require('./utils');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            // Remove unnecessarily created test plan versions for ALL 35 test
            // plan versions for commit,
            // https://github.com/w3c/aria-at/commit/836fb2a997f5b2844035b8c934f8fda9833cd5b2
            // None of the following ever left R&D
            await queryInterface.sequelize.query(
                `delete
                 from "TestPlanVersion"
                 where id in
                       (55591, 55592, 55593, 55594, 55595, 55596, 55597, 55598, 55599, 55600, 55601, 55602, 55603, 55604, 55605, 55606,
                        55607, 55608, 55609, 55610, 55611, 55612, 55613, 55614, 55615, 55616, 55617, 55618, 55619, 55620, 55621, 55622,
                        55623, 55624, 55625)
                   and "gitSha" = '836fb2a997f5b2844035b8c934f8fda9833cd5b2'`,
                {
                    transaction
                }
            );

            // Reset the phases and remove deprecatedAt dates for versions affected by above wrongly created versions:
            // checkbox-tri-state
            // link-css
            // link-img-alt
            // main
            // meter
            // radiogroup-roving-tabindex
            // slider-multithumb
            // switch
            await queryInterface.sequelize.query(
                `update "TestPlanVersion"
                 set phase          = 'RD',
                     "deprecatedAt" = null
                 where id = 1566 and directory = 'switch' and "gitSha" = '9d0e4e3d1040d64d9db69647e615c4ec0be723c2'
                    or id = 1591 and directory = 'meter' and "gitSha" = '32d2d9db48becfc008fc566b569ac1563576ceb9'
                    or id = 1618 and directory = 'main' and "gitSha" = 'c87a66ea13a2b6fac6d79fe1fb0b7a2f721dcd22'
                    or id = 1798 and directory = 'checkbox-tri-state' and "gitSha" = 'b3d0576a2901ea7f100f49a994b64edbecf81cff'
                    or id = 2129 and directory = 'link-img-alt' and "gitSha" = 'dc637636cff74b51f5c468ff3b81bd1f38aefbb2'
                    or id = 2162 and directory = 'link-css' and "gitSha" = '7a8454bca6de980199868101431817cea03cce35'
                    or id = 2245 and directory = 'slider-multithumb' and "gitSha" = 'b5fe3efd569518e449ef9a0978b0dec1f2a08bd6'
                    or id = 2347 and directory = 'radiogroup-roving-tabindex' and "gitSha" = '1768070bd68beefef29284b568d2da910b449c14'`,
                {
                    transaction
                }
            );

            // Deprecate older uncaught instance of a 2nd DRAFT version
            // Toggle Button V23.12.13 and set deprecatedAt to date of when
            // newer Toggle Button V23.12.14 would have overwritten it,
            // minus 2 seconds to simulate what would happen in
            // updatePhaseResolver
            await queryInterface.sequelize.query(
                `update "TestPlanVersion"
                 set phase          = 'DEPRECATED',
                     "deprecatedAt" = '2023-12-14 21:51:35.527000 +00:00'
                 where id = 62309
                   and directory = 'toggle-button'
                   and "versionString" = 'V23.12.13'`,
                {
                    transaction
                }
            );

            // Update Radio Group Example Using aria-activedescendant V24.03.13 to include the tokenized assertion phrase for JAWS and NVDA
            // because it wasn't properly handled by the import script because #942 was not yet in production when version was imported
            const testPlanVersions = await queryInterface.sequelize.query(
                `SELECT id, tests FROM "TestPlanVersion" WHERE directory = 'radiogroup-aria-activedescendant' AND "versionString" = 'V24.03.13'`,
                {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }
            );
            await Promise.all(
                testPlanVersions.map(async ({ id, tests }) => {
                    const updatedTests = JSON.stringify(
                        tests.map(test => {
                            const atKey = test.at.key;
                            if (atKey === 'voiceover_macos') return test;

                            test.assertions.map(assertion => {
                                if (
                                    assertion.assertionPhrase !==
                                    'switch from reading mode to interaction mode'
                                )
                                    return assertion;

                                if (atKey === 'jaws')
                                    assertion.assertionPhrase =
                                        'switch from virtual cursor active to PC cursor active';
                                if (atKey === 'nvda')
                                    assertion.assertionPhrase =
                                        'switch from browse mode to focus mode';
                                return assertion;
                            });

                            test.renderableContent.assertions.map(assertion => {
                                if (
                                    assertion.assertionPhrase !==
                                    'switch from reading mode to interaction mode'
                                )
                                    return assertion;

                                if (atKey === 'jaws')
                                    assertion.assertionPhrase =
                                        'switch from virtual cursor active to PC cursor active';
                                if (atKey === 'nvda')
                                    assertion.assertionPhrase =
                                        'switch from browse mode to focus mode';
                                return assertion;
                            });

                            return test;
                        })
                    );
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET tests = ? WHERE id = ?`,
                        { replacements: [updatedTests, id], transaction }
                    );
                })
            );

            // Regenerate hashes since TestPlanVersion.tests modified
            await regenerateResultsAndRecalculateHashes(
                queryInterface,
                transaction,
                { pruneOldVersions: false }
            );
        });
    },
    async down() {}
};
