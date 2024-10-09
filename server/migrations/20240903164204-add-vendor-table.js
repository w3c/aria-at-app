'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Vendor', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addColumn('User', 'vendorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Vendor',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('At', 'vendorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Vendor',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('At', 'vendorId');
    await queryInterface.removeColumn('User', 'vendorId');
    await queryInterface.dropTable('Vendor');
  }
};
