'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Replace unique index (atId, bugId) with unique index (atId, bugId, url, title)
    // so that only fully identical entries are rejected. Allows duplicate bugId per AT
    // when URL or Title differ.
    try {
      await queryInterface.removeIndex(
        'AtBug',
        'atbug_at_id_bug_id_unique_idx'
      );
    } catch (e) {
      // Index may not exist; continue
    }

    try {
      await queryInterface.addIndex(
        'AtBug',
        ['atId', 'bugId', 'url', 'title'],
        {
          name: 'atbug_at_id_bug_id_url_title_unique_idx',
          unique: true
        }
      );
    } catch (e) {
      console.error('Error adding new unique index to AtBug:', e);
      throw e;
    }
  },

  async down(queryInterface) {
    // Restore previous unique index on (atId, bugId)
    try {
      await queryInterface.removeIndex(
        'AtBug',
        'atbug_at_id_bug_id_url_title_unique_idx'
      );
    } catch (e) {
      // Index may not exist; continue
    }

    try {
      await queryInterface.addIndex('AtBug', ['atId', 'bugId'], {
        name: 'atbug_at_id_bug_id_unique_idx',
        unique: true
      });
    } catch (e) {
      console.error('Error restoring previous unique index to AtBug:', e);
      throw e;
    }
  }
};
