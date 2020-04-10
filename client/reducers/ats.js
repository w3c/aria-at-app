import { ATS } from '../actions/types';

const initialState = {
    names: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ATS: {
            const { names } = action.payload;
            return {
                names
            };
        }
        default:
            return state;
    }
};
