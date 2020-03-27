const UsersService = require('../../../data/services/usersService');

const newUser = require('../../mock-data/newUser.json');
const newUserToRole = require('../../mock-data/newUserToRole.json');
jest.mock('../../../data/models/usersModel');
describe('UsersService', () => {
    describe('UsersService.addUser', () => {
        it('should have a addUser function', () => {
            expect(typeof UsersService.addUser).toBe('function');
        });
        it('should return newUser', async () => {
            await expect(UsersService.addUser(newUser)).resolves.toEqual(
                newUser
            );
        });
    });
    describe('UsersService.addUserToRole', () => {
        it('should have a addUserToRole function', () => {
            expect(typeof UsersService.addUserToRole).toBe('function');
        });
        it('should return userToRole', async () => {
            await expect(
                UsersService.addUserToRole(newUserToRole)
            ).resolves.toEqual(newUserToRole);
        });
    });
});
