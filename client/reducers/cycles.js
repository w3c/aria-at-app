import { CYCLES } from '../actions/types';

// TODO: Change this into a object key'd by cycle id?
const initialState = {
    cycles: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CYCLES: {
            const cycles = action.payload;
            return {
                cycles
            };
        }
        default:
            return state;
    }
};
