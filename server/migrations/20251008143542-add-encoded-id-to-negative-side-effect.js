'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add encodedId column to NegativeSideEffect table
    await queryInterface.addColumn('NegativeSideEffect', 'encodedId', {
      type: Sequelize.TEXT,
      allowNull: false,
      unique: true,
      comment:
        'The encoded negative side effect ID (for backward compatibility)'
    });

    // Add unique index on encodedId
    await queryInterface.addIndex('NegativeSideEffect', ['encodedId'], {
      name: 'negative_side_effect_encoded_id_idx',
      unique: true
    });
  },

  async down(queryInterface) {
    // Remove the index first
    await queryInterface.removeIndex(
      'NegativeSideEffect',
      'negative_side_effect_encoded_id_idx'
    );

    // Remove the column
    await queryInterface.removeColumn('NegativeSideEffect', 'encodedId');
  }
};
