const SequelizeMock = require('sequelize-mock');
const mockUsers = require('../mock-data/users.json');

const validMockUser = mockUsers[0];
const invalidMockUser = mockUsers[1];

const DBConnectionMock = new SequelizeMock();
const UserMock = DBConnectionMock.define('user', validMockUser);

describe('UserModel Data Checks', () => {
    it('should return valid user for id query', () => {
        return UserMock.findOne({
            where: { id: 1 }
        }).then(user => {
            const id = user.get('id');
            const username = user.get('username');

            expect(id).toEqual(validMockUser.id);
            expect(username).toEqual(validMockUser.username);
        });
    });

    it('should return valid user for username query', () => {
        return UserMock.findOne({
            where: { username: 'foobar' }
        }).then(user => {
            const id = user.get('id');
            const username = user.get('username');

            expect(id).toEqual(validMockUser.id);
            expect(username).toEqual(validMockUser.username);
        });
    });

    it('should not be valid user query', () => {
        return UserMock.findOne({
            where: { id: 2 }
        }).then(user => {
            const id = user.get('id');

            expect(id).not.toEqual(validMockUser.id);
        });
    });

    it('should be valid user if roles data exists', () => {
        return UserMock.findOne({
            where: { id: 1 }
        }).then(user => {
            const id = user.get('id');
            const username = user.get('username');

            expect(id).toEqual(validMockUser.id);
            expect(username).toEqual(validMockUser.username);
            expect(validMockUser).toHaveProperty('roles');
        });
    });

    it('should not be valid user if no roles data exists', () => {
        return UserMock.findOne({
            where: { id: 2 }
        }).then(user => {
            const id = user.get('id');

            expect(id).toEqual(invalidMockUser.id);
            expect(invalidMockUser).not.toHaveProperty('roles');
        });
    });
});
