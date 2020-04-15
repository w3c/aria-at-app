const { DataTypes } = require('sequelize');
const sequelize = global.sequelize;

const ATModel = sequelize.define(
    'ATModel',
    {
        name: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: 'at_name',
        createdAt: false,
        updatedAt: false
    }
);

module.exports = { ATModel };
