import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    SAVE_RESULT,
    TEST_SUITE_VERSIONS,
    TESTS_BY_RUN_ID,
    SAVE_USERS_TO_RUNS,
    DELETE_USERS_FROM_RUN,
    CREATE_ISSUE_SUCCESS,
    ISSUES_BY_TEST_ID,
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
        case SAVE_RESULT: {
            const result = action.payload;

            const tests = state.testsByRunId[result.run_id];
            const testIndex = tests.findIndex(t => t.id === result.test_id);
            const newTests = [...tests];
            const newTest = {
                ...tests[testIndex],
                results: {
                    ...tests[testIndex].results,
                    [result.user_id]: result
                }
            };
            newTests[testIndex] = newTest;

            return Object.assign({}, state, {
                testsByRunId: {
                    ...state.testsByRunId,
                    [result.run_id]: newTests
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
        case ISSUES_BY_TEST_ID: {
            const { test_id, issues } = action.payload;
            const issuesByTestId = test_id ? { [test_id]: issues } : {};
            return {
                ...state,
                issuesByTestId: {
                    ...state.issuesByTestId,
                    ...issuesByTestId
                }
            };
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
        case CREATE_ISSUE_SUCCESS: {
            const { issuesByTestId } = state;

            const { test_id, issues } = action.payload;

            if (!issuesByTestId[test_id]) {
                issuesByTestId[test_id] = [];
            }

            issuesByTestId[test_id].push(...issues);

            return {
                ...state,
                issuesByTestId
            };
        }
        default:
            return state;
    }
};
