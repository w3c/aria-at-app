import { CHECK_LOGGED_IN, LOG_OUT } from '../actions/types';
import loginReducer from '../reducers/login';

describe('login reducer tests', () => {
    test('returns default initial state when no action is passed', () => {
        const newState = loginReducer(undefined, {});
        expect(newState).toEqual({ isLoggedIn: false });
    });
    test('returns object upon receiving an action of type `LOG_IN`', () => {
        const apiPayload = {
            username: 'foo',
            name: 'Foo Bar'
        };
        const newState = loginReducer(undefined, {
            type: CHECK_LOGGED_IN,
            payload: apiPayload
        });
        expect(newState).toEqual({ isLoggedIn: true, ...apiPayload });
    });
    test('returns object without username and name and isLoggedIn false with `LOG_OUT` type', () => {
        const apiPayload = {
            username: 'foo',
            name: 'Foo Bar'
        };
        const loggedInState = loginReducer(undefined, {
            type: CHECK_LOGGED_IN,
            payload: apiPayload
        });

        const newState = loginReducer(loggedInState, {
            type: LOG_OUT
        });

        expect(newState).toEqual({ isLoggedIn: false });
    });
});
