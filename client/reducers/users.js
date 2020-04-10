import { USER_CONFIGS } from '../actions/types';

// TODO: Change this into a object key'd by user id?
const initialState = {
    users: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case USER_CONFIGS: {
            const userConfigs = action.payload;
            return Object.assign({}, state, {
                users: userConfigs
            });
        }
        default:
            return state;
    }
};
