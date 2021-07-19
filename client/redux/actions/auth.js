import { SIGN_IN, SIGN_OUT, SIGN_IN_FAIL } from './types';

export const signIn = payload => ({
    type: SIGN_IN,
    payload
});

export const signOut = () => ({
    type: SIGN_OUT
});

export const signInFail = () => ({
    type: SIGN_IN_FAIL
});
