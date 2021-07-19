import { ATS } from '../actions/types';

const initialState = [];

export default (state = initialState, action) => {
    switch (action.type) {
        case ATS: {
            return action.payload;
        }
        default:
            return state;
    }
};
