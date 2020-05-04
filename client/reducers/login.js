import { CHECK_LOGGED_IN, LOG_OUT, LOGGED_IN_FAIL } from '../actions/types';

const initialState = {
    isLoggedIn: false,
    loadedUserData: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CHECK_LOGGED_IN: {
            return {
                ...state,
                isLoggedIn: true,
                loadedUserData: true,
                ...action.payload
            };
        }
        case LOGGED_IN_FAIL: {
            return {
                ...state,
                isLoggedIn: false,
                loadedUserData: true
            };
        }
        case LOG_OUT: {
            let clone = Object.assign({}, state);
            delete clone['username'];
            delete clone['name'];
            return {
                ...clone,
                isLoggedIn: false
            };
        }
        default:
            return state;
    }
};
