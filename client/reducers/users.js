import { GET_USERS, SET_USER_ATS } from '../actions/types';

const initialState = {
    usersById: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_USERS: {
            const users = action.payload;
            const usersById = {};
            users.map(u => {
                usersById[u.id] = u;
            });
            return {
                ...state,
                usersById
            };
        }
        case SET_USER_ATS: {
            let { userId, ats } = action.payload;
            let updatedUser = { ...state.usersById[userId] };

            let updatedAts = [];
            for (let at of updatedUser.configured_ats) {
                let atFound = configuredUserAts.find(
                    configuredAt => configuredAt.at_name_id === at.at_name_id
                );
                if (atFound) {
                    atFound.active = at.active;
                    updatedAts.push(atFound);
                } else {
                    updatedAts.push(at);
                }
            }
            updatedUser.configured_ats = updatedAts;

            return {
                ...state,
                usersById: {
                    ...state.usersById,
                    [userId]: updatedUser
                }
            };
        }
        default:
            return state;
    }
};
