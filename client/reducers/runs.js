import {
    ACTIVE_RUNS,
    DELETE_USERS_FROM_RUN,
    SAVE_RUN_CONFIGURATION,
    SAVE_RUN_STATUS,
    SAVE_USERS_TO_RUNS
} from '../actions/types';

const initialState = {
    activeRunConfiguration: undefined,
    activeRunsById: undefined,
    publishedRunsById: undefined
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
        case SAVE_RUN_CONFIGURATION: {
            const { runs, config } = action.payload;
            return {
                ...state,
                activeRunsById: runs,
                activeRunConfiguration: config
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
                const updatedActiveRunsById = { ...state.activeRunsById };
                delete updatedActiveRunsById[runId];
                let updatedPublishedRunsById = undefined;

                // If we switched the run from active to published,
                // Then we might not have fetched the published runs yet
                if (state.publishedRuns) {
                    updatedPublishedRunsById = {
                        ...this.state.publishedRunsById,
                        [runId]: updatedRun
                    };
                }
                return {
                    ...state,
                    activeRunsById: updatedActiveRunsById,
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
                        ...this.state.activeRunsById,
                        [runId]: updatedRun
                    };
                }
                return {
                    ...state,
                    activeRunsById: updatedActiveRunsById,
                    publishedRunsById: updatedPublishedRunsById
                };
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
        default:
            return state;
    }
};
