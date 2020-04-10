import { CYCLES, DELETE_CYCLE } from '../actions/types';

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
        case DELETE_CYCLE: {
            const { cycleId } = action.payload;
            let remainingCycles = state.cycles.filter((cycle) => cycle.id !== cycleId)
            return {
                cycles: remainingCycles
            };
        }
        default:
            return state;
    }
};
