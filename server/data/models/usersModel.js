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

const UserToRole = sequelize.define(
    'UserToRole',
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'user_to_role',
        createdAt: false,
        updatedAt: false
    }
);

module.exports = { Users, UserToRole };
