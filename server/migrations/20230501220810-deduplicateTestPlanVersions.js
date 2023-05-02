'use strict';

const { omit } = require('lodash');
const objectHash = require('object-hash');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Should be identical to the hash function used in the import script
        const hashTests = tests => {
            return objectHash(
                tests.map(test => ({
                    ...omit(test, ['id', 'renderedUrls']),
                    assertions: test.assertions.map(assertion => ({
                        ...omit(assertion, ['id'])
                    })),
                    scenarios: test.scenarios.map(scenario => ({
                        ...omit(scenario, ['id'])
                    }))
                }))
            );
        };

        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'hashedTests',
                { type: Sequelize.DataTypes.TEXT },
                { transaction }
            );

            const results = await queryInterface.sequelize.query(
                `SELECT COUNT(*) FROM "TestPlanVersion"`,
                { transaction }
            );
            const [[{ count: testPlanVersionCount }]] = results;

            const iterationsNeeded = Math.ceil(testPlanVersionCount / 10);

            let testPlanVersionIdsByHashedTests = {};

            for (let i = 0; i < iterationsNeeded; i += 1) {
                const multipleOf100 = i % 10 === 0;
                if (multipleOf100)
                    // eslint-disable-next-line no-console
                    console.info(
                        'Indexing',
                        i * 10,
                        'of',
                        Number(testPlanVersionCount)
                    );
                const currentOffset = i * 10;

                const [testPlanVersions] = await queryInterface.sequelize.query(
                    `SELECT id, tests FROM "TestPlanVersion" ORDER BY id LIMIT 10 OFFSET ?`,
                    { replacements: [currentOffset], transaction }
                );

                await Promise.all(
                    testPlanVersions.map(async testPlanVersion => {
                        const hashedTests = hashTests(testPlanVersion.tests);

                        if (!testPlanVersionIdsByHashedTests[hashedTests]) {
                            testPlanVersionIdsByHashedTests[hashedTests] = [];
                        }
                        testPlanVersionIdsByHashedTests[hashedTests].push(
                            testPlanVersion.id
                        );

                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanVersion" SET "hashedTests" = ? WHERE id = ?`,
                            {
                                replacements: [hashedTests, testPlanVersion.id],
                                transaction
                            }
                        );
                    })
                );
            }

            // eslint-disable-next-line no-console
            console.info(
                'Indexed',
                Number(testPlanVersionCount),
                'of',
                Number(testPlanVersionCount)
            );

            const uniqueHashCount = Object.keys(
                testPlanVersionIdsByHashedTests
            ).length;

            const batchCount = 100;
            const iterationsNeeded2 = Math.ceil(uniqueHashCount / batchCount);

            for (let i = 0; i < iterationsNeeded2; i += 1) {
                // eslint-disable-next-line no-console
                console.info('Fixing', i * batchCount, 'of', uniqueHashCount);

                const offset = i * batchCount;
                const equivalentIds = Object.values(
                    testPlanVersionIdsByHashedTests
                ).slice(
                    offset,
                    offset + 100 < uniqueHashCount
                        ? offset + 100
                        : uniqueHashCount
                );

                await Promise.all(
                    equivalentIds.map(async ([keptId, ...unkeptIds]) => {
                        if (!unkeptIds.length) return;
                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanReport" SET "testPlanVersionId" = ? WHERE "testPlanVersionId" IN (?)`,
                            {
                                replacements: [keptId, unkeptIds],
                                transaction
                            }
                        );
                    })
                );

                const duplicateIds = equivalentIds
                    .map(ids => ids.slice(1))
                    .flat();

                await queryInterface.sequelize.query(
                    `DELETE FROM "TestPlanVersion" WHERE id IN (?)`,
                    {
                        replacements: [duplicateIds],
                        transaction
                    }
                );
            }

            // eslint-disable-next-line no-console
            console.info('Fixed', uniqueHashCount, 'of', uniqueHashCount);

            await queryInterface.changeColumn(
                'TestPlanVersion',
                'hashedTests',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    unique: true
                },
                { transaction }
            );
        });
    },

    async down(queryInterface /* , Sequelize */) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'hashedTests',
                { transaction }
            );
        });
    }
};
