import { GET_USERS, SET_USER_ATS } from '../actions/types';

const initialState = {
    usersById: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_USERS: {
            const users = action.payload;
            const usersById = users.reduce((accum, user) => {
                accum[user.id] = user;
                return accum;
            }, {});
            return {
                ...state,
                usersById
            };
        }
        case SET_USER_ATS: {
            let { userId, ats } = action.payload;

            let updateUser = { ...state.usersById[userId] };
            updateUser.configured_ats = ats;

            return {
                ...state,
                usersById: {
                    ...state.usersById,
                    [userId]: updateUser
                }
            };
        }
        default:
            return state;
    }
};
