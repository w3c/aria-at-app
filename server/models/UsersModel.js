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

const Role = sequelize.define(
    'Role',
    {
        name: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: 'role',
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

const TesterToRun = sequelize.define(
    'TesterToRun',
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        run_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'tester_to_run',
        createdAt: false,
        updatedAt: false
    }
);

const UserToAt = sequelize.define(
    'UserToAt',
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        at_name_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'user_to_at',
        createdAt: false,
        updatedAt: false
    }
);

module.exports = { Users, UserToRole, Role, TesterToRun, UserToAt };
