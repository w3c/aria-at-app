import axios from 'axios';
import { CHECK_LOGGED_IN, LOG_OUT } from './types';
import { setCurrentUser } from './users';

export const checkLoggedIn = payload => ({
    type: CHECK_LOGGED_IN,
    payload
});

export const logout = () => ({
    type: LOG_OUT
});

export function handleCheckLoggedIn() {
    return async function(dispatch) {
        const response = await axios.get('/api/auth/me');
        dispatch(checkLoggedIn(response.data));
        dispatch(setCurrentUser(response.data));
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
