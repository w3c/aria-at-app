const create = require('../../tests/util/create');

const Users = {
    create,
    findAll() {
        return [];
    }
};
const UserToRole = {
    create
};

const Role = {
    findAll() {
        return [
            {
                dataValues: { name: 'tester', id: 1 }
            },
            {
                dataValues: { name: 'admin', id: 2 }
            }
        ];
    }
};

module.exports = { Users, UserToRole, Role };
