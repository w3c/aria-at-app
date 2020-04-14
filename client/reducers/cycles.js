import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    TEST_SUITE_VERSIONS
} from '../actions/types';

// TODO: Change this into a object key'd by cycle id?
const initialState = {
    cycles: [],
    testSuiteVersions: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TEST_SUITE_VERSIONS: {
            const testSuiteVersions = action.payload;
            return Object.assign({}, state, {
                testSuiteVersions
            });
        }
        case CYCLES: {
            const cycles = action.payload;
            return Object.assign({}, state, {
                cycles
            });
        }
        case DELETE_CYCLE: {
            const { cycleId } = action.payload;
            let remainingCycles = state.cycles.filter(
                cycle => cycle.id !== cycleId
            );
            return Object.assign({}, state, {
                cycles: remainingCycles
            });
        }
        case SAVE_CYCLE: {
            const cycle = action.payload;
            let newCycleList = [...state.cycles];
            newCycleList.unshift(cycle);
            return Object.assign({}, state, {
                cycles: newCycleList
            });
        }
        default:
            return state;
    }
};
