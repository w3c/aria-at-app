import { storeFactory } from './util';
import { handleLogin } from '../actions/login';
import moxios from 'moxios';

describe('handleLogIn action dispatcher', () => {
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
                name: 'Foo Bar'
            },
            cycles: {
                cycles: []
            }
        };

        moxios.wait(() => {
            const request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: {
                    username: expectedState.login.username,
                    name: expectedState.login.name
                }
            });
        });

        await store.dispatch(handleLogin());
        const newState = store.getState();
        expect(newState).toEqual(expectedState);
    });
});
