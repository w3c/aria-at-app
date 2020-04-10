import axios from 'axios';
import { CHECK_LOGGED_IN } from './types';

export const checkLoggedIn = payload => ({
    type: CHECK_LOGGED_IN,
    payload
});

export function handleCheckLoggedIn() {
    return async function(dispatch) {
        const response = await axios.get('/api/auth/me');
        dispatch(checkLoggedIn(response.data));
    };
}
