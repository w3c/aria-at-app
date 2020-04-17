import { GET_USERS } from '../actions/types';

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
        default:
            return state;
    }
};
