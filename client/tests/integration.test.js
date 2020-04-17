import { storeFactory } from './util';
import { handleCheckLoggedIn, handleLogout } from '../actions/login';
import { handleGetValidAts } from '../actions/ats';
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
            ats: {
                names: []
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
            ats: {
                names: []
            },
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
                cycles: [],
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
