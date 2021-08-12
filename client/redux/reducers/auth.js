import { SIGN_IN, SIGN_OUT, SIGN_IN_FAIL } from '../actions/types';

const initialState = {
    // calculated booleans
    isAdmin: false,
    isTester: false,
    isSignedIn: false,
    isSignInFailed: false,
    isSignOutCalled: false,

    // user object values
    id: null,
    roles: [],
    username: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SIGN_IN: {
            return {
                ...state,
                ...action.payload,
                isSignInFailed: false,
                isSignOutCalled: false,
                isSignedIn: !!action.payload.username,
                isAdmin: action.payload.roles.includes('ADMIN'),
                isTester: action.payload.roles.includes('TESTER')
            };
        }
        case SIGN_OUT: {
            return {
                ...state,
                ...initialState,
                isSignedIn: false,
                isSignOutCalled: true
            };
        }
        case SIGN_IN_FAIL: {
            return {
                ...state,
                ...initialState,
                isSignedIn: false,
                isSignInFailed: true,
                isSignOutCalled: true
            };
        }
        default:
            return state;
    }
};
