import { storeFactory } from './util';
import { handleCheckLoggedIn, handleLogout } from '../actions/login';
import { handleGetValidAts } from '../actions/ats';
import { handleSetUserAts, getAllUsers } from '../actions/users';
import moxios from 'moxios';

describe('login actions dispatchers', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    test('updates state correctly on login', async () => {
        const store = storeFactory();
        const expectedState = {
            login: {
                isLoggedIn: true,
                username: 'foobar',
                name: 'Foo Bar',
                email: 'foo@bar.com',
                id: undefined,
                roles: undefined
            },
            cycles: {
                cyclesById: {},
                runsForCycle: {},
                testSuiteVersions: []
            },
            ats: [],
            users: {
                users: []
            }
        };

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: {
                    username: expectedState.login.username,
                    name: expectedState.login.name,
                    email: expectedState.login.email
                }
            });
        });

        await store.dispatch(handleCheckLoggedIn());
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });

    test('updates state correctly on logout', async () => {
        const store = storeFactory();
        const expectedState = {
            login: {
                isLoggedIn: false
            },
            cycles: {
                cyclesById: {},
                runsForCycle: {},
                testSuiteVersions: []
            },
            ats: [],
            users: {
                users: []
            }
        };

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200
            });
        });

        await store.dispatch(handleLogout());
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });
});

describe('ats action dispatchers', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });
    test('updates state correctly on get ATS', async () => {
        const store = storeFactory();
        const expectedState = {
            login: {
                isLoggedIn: false
            },
            cycles: {
                cyclesById: {},
                runsForCycle: {},
                testSuiteVersions: []
            },
            ats: {
                names: ['JAWS', 'NVDA', 'VoiceOver']
            },
            users: {
                users: []
            }
        };

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: {
                    names: expectedState.ats.names
                }
            });
        });

        await store.dispatch(handleGetValidAts());
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });
});

describe('users action dispatchers', () => {
    let expectedState;
    beforeEach(() => {
        expectedState = {
            login: {
                isLoggedIn: false
            },
            cycles: {
                cyclesById: [],
                runsForCycle: {},
                testSuiteVersions: []
            },
            ats: [],
            users: {
                users: [
                    {
                        id: 1,
                        username: 'foobar',
                        configured_ats: [
                            {
                                at_name_id: 1,
                                active: false
                            },
                            {
                                at_name_id: 2,
                                active: true
                            }
                        ]
                    }
                ]
            }
        };
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    test('updates state correctly on set user ATs', async () => {
        const store = storeFactory();
        moxios.wait(() => {
            const request = moxios.requests.first();
            request.respondWith({
                status: 200,
                response: [
                    {
                        id: 1,
                        username: 'foobar',
                        configured_ats: []
                    }
                ]
            });
        });

        await store.dispatch(getAllUsers());

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: [
                    {
                        at_name_id: 1,
                        active: false
                    },
                    {
                        at_name_id: 2,
                        active: true
                    }
                ]
            });
        });

        await store.dispatch(
            handleSetUserAts(
                { username: 'foobar', id: 1 },
                expectedState.users.users[0].configured_ats
            )
        );
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });
});
