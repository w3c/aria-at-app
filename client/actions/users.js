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
        dispatch(getAllUsersDispatch(response.data));
    };
}

export function handleSetUserAts(user, ats) {
    return async function(dispatch) {
        const response = await axios.post('/api/user/ats', { user, ats });
        if (response.status === 200) {
            dispatch(setUserAts({ user, ats: response.data }));
        }
    };
}
