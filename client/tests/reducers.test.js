import { LOG_IN } from '../actions/types';
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
            type: LOG_IN,
            payload: apiPayload
        });
        expect(newState).toEqual({ isLoggedIn: true, ...apiPayload });
    });
});
