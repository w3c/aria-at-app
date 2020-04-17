import { storeFactory } from './util';
import { handleCheckLoggedIn, handleLogout } from '../actions/login';
import { handleGetValidAts } from '../actions/ats';
import { handleSetUserAts, handleGetUserAts } from '../actions/users';
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
                email: 'foo@bar.com'
            },
            cycles: {
                cycles: [],
                testSuiteVersions: []
            },
            ats: [],
            users: {
                users: [],
                currentUser: {
                    username: 'foobar',
                    name: 'Foo Bar',
                    email: 'foo@bar.com',
                    ats: []
                }
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
                cycles: [],
                testSuiteVersions: []
            },
            ats: [],
            users: {
                users: [],
                currentUser: { ats: [] }
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
                cycles: [],
                testSuiteVersions: []
            },
            ats: {
                names: ['JAWS', 'NVDA', 'VoiceOver']
            },
            users: {
                users: [],
                currentUser: { ats: [] }
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
                cycles: [],
                testSuiteVersions: []
            },
            ats: [],
            users: {
                users: [],
                currentUser: {
                    ats: [1, 2]
                }
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
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200
            });
        });

        await store.dispatch(
            handleSetUserAts(
                { username: 'foobar' },
                expectedState.users.currentUser.ats
            )
        );
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });

    test('updates state correctly on get user ATs', async () => {
        const store = storeFactory();
        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: [
                    {
                        active: true,
                        at_name_id: 1
                    },
                    {
                        active: true,
                        at_name_id: 2
                    },
                    {
                        active: false,
                        at_name_id: 3
                    }
                ]
            });
        });
        await store.dispatch(handleGetUserAts());
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });
});
