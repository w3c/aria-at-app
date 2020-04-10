import { CHECK_LOGGED_IN } from '../actions/types';

const initialState = {
    isLoggedIn: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CHECK_LOGGED_IN: {
            const { username, name } = action.payload;
            return {
                isLoggedIn: true,
                username,
                name
            };
        }
        default:
            return state;
    }
};
