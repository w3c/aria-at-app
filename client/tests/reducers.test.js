import { CHECK_SIGNED_IN, SIGN_OUT, ATS, SET_USER_ATS } from '../actions/types';
import atsReducer from '../reducers/ats';
import userReducer from '../reducers/user';
import usersReducer from '../reducers/users';

describe('user reducer tests', () => {
    test('returns default initial state when no action is passed', () => {
        const newState = userReducer(undefined, {});
        expect(newState).toEqual({ isSignedIn: false, loadedUserData: false });
    });
    test('returns object upon receiving an action of type `LOG_IN`', () => {
        const apiPayload = {
            username: 'foo',
            name: 'Foo Bar'
        };
        const newState = userReducer(undefined, {
            type: CHECK_SIGNED_IN,
            payload: apiPayload
        });
        expect(newState).toEqual({
            isSignedIn: true,
            loadedUserData: true,
            ...apiPayload
        });
    });
    test('returns object without username and name and isSignedIn false with `SIGN_OUT` type', () => {
        const apiPayload = {
            username: 'foo',
            name: 'Foo Bar'
        };
        const loggedInState = userReducer(undefined, {
            type: CHECK_SIGNED_IN,
            payload: apiPayload
        });

        const newState = userReducer(loggedInState, {
            type: SIGN_OUT
        });

        expect(newState).toEqual({ isSignedIn: false, loadedUserData: true });
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
