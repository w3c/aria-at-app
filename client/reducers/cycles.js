import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    TEST_SUITE_VERSIONS,
    RUNS_FOR_USER_AND_CYCLE
} from '../actions/types';

// TODO: Change this into a object key'd by cycle id?
const initialState = {
    cycles: [],
    testSuiteVersions: [],
    runsForCycle: {}
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
            newCycleList.push(cycle);
            return Object.assign({}, state, {
                cycles: newCycleList
            });
        }
        case RUNS_FOR_USER_AND_CYCLE: {
            return Object.assign({}, state, {
                runsForCycle: {
                    ...state.runsForCycle,
                    [parseInt(action.payload.cycleId)]: action.payload
                        .runsForCycle
                }
            });
        }
        default:
            return state;
    }
};
