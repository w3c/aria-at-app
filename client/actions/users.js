import axios from 'axios';
import { USER_CONFIGS } from './types';

export const getAllUsersDispatch = payload => ({
    type: USER_CONFIGS,
    payload
});

export function getAllUsers() {
    return async function(dispatch) {
        const response = await axios.get('/api/user/config');
        dispatch(getAllUsersDispatch(response.data));
    };
}
