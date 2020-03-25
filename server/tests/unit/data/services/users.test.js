const UsersService = require('../../../../data/services/usersService');
global.sequelize = {
    define: jest.fn()
};
jest.mock('../../../../data/models/usersModel');
const newUser = require('../../../mock-data/newUser.json');

describe('UsersService.addUser', () => {
    it('should have a addUser function', () => {
        expect(typeof UsersService.addUser).toBe('function');
    });
    it('should returtn newUser', async () => {
        await expect(UsersService.addUser(newUser)).resolves.toEqual(newUser);
    });
});
