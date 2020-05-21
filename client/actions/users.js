import axios from 'axios';
import { GET_USERS, SET_USER_ATS } from './types';

export const getAllUsersDispatch = payload => ({
    type: GET_USERS,
    payload
});

export const setUserAts = payload => ({
    type: SET_USER_ATS,
    payload
});

export function getAllUsers() {
    return async function(dispatch) {
        const response = await axios.get('/api/user');
        return dispatch(getAllUsersDispatch(response.data));
    };
}

export function handleSetUserAts(userId, ats) {
    return async function(dispatch) {
        const response = await axios.post('/api/user/ats', { userId, ats });
        if (response.status === 200) {
            return dispatch(setUserAts({ userId, ats: response.data }));
        }
    };
}
