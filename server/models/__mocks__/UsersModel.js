const create = require('../../tests/util/create');
const listOfAts = require('../../tests/mock-data/listOfATs.json');

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

const UserToAt = {
    findAll() {
        return listOfAts.atsDB;
    }
};

module.exports = { Users, UserToRole, Role, UserToAt };
