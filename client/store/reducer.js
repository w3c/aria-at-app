import { authState, SIGN_IN, SIGN_OUT, SIGN_IN_FAIL } from './auth';

const reducer = (state, action) => {
    switch (action.type) {
        case SIGN_IN: {
            return {
                ...state,
                auth: {
                    ...action.payload,
                    isSignInFailed: false,
                    isSignOutCalled: false,
                    isSignedIn: !!action.payload.username,
                    isAdmin: action.payload.roles.includes('ADMIN'),
                    isTester: action.payload.roles.includes('TESTER')
                }
            };
        }
        case SIGN_OUT: {
            return {
                ...state,
                auth: {
                    ...authState,
                    isSignedIn: false,
                    isSignOutCalled: true
                }
            };
        }
        case SIGN_IN_FAIL: {
            return {
                ...state,
                auth: {
                    ...authState,
                    isSignedIn: false,
                    isSignInFailed: true,
                    isSignOutCalled: true
                }
            };
        }
        default:
            return state;
    }
};

export default reducer;
