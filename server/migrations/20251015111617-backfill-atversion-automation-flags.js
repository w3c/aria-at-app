'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [ats] = await queryInterface.sequelize.query(
        'select id, name from "At"',
        { transaction }
      );

      const supported = {
        'VoiceOver for macOS': ['13.0', '14.0', '15.0'],
        NVDA: ['2025.2', '2024.4.1', '2024.1', '2023.3.3', '2023.3'],
        JAWS: ['2025.2508.120']
      };

      for (const at of ats) {
        const names = supported[at.name] || [];
        if (!names.length) continue;
        await queryInterface.sequelize.query(
          `update "AtVersion"
           set "supportedByAutomation" = true
           where "atId" = :atId and name in (:names)`,
          { replacements: { atId: at.id, names }, transaction }
        );

        // latestAutomationSupporting should be the most recent supported version by releasedAt
        const [rows] = await queryInterface.sequelize.query(
          `select id from "AtVersion"
           where "atId" = :atId and "supportedByAutomation" = true
           order by "releasedAt" desc`,
          { replacements: { atId: at.id }, transaction }
        );
        if (rows.length) {
          const latestId = rows[0].id;
          await queryInterface.sequelize.query(
            `update "AtVersion" set "latestAutomationSupporting" = false where "atId" = :atId`,
            { replacements: { atId: at.id }, transaction }
          );
          await queryInterface.sequelize.query(
            `update "AtVersion" set "latestAutomationSupporting" = true where id = :id`,
            { replacements: { id: latestId }, transaction }
          );
        }
      }

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'update "AtVersion" set "supportedByAutomation" = false, "latestAutomationSupporting" = false'
    );
  }
};
