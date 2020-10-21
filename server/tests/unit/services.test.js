process.env = {
    ...process.env,
    GITHUB_TEAM_TESTER: 'Team 1',
    GITHUB_TEAM_ADMIN: 'Team 2'
};
const moxios = require('moxios');
const UsersService = require('../../services/UsersService');
const GithubService = require('../../services/GithubService');
const ATService = require('../../services/ATService');
const TestService = require('../../services/TestService');

const { dbCleaner } = require('../util/db-cleaner');
const db = require('../../models/index');

const newUser = require('../mock-data/newUser.json');

afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
    done();
});

describe('UsersService', () => {
    describe('UsersService.getUser', () => {
        it('should have a getUser function', () => {
            expect(typeof UsersService.getUser).toBe('function');
        });
        it('should return a user', async () => {
            await dbCleaner(async () => {
                let newUserRow = await db.Users.create(newUser);
                let newUserToRoleRows = (await db.Role.findAll()).map(role => {
                    return {
                        user_id: newUserRow.dataValues.id,
                        role_id: role.dataValues.id
                    };
                });
                await db.UserToRole.bulkCreate(newUserToRoleRows);

                await expect(
                    UsersService.getUser({ ...newUser })
                ).resolves.toEqual({
                    ...newUser,
                    id: newUserRow.dataValues.id,
                    roles: ['admin', 'tester']
                });
            });
        });
    });
    describe('UsersService.addUser', () => {
        it('should have a addUser function', () => {
            expect(typeof UsersService.addUser).toBe('function');
        });
        it('should return newUser', async () => {
            await dbCleaner(async () => {
                let returnedValue = await UsersService.addUser(newUser);

                // TODO: maybe all Services should return simple objects
                // instead of Sequalize objects.
                await expect(returnedValue.dataValues).toEqual({
                    ...newUser,
                    id: returnedValue.id
                });
            });
        });
    });

    describe('UsersService.addUserToRole', () => {
        it('should have a addUserToRole function', () => {
            expect(typeof UsersService.addUserToRole).toBe('function');
        });
        it('should return userToRole', async () => {
            await dbCleaner(async () => {
                let newUserRow = await db.Users.create(newUser);
                let role = await db.Role.findOne({
                    attributes: ['id'],
                    where: {
                        name: 'tester'
                    }
                });
                let returnedValue = await UsersService.addUserToRole({
                    user_id: newUserRow.dataValues.id,
                    role_id: role.dataValues.id
                });

                // TODO: maybe all Services should return simple objects
                // instead of Sequalize objects.
                await expect(returnedValue.dataValues).toEqual({
                    user_id: newUserRow.dataValues.id,
                    role_id: role.dataValues.id,
                    id: returnedValue.dataValues.id
                });
            });
        });
    });
    describe('UsersService.getAllTesters', () => {
        it('should have a getAllTesters function', () => {
            expect(typeof UsersService.getAllTesters).toBe('function');
        });
        it('return a list of users', async () => {
            await dbCleaner(async () => {
                let addedUser = await UsersService.addUser(newUser);
                let returnedValue = await UsersService.getAllTesters();

                expect(returnedValue[0]).toEqual({
                    ...newUser,
                    id: addedUser.dataValues.id,
                    configured_ats: []
                });
            });
        });
    });
});

describe('GithubService', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    describe('GithubService.login', () => {
        it('should have a url attribute', () => {
            expect(typeof GithubService.url).toBe('string');
        });
    });
    describe('GithubService.authorize', () => {
        it('should have a authorize function', () => {
            expect(typeof GithubService.authorize).toBe('function');
        });
        it('should return a token', async () => {
            const code = '123456';
            const token = 'token12345';
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 200,
                    response: {
                        access_token: token
                    }
                });
            });
            const accessToken = await GithubService.authorize(code);

            await expect(accessToken).toBe(token);
        });
    });
    describe('GithubService.getUser', () => {
        it('should have a getUser function', () => {
            expect(typeof GithubService.getUser).toBe('function');
        });
        it('should fail where there is no accessToken option', async () => {
            await expect(GithubService.getUser()).rejects.toThrow();
        });
        it('should return', async () => {
            const options = { accessToken: '123456' };
            const responseObj = {
                data: {
                    viewer: {
                        login: 'evmiguel',
                        name: 'Erika Miguel'
                    }
                }
            };
            const userObj = {
                username: 'evmiguel',
                name: 'Erika Miguel'
            };
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 200,
                    response: responseObj
                });
            });

            const received = await GithubService.getUser(options);
            expect(received).toEqual(userObj);
        });
    });

    // Putting this test here because GitHub is part of the signup process
    describe('UsersService.signupUser', () => {
        it('should have a signupUser function', () => {
            expect(typeof UsersService.signupUser).toBe('function');
        });

        it('should save a user and role if the user is new', async () => {
            await dbCleaner(async () => {
                moxios.wait(() => {
                    const request = moxios.requests.mostRecent();
                    request.respondWith({
                        status: 200,
                        response: {
                            data: {
                                organization: {
                                    teams: {
                                        edges: [
                                            {
                                                node: {
                                                    name: 'Team 1'
                                                }
                                            },
                                            {
                                                node: {
                                                    name: 'Team 2'
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    });
                });
                const userSaved = await UsersService.signupUser({
                    user: { ...newUser, name: newUser.fullname }
                });

                expect(userSaved).toEqual({
                    email: 'foo@bar.com',
                    fullname: 'Foo Bar',
                    id: userSaved.id,
                    username: 'foobar'
                });
            });
        });
    });
});

describe('ATService', () => {
    describe('ATService.getATs', () => {
        it('should have a getATs function', () => {
            expect(typeof ATService.getATs).toBe('function');
        });
        it('should return a list of AT names', async () => {
            await dbCleaner(async () => {
                let expected = [
                    { name: 'assitiveTech1' },
                    { name: 'assitiveTech2' }
                ];
                await db.AtName.bulkCreate(expected);
                // Add the extra entries from the import script
                expected = [
                    { name: 'JAWS' },
                    { name: 'NVDA' },
                    { name: 'VoiceOver for macOS' },
                    ...expected
                ];
                const returnedAts = (await ATService.getATs()).map(at => ({
                    name: at.dataValues.name
                }));
                expect(returnedAts).toEqual(expected);
            });
        });
    });
});

describe('TestService', () => {
    describe('TestService.importTests', () => {
        it('should have an importTests function', () => {
            expect(typeof TestService.importTests).toBe('function');
        });
        it('should return true when has exists', async () => {
            await dbCleaner(async () => {
                const testVersionHash = '1234abcd';
                await db.TestVersion.create({
                    git_hash: testVersionHash
                });
                await expect(
                    await TestService.importTests(testVersionHash)
                ).toEqual(true);
            });
        });
    });
    describe('TestService.saveTestResults', () => {
        it('should save completed results', async () => {
            await dbCleaner(async () => {
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                const test = await db.Test.findOne({ where: { id: 1 } });
                const testVersionId = test.test_version_id;
                const apgExampleId = test.apg_example_id;

                const at = await db.At.findOne({
                    where: { test_version_id: test.test_version_id },
                    include: [db.AtName]
                });
                const atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const browser = await db.Browser.findOne();
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                let tech = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                const run = await db.Run.create({
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExampleId,
                    test_version_id: testVersionId,
                    active: true,
                    run_status_id: runStatus.id
                });

                const user = await db.Users.create();
                const result = { cmd1: 'test output' };
                const serializedForm = [{ data: 'form' }];

                const testResult = {
                    test_id: test.id,
                    run_id: run.id,
                    user_id: user.id,
                    result,
                    serialized_form: serializedForm
                };

                const testStatus = await db.TestStatus.findOne({
                    where: { name: 'complete' }
                });
                const service = await TestService.saveTestResults(testResult);
                expect(service).toEqual({
                    test_id: test.id,
                    run_id: run.id,
                    user_id: user.id,
                    result,
                    serialized_form: serializedForm,
                    id: expect.any(Array),
                    status: testStatus.name
                });
            });
        });
        it('should save partial results', async () => {
            await dbCleaner(async () => {
                const browserVersionNumber = '1.2.3';
                const atVersionNumber = '3.2.1';

                const test = await db.Test.findOne({ where: { id: 1 } });
                const testVersionId = test.test_version_id;
                const apgExampleId = test.apg_example_id;

                const at = await db.At.findOne({
                    where: { test_version_id: test.test_version_id },
                    include: [db.AtName]
                });
                const atVersion = await db.AtVersion.create({
                    at_name_id: at.AtName.id,
                    version: atVersionNumber
                });

                const browser = await db.Browser.findOne();
                const browserVersion = await db.BrowserVersion.create({
                    browser_id: browser.id,
                    version: browserVersionNumber
                });

                const runStatus = await db.RunStatus.findOne({
                    where: { name: db.RunStatus.RAW }
                });

                let tech = await db.BrowserVersionToAtVersion.create({
                    at_version_id: atVersion.id,
                    browser_version_id: browserVersion.id,
                    active: true,
                    run_status_id: runStatus.id
                });

                const run = await db.Run.create({
                    browser_version_to_at_versions_id: tech.id,
                    apg_example_id: apgExampleId,
                    test_version_id: testVersionId,
                    active: true,
                    run_status_id: runStatus.id
                });

                const user = await db.Users.create();

                // partial results from the iframe are denoted by a null result object
                const result = null;
                const serializedForm = [{ data: 'form' }];

                const testResult = {
                    test_id: test.id,
                    run_id: run.id,
                    user_id: user.id,
                    result,
                    serialized_form: serializedForm
                };

                const testStatus = await db.TestStatus.findOne({
                    where: { name: 'incomplete' }
                });
                const service = await TestService.saveTestResults(testResult);
                expect(service).toEqual({
                    test_id: test.id,
                    run_id: run.id,
                    user_id: user.id,
                    result,
                    serialized_form: serializedForm,
                    id: expect.any(Array),
                    status: testStatus.name
                });
            });
        });
    });
});
