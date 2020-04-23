import { GET_USERS, SET_USER_ATS } from '../actions/types';

// TODO: Change this into a object key'd by user id?
const initialState = {
    users: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_USERS: {
            const users = action.payload;
            return Object.assign({}, state, {
                users
            });
        }
        case SET_USER_ATS: {
            let { user, ats } = action.payload;
            let users = state.users.slice();
            let findUser = state.users.find(
                stateUser => stateUser.username === user.username
            );
            if (findUser) {
                let currentUser = findUser;
                let configuredUserAts = currentUser.configured_ats;
                let updatedAts = [];

                for (let at of ats) {
                    let atFound = configuredUserAts.find(
                        configuredAt =>
                            configuredAt.at_name_id === at.at_name_id
                    );
                    if (atFound) {
                        atFound.active = at.active;
                        updatedAts.push(atFound);
                    } else {
                        updatedAts.push(at);
                    }
                }

                let currentUserIdx = users.findIndex(
                    user => user.id === currentUser.id
                );
                users[currentUserIdx].configured_ats = updatedAts;
            }
            return {
                ...state,
                users: [...users]
            };
        }
        default:
            return state;
    }
};
