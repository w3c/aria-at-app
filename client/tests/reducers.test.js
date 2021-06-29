import authReducer from '../redux/reducers/auth';
import { SIGN_IN, SIGN_OUT } from '../redux/actions/types';

describe('auth reducer tests', () => {
    test('returns default initial state when no action is passed', () => {
        const state = authReducer(undefined, {});
        expect(state).toMatchObject({
            id: null,
            roles: [],
            username: null,
            isAdmin: false,
            isTester: false,
            isSignedIn: false,
            isSignInFailed: false,
            isSignOutCalled: false
        });
    });

    test('returns object upon receiving an action of type `SIGN_IN` as ADMIN and TESTER role', () => {
        const payload = {
            id: 1,
            roles: ['ADMIN', 'TESTER'],
            username: 'foo'
        };

        const state = authReducer(undefined, {
            payload,
            type: SIGN_IN
        });

        expect(state).toEqual(
            expect.objectContaining({
                isSignInFailed: false,
                isSignOutCalled: false,
                ...payload
            })
        );
        expect(state.id).toEqual(payload.id);
        expect(state.username).toEqual(payload.username);
        expect(state.roles).toEqual(expect.arrayContaining(payload.roles));
        expect(state.isAdmin).toEqual(true);
        expect(state.isTester).toEqual(true);
    });

    test('returns object upon receiving an action of type `SIGN_IN` as ADMIN role', () => {
        const payload = {
            id: 1,
            roles: ['ADMIN'],
            username: 'foo'
        };

        const state = authReducer(undefined, {
            payload,
            type: SIGN_IN
        });

        expect(state).toEqual(
            expect.objectContaining({
                isSignInFailed: false,
                isSignOutCalled: false,
                ...payload
            })
        );
        expect(state.id).toEqual(payload.id);
        expect(state.username).toEqual(payload.username);
        expect(state.roles).toEqual(expect.arrayContaining(payload.roles));
        expect(state.isAdmin).toEqual(true);
        expect(state.isTester).toEqual(false);
    });

    test('returns object upon receiving an action of type `SIGN_IN` as TESTER role', () => {
        const payload = {
            id: 1,
            roles: ['TESTER'],
            username: 'foo'
        };

        const state = authReducer(undefined, {
            payload,
            type: SIGN_IN
        });

        expect(state).toEqual(
            expect.objectContaining({
                isSignInFailed: false,
                isSignOutCalled: false,
                ...payload
            })
        );
        expect(state.id).toEqual(payload.id);
        expect(state.username).toEqual(payload.username);
        expect(state.roles).toEqual(expect.arrayContaining(payload.roles));
        expect(state.isAdmin).toEqual(false);
        expect(state.isTester).toEqual(true);
    });

    test('returns object without username and isSignedIn set false with `SIGN_OUT` type', () => {
        const payload = {
            id: 1,
            roles: ['ADMIN', 'TESTER'],
            username: 'foo'
        };

        const loggedInState = authReducer(undefined, {
            payload,
            type: SIGN_IN
        });

        const signedOutState = authReducer(loggedInState, {
            type: SIGN_OUT
        });

        // checks if logged in and logged out successfully
        expect(loggedInState).toEqual(
            expect.objectContaining({
                isSignInFailed: false,
                isSignOutCalled: false,
                ...payload
            })
        );
        expect(signedOutState).toEqual(
            expect.objectContaining({
                isSignedIn: false,
                isSignOutCalled: true
            })
        );

        // checks to make sure original log in information payload isn't present after sign out
        expect(signedOutState).not.toEqual(
            expect.objectContaining({
                ...payload
            })
        );
    });
});
