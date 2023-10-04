const convertDateToString = require('../util/convertDateToString');

('use strict');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'versionString',
                { type: Sequelize.DataTypes.TEXT },
                { transaction }
            );

            const [testPlanVersions] = await queryInterface.sequelize.query(
                `
                    SELECT id, directory, "updatedAt"
                    FROM "TestPlanVersion"
                    ORDER BY directory, "updatedAt", id
                `,
                { transaction }
            );

            let currentDirectory;
            let currentVersionStringBase;
            let currentCount;
            for (const testPlanVersion of testPlanVersions) {
                const versionStringBase = `V${convertDateToString(
                    testPlanVersion.updatedAt,
                    'YY.MM.DD'
                )}`;

                if (testPlanVersion.directory !== currentDirectory) {
                    currentDirectory = testPlanVersion.directory;
                    currentVersionStringBase = versionStringBase;
                    currentCount = 0;
                } else if (versionStringBase === currentVersionStringBase) {
                    currentCount += 1;
                } else {
                    currentVersionStringBase = versionStringBase;
                    currentCount = 0;
                }

                const versionString =
                    currentCount === 0
                        ? currentVersionStringBase
                        : `${currentVersionStringBase}-${currentCount}`;

                await queryInterface.sequelize.query(
                    `
                        UPDATE "TestPlanVersion"
                        SET "versionString" = ?
                        WHERE id = ?
                    `,
                    {
                        replacements: [versionString, testPlanVersion.id],
                        transaction
                    }
                );
            }

            await queryInterface.changeColumn(
                'TestPlanVersion',
                'versionString',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false
                },
                { transaction }
            );

            await queryInterface.addConstraint('TestPlanVersion', {
                fields: ['directory', 'versionString'],
                type: 'unique',
                name: 'uniqueVersionStringByDirectory',
                transaction
            });
        });
    },

    async down(queryInterface /* , Sequelize */) {
        await queryInterface.removeColumn('TestPlanVersion', 'versionString');
    }
};
