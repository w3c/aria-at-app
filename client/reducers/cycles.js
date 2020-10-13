import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    TEST_SUITE_VERSIONS,
    TESTS_BY_RUN_ID,
    CONFLICTS_BY_TEST_RESULTS
} from '../actions/types';

const initialState = {
    conflictsByTestId: {},
    cyclesById: {},
    issuesByTestId: {},
    testSuiteVersions: [],
    testsByRunId: {}
};

export default (state = initialState, action) => {
    let cycleId = action.payload ? action.payload.cycleId : undefined;

    switch (action.type) {
        case TEST_SUITE_VERSIONS: {
            const testSuiteVersions = action.payload;
            return Object.assign({}, state, {
                testSuiteVersions
            });
        }
        case CYCLES: {
            const cycles = action.payload;
            let cyclesById = {};
            for (let cycle of cycles) {
                cyclesById[cycle.id] = cycle;
            }
            return Object.assign({}, state, {
                cyclesById
            });
        }
        case DELETE_CYCLE: {
            let remainingCycles = { ...state.cyclesById };
            delete remainingCycles[cycleId];
            return Object.assign({}, state, {
                cyclesById: remainingCycles
            });
        }
        case SAVE_CYCLE: {
            const cycle = action.payload;
            return Object.assign({}, state, {
                cyclesById: {
                    ...state.cyclesById,
                    [cycle.id]: cycle
                }
            });
        }
        case TESTS_BY_RUN_ID: {
            return Object.assign({}, state, {
                testsByRunId: {
                    ...state.testsByRunId,
                    ...action.payload.testsByRunId
                }
            });
        }
        case CONFLICTS_BY_TEST_RESULTS: {
            const { test_id, conflicts } = action.payload;
            const conflictsByTestId = test_id ? { [test_id]: conflicts } : {};
            return {
                ...state,
                conflictsByTestId: {
                    ...state.conflictsByTestId,
                    ...conflictsByTestId
                }
            };
        }
        default:
            return state;
    }
};
