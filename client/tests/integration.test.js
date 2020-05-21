import { storeFactory } from './util';
import { handleCheckSignedIn, handleSignout } from '../actions/user';
import { handleGetValidAts } from '../actions/ats';
import { handleSetUserAts, getAllUsers } from '../actions/users';
import moxios from 'moxios';

describe('sign in actions dispatchers', () => {
    beforeEach(() => {
        moxios.install();
    });

    afterEach(() => {
        moxios.uninstall();
    });

    test('updates state correctly on sign in', async () => {
        const store = storeFactory();
        const expectedState = {
            user: {
                isSignedIn: true,
                loadedUserData: true,
                username: 'foobar',
                name: 'Foo Bar',
                email: 'foo@bar.com',
                id: undefined,
                roles: undefined
            },
            cycles: {
                cyclesById: {},
                issuesByTestId: {},
                testsByRunId: {},
                testSuiteVersions: []
            },
            ats: [],
            users: {
                usersById: {}
            }
        };

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: {
                    username: expectedState.user.username,
                    name: expectedState.user.name,
                    email: expectedState.user.email
                }
            });
        });

        await store.dispatch(handleCheckSignedIn());
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });

    test('updates state correctly on logout', async () => {
        const store = storeFactory();
        const expectedState = {
            user: {
                isSignedIn: false,
                loadedUserData: false
            },
            cycles: {
                cyclesById: {},
                issuesByTestId: {},
                testsByRunId: {},
                testSuiteVersions: []
            },
            ats: [],
            users: {
                usersById: {}
            }
        };

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200
            });
        });

        await store.dispatch(handleSignout());
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
            user: {
                isSignedIn: false,
                loadedUserData: false
            },
            cycles: {
                cyclesById: {},
                issuesByTestId: {},
                testsByRunId: {},
                testSuiteVersions: []
            },
            ats: {
                names: ['JAWS', 'NVDA', 'VoiceOver']
            },
            users: {
                usersById: {}
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
            user: {
                isSignedIn: false,
                loadedUserData: false
            },
            cycles: {
                cyclesById: {},
                issuesByTestId: {},
                testsByRunId: {},
                testSuiteVersions: []
            },
            ats: [],
            users: {
                usersById: {
                    1: {
                        id: 1,
                        username: 'foobar',
                        configured_ats: [
                            {
                                at_name_id: 1
                            },
                            {
                                at_name_id: 2
                            }
                        ]
                    }
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
                        at_name_id: 1
                    },
                    {
                        at_name_id: 2
                    }
                ]
            });
        });
        await store.dispatch(
            handleSetUserAts(1, expectedState.users.usersById[1].configured_ats)
        );
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });
});
