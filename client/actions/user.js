import axios from 'axios';
import { CHECK_SIGNED_IN, SIGN_OUT, SIGNED_IN_FAIL } from './types';

export const checkSignedIn = payload => ({
    type: CHECK_SIGNED_IN,
    payload
});

export const signout = () => ({
    type: SIGN_OUT
});

export const signedInFail = () => ({
    type: SIGNED_IN_FAIL
});

export function handleCheckSignedIn() {
    return async function(dispatch) {
        await axios
            .get('/api/auth/me')
            .then(function(response) {
                dispatch(checkSignedIn(response.data));
            })
            .catch(function() {
                dispatch(signedInFail());
            });
    };
}

export function handleSignout() {
    return async function(dispatch) {
        const response = await axios.post('/api/auth/signout');
        if (response.status === 200) {
            dispatch(signout());
        }
    };
}
