const { DataTypes } = require('sequelize');
const sequelize = global.sequelize;

const Users = sequelize.define(
    'Users',
    {
        fullname: {
            type: DataTypes.TEXT
        },
        username: {
            type: DataTypes.TEXT
        },
        email: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: 'users',
        createdAt: false,
        updatedAt: false
    }
);

module.exports = Users;
