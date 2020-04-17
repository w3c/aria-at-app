import { GET_USERS, SET_CURRENT_USER, SET_USER_ATS } from '../actions/types';

// TODO: Change this into a object key'd by user id?
const initialState = {
    users: [],
    currentUser: { ats: [] }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_USERS: {
            const users = action.payload;
            return Object.assign({}, state, {
                users
            });
        }
        case SET_CURRENT_USER: {
            const { username, name, email } = action.payload;
            return {
                ...state,
                currentUser: {
                    ...state.currentUser,
                    username,
                    name,
                    email
                }
            };
        }
        case SET_USER_ATS: {
            let currentUser = Object.assign({}, state.currentUser, {
                ats: action.payload
            });
            return {
                ...state,
                currentUser
            };
        }
        default:
            return state;
    }
};
