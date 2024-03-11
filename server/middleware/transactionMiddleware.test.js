const {
    createUser,
    getUserByUsername,
    removeUserById
} = require('../models/services/UserService');
const startSupertestServer = require('../tests/util/api-server');
const db = require('../models/index');

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

describe('transactionMiddleware', () => {
    it('uses transaction middleware to reset database state when errors occur', async () => {
        const successfulController = async (req, res) => {
            await createUser({
                values: { username: 'yay-it-works' },
                transaction: req.transaction
            });

            res.status(200).send();
        };

        const failingController = async (req /* , res */) => {
            await createUser({
                values: { username: 'nay-it-norks' },
                transaction: req.transaction
            });

            throw new Error('This route fails');
        };

        const ignoreErrorsErrorware = (error, req, res, next) => {
            return next(); // would normally be next(error)
        };

        const { sessionAgent, tearDown } = await startSupertestServer({
            graphql: false,
            applyErrorware: app => {
                app.use(ignoreErrorsErrorware);
            },
            pathToRoutes: [
                ['/succeeds', successfulController],
                ['/fails', failingController]
            ]
        });

        const beforeSuccessfulUser = await getUserByUsername({
            username: 'yay-it-works',
            transaction: false
        });

        const beforeFailedUser = await getUserByUsername({
            username: 'nay-it-norks',
            transaction: false
        });

        await sessionAgent.get('/succeeds');
        await sessionAgent.get('/fails');

        const successfulUser = await getUserByUsername({
            username: 'yay-it-works',
            transaction: false
        });

        const failedUser = await getUserByUsername({
            username: 'nay-it-norks',
            transaction: false
        });

        if (successfulUser) {
            await removeUserById({ id: successfulUser.id, transaction: false });
        }
        await tearDown();

        expect(beforeSuccessfulUser).toBe(null);
        expect(beforeFailedUser).toBe(null);
        expect(successfulUser.username).toBe('yay-it-works');
        expect(failedUser).toBe(null);
    });
});
