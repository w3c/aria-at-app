import axios from 'axios';
import { LOG_IN } from './types';

export const logIn = userData => ({
    type: LOG_IN,
    payload: userData
});

export function handleLogin() {
    return async function(dispatch) {
        const response = await axios.get('/api/auth/me');
        dispatch(logIn(response.data));
    };
}
