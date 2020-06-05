const create = require('../../tests/util/create');
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
        return [
            {
                dataValues: { at_name_id: 1 }
            }
        ];
    }
};

db.AtName = {
    ats: atsData.atsDB,
    findAll() {
        return this.ats;
    }
};

db.TestVersion = {
    versions: [1234],
    findAll({ where: { git_hash } }) {
        return this.versions.includes(git_hash)
            ? [
                  {
                      dataValues: { git_hash: 1234 }
                  }
              ]
            : [];
    }
};

db.sequelize = {
    define: obj => obj,
    query: () => [[{ at_name_id: 1, at_name: 'Foo', active: true }]]
};

module.exports = db;
