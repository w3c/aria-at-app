import axios from 'axios';
import { GET_USERS } from './types';

export const getAllUsersDispatch = payload => ({
    type: GET_USERS,
    payload
});

export function getAllUsers() {
    return async function(dispatch) {
        const response = await axios.get('/api/user');
        dispatch(getAllUsersDispatch(response.data));
    };
}
