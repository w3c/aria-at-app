import { CLONE_REPO } from '../actions/types';

const initialState = {
    isBuffering: false
}

export default (state = initialState, action) => {
    switch (action.type) {
        case CLONE_REPO: {
            return {
                ...state,
                isBuffering: true
            };
        }
        default:
            return state;
    }
};