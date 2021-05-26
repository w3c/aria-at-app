import {
    ACTIVE_RUNS,
    CONFLICTS_BY_TEST_RESULTS,
    PUBLISHED_RUNS,
    DELETE_TEST_RESULTS,
    DELETE_USERS_FROM_RUN,
    RUN_CONFIGURATION,
    SAVE_RESULT,
    SAVE_RUN_CONFIGURATION,
    SAVE_RUN_STATUS,
    SAVE_USERS_TO_RUNS,
    TEST_VERSIONS
} from '../actions/types';

const initialState = {
    conflictsByTestId: {},
    activeRunConfiguration: undefined,
    activeRunsById: undefined,
    publishedRunsById: undefined,
    testVersions: undefined
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTIVE_RUNS: {
            const runs = action.payload;
            return {
                ...state,
                activeRunsById: runs
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
        case PUBLISHED_RUNS: {
            const runs = action.payload;
            return {
                ...state,
                publishedRunsById: runs
            };
        }
        case RUN_CONFIGURATION: {
            const config = action.payload;
            return {
                ...state,
                activeRunConfiguration: config
            };
        }
        case SAVE_RESULT: {
            const result = action.payload;
            const tests = state.activeRunsById[result.run_id].tests;
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

            return {
                ...state,
                activeRunsById: {
                    ...state.activeRunsById,
                    [result.run_id]: {
                        ...state.activeRunsById[result.run_id],
                        tests: newTests
                    }
                }
            };
        }
        case SAVE_RUN_CONFIGURATION: {
            const { runs, config } = action.payload;
            return {
                ...state,
                activeRunsById: runs,
                activeRunConfiguration: {
                    active_test_version: state.testVersions.find(
                        v => v.id === config.test_version_id
                    ),
                    active_at_browser_pairs: config.at_browser_pairs,
                    active_apg_examples: config.apg_example_ids,
                    browsers: state.activeRunConfiguration.browsers
                }
            };
        }
        case DELETE_TEST_RESULTS: {
            const { userId, runId } = action.payload;
            const newTests = state.activeRunsById[runId].tests.map(t => {
                let newTest = { ...t };
                newTest.results = { ...t.results };
                if (newTest.results[userId]) {
                    delete newTest.results[userId];
                }
                return newTest;
            });

            return {
                ...state,
                activeRunsById: {
                    ...state.activeRunsById,
                    [runId]: {
                        ...state.activeRunsById[runId],
                        tests: newTests
                    }
                }
            };
        }
        case DELETE_USERS_FROM_RUN: {
            const { usersForRun, runId } = action.payload;
            const runToUpdate = state.activeRunsById[runId];
            return {
                ...state,
                activeRunsById: {
                    ...state.activeRunsById,
                    [runId]: {
                        ...runToUpdate,
                        testers: usersForRun
                    }
                }
            };
        }
        case SAVE_RUN_STATUS: {
            const { run_status, run_status_id, runId } = action.payload;

            const oldStatus = state.activeRunsById[runId].run_status;
            const updatedRun = {
                ...state.activeRunsById[runId],
                run_status,
                run_status_id
            };

            if (oldStatus !== 'final' && run_status !== 'final') {
                return {
                    ...state,
                    activeRunsById: {
                        ...state.activeRunsById,
                        [runId]: updatedRun
                    }
                };
            } else if (oldStatus !== 'final' && run_status === 'final') {
                let updatedPublishedRunsById = undefined;

                // If we switched the run from active to published,
                // Then we might not have fetched the published runs yet
                if (state.publishedRuns) {
                    updatedPublishedRunsById = {
                        ...state.publishedRunsById,
                        [runId]: updatedRun
                    };
                }

                return {
                    ...state,
                    activeRunsById: {
                        ...state.activeRunsById,
                        [runId]: updatedRun
                    },
                    publishedRunsById: updatedPublishedRunsById
                };
            } else if (oldStatus === 'final' && run_status !== 'final') {
                const updatedPublishedRunsById = { ...state.publishedRunsById };
                delete updatedPublishedRunsById[runId];
                let updatedActiveRunsById = undefined;

                // If we switched the run from published to active,
                // Then we might not have fetched the active runs yet
                if (state.activeRunsById) {
                    updatedActiveRunsById = {
                        ...state.activeRunsById,
                        [runId]: updatedRun
                    };
                }
                return {
                    ...state,
                    activeRunsById: updatedActiveRunsById,
                    publishedRunsById: updatedPublishedRunsById
                };
            } else {
                return { ...state };
            }
        }
        // falls through
        case SAVE_USERS_TO_RUNS: {
            const savedUsersForRuns = action.payload.savedRuns;
            const updatedActiveRunsById = { ...state.activeRunsById };
            for (let runId in savedUsersForRuns) {
                updatedActiveRunsById[runId].testers = savedUsersForRuns[runId];
            }
            return {
                ...state,
                activeRunsById: updatedActiveRunsById
            };
        }
        case TEST_VERSIONS: {
            const runs = action.payload;
            return {
                ...state,
                testVersions: runs
            };
        }
        default:
            return state;
    }
};
