import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    SAVE_RESULT,
    TEST_SUITE_VERSIONS,
    RUNS_FOR_USER_AND_CYCLE,
    SAVE_USERS_TO_RUNS,
    DELETE_USERS_FROM_RUN
} from '../actions/types';

const initialState = {
    cyclesById: {},
    testSuiteVersions: [],
    runsForCycle: {}
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
        case SAVE_RESULT: {
            const result = action.payload;

            const tests =
                state.runsForCycle[result.cycle_id][result.run_id].tests;
            const testIndex = tests.findIndex(t => {
                return t.id === result.test_id;
            });
            const newTests = [...tests];
            newTests[testIndex] = {
                ...tests[testIndex],
                result
            };
            return Object.assign({}, state, {
                runsForCycle: {
                    ...state.runsForCycle,
                    [result.cycle_id]: {
                        ...state.runsForCycle[result.run_id],
                        [result.run_id]: {
                            tests: newTests
                        }
                    }
                }
            });
        }
        case RUNS_FOR_USER_AND_CYCLE: {
            return Object.assign({}, state, {
                runsForCycle: {
                    ...state.runsForCycle,
                    [cycleId]: action.payload.runsForCycle
                }
            });
        }
        case SAVE_USERS_TO_RUNS: {
            let savedUsersForRuns = action.payload.savedRuns;

            let currentCycle = state.cyclesById[cycleId];
            let newState = Object.assign({}, state, {
                cyclesById: {
                    ...state.cyclesById,
                    [cycleId]: {
                        ...currentCycle,
                        runsById: {
                            ...currentCycle.runsById
                        }
                    }
                }
            });

            for (let runId in savedUsersForRuns) {
                newState.cyclesById[cycleId].runsById[runId].testers =
                    savedUsersForRuns[runId];
            }
            return newState;
        }
        case DELETE_USERS_FROM_RUN: {
            let runId = action.payload.runId;
            let users = action.payload.usersForRun;

            let currentCycle = state.cyclesById[cycleId];
            return Object.assign({}, state, {
                cyclesById: {
                    ...state.cyclesById,
                    [cycleId]: {
                        ...currentCycle,
                        runsById: {
                            ...currentCycle.runsById,
                            [runId]: {
                                ...currentCycle.runsById[runId],
                                testers: users
                            }
                        }
                    }
                }
            });
        }
        default:
            return state;
    }
};
