const {
    createUser,
    getUserByUsername,
    removeUserById
} = require('../models/services/UserService');
const startSupertestServer = require('../tests/util/api-server');
const transactionMiddleware = require('./transactionMiddleware');
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
                t: req.t
            });

            res.status(200).send();
        };

        const failingController = async (req /* , res */) => {
            await createUser({
                values: { username: 'nay-it-norks' },
                t: req.t
            });

            throw new Error('This route fails');
        };

        const ignoreErrorsErrorware = (error, req, res, next) => {
            return next(); // would normally be next(error)
        };

        const { sessionAgent, tearDown } = await startSupertestServer({
            graphql: false,
            applyMiddleware: app => {
                app.use(transactionMiddleware.middleware);
            },
            applyErrorware: app => {
                app.use(transactionMiddleware.errorware);
                app.use(ignoreErrorsErrorware);
            },
            pathToRoutes: [
                ['/succeeds', successfulController],
                ['/fails', failingController]
            ]
        });

        const beforeSuccessfulUser = await getUserByUsername({
            username: 'yay-it-works',
            t: false
        });

        const beforeFailedUser = await getUserByUsername({
            username: 'nay-it-norks',
            t: false
        });

        await sessionAgent.get('/succeeds');
        await sessionAgent.get('/fails');

        const successfulUser = await getUserByUsername({
            username: 'yay-it-works',
            t: false
        });

        const failedUser = await getUserByUsername({
            username: 'nay-it-norks',
            t: false
        });

        if (successfulUser) {
            await removeUserById({ id: successfulUser.id, t: false });
        }
        await tearDown();

        expect(beforeSuccessfulUser).toBe(null);
        expect(beforeFailedUser).toBe(null);
        expect(successfulUser).not.toBe(null);
        expect(failedUser).toBe(null);
    });
});
