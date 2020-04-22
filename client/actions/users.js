import axios from 'axios';
import { GET_USERS, SET_USER_ATS, SET_CURRENT_USER } from './types';

export const getAllUsersDispatch = payload => ({
    type: GET_USERS,
    payload
});

export const setCurrentUser = payload => ({
    type: SET_CURRENT_USER,
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
            dispatch(setUserAts(ats));
        }
    };
}

export function handleGetUserAts() {
    return async function(dispatch) {
        const response = await axios.get('/api/user/ats');
        dispatch(
            setUserAts(
                response.data
                    .filter(atObj => atObj.active)
                    .map(atObj => atObj.at_name_id)
            )
        );
    };
}
