const create = require('../../tests/util/create');
const listOfAts = require('../../tests/mock-data/listOfATs.json');
const users = require('../../tests/mock-data/users.json');
const atsData = require('../../tests/mock-data/listOfATs.json');
const db = {};

db.Users = {
    create,
    findAll() {
        return users.map(user => ({
            dataValues: { ...user },
            getRoles() {
                return [
                    { dataValues: { name: 'admin' } },
                    { dataValues: { name: 'tester' } }
                ];
            }
        }));
    }
};

db.UserToRole = {
    create
};

db.Role = {
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

db.UserToAt = {
    findAll() {
        return listOfAts.atsDB;
    }
};

db.AtName = {
    ats: atsData.atsDB,
    findAll() {
        return this.ats;
    }
};

db.sequelize = {
    define: obj => obj,
    query: () => [[{ at_name_id: 1, at_name: 'Foo', active: true }]]
}

module.exports = db;
