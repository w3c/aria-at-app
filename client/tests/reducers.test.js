import { CHECK_LOGGED_IN, LOG_OUT, ATS, SET_USER_ATS } from '../actions/types';
import loginReducer from '../reducers/login';
import atsReducer from '../reducers/ats';
import usersReducer from '../reducers/users';

describe('login reducer tests', () => {
    test('returns default initial state when no action is passed', () => {
        const newState = loginReducer(undefined, {});
        expect(newState).toEqual({ isLoggedIn: false, loadedUserData: false });
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
        expect(newState).toEqual({
            isLoggedIn: true,
            loadedUserData: true,
            ...apiPayload
        });
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

        expect(newState).toEqual({ isLoggedIn: false, loadedUserData: true });
    });
});

describe('ats reducer tests', () => {
    test('returns default initial state when no action is passed', () => {
        const newState = atsReducer(undefined, {});
        expect(newState).toEqual([]);
    });
    test('returns object upon receiving an action of type `ATS`', () => {
        const apiPayload = { names: ['Foo', 'Bar'] };
        const newState = atsReducer(undefined, {
            type: ATS,
            payload: apiPayload
        });
        expect(newState).toEqual({ names: ['Foo', 'Bar'] });
    });
});

describe('users reducer tests', () => {
    test('returns default initial state when no action is passed', () => {
        const newState = usersReducer(undefined, {});
        expect(newState).toEqual({ usersById: {} });
    });
    test('returns object upon receiving an action of type `SET_USER_ATS`', () => {
        const apiPayload = {
            userId: 1,
            ats: [
                { at_name_id: 1, active: true },
                { at_name_id: 2, active: true }
            ]
        };
        const newState = usersReducer(
            {
                usersById: {
                    1: {
                        id: 1,
                        username: 'foobar',
                        configured_ats: [{ at_name_id: 1, active: false }]
                    }
                }
            },
            {
                type: SET_USER_ATS,
                payload: apiPayload
            }
        );
        expect(newState).toEqual({
            usersById: {
                1: {
                    id: 1,
                    username: 'foobar',
                    configured_ats: [
                        { at_name_id: 1, active: true },
                        { at_name_id: 2, active: true }
                    ]
                }
            }
        });
    });
});
