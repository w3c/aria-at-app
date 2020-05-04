import axios from 'axios';
import { CHECK_LOGGED_IN, LOG_OUT, LOGGED_IN_FAIL } from './types';

export const checkLoggedIn = payload => ({
    type: CHECK_LOGGED_IN,
    payload
});

export const logout = () => ({
    type: LOG_OUT
});

export const loggedInFail = () => ({
    type: LOGGED_IN_FAIL
});

export function handleCheckLoggedIn() {
    return async function(dispatch) {
        await axios
            .get('/api/auth/me')
            .then(function(response) {
                dispatch(checkLoggedIn(response.data));
            })
            .catch(function() {
                dispatch(loggedInFail());
            });
    };
}

export function handleLogout() {
    return async function(dispatch) {
        const response = await axios.post('/api/auth/logout');
        if (response.status === 200) {
            dispatch(logout());
        }
    };
}
