import { CHECK_SIGNED_IN, SIGN_OUT, SIGNED_IN_FAIL } from '../actions/types';

const initialState = {
    isSignedIn: false,
    loadedUserData: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CHECK_SIGNED_IN: {
            return {
                ...state,
                isSignedIn: true,
                loadedUserData: true,
                ...action.payload
            };
        }
        case SIGNED_IN_FAIL: {
            return {
                ...state,
                isSignedIn: false,
                loadedUserData: true
            };
        }
        case SIGN_OUT: {
            let clone = Object.assign({}, state);
            delete clone.username;
            delete clone.name;
            return {
                ...clone,
                isSignedIn: false
            };
        }
        default:
            return state;
    }
};
