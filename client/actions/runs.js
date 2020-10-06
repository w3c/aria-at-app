import axios from 'axios';
import {
    ACTIVE_RUNS,
    DELETE_USERS_FROM_RUN,
    SAVE_RUN_CONFIGURATION,
    SAVE_RUN_STATUS,
    SAVE_USERS_TO_RUNS
} from './types';

export const activeRunsDispatch = payload => ({
    type: ACTIVE_RUNS,
    payload
});

export const deleteUsersFromRunDispatch = payload => ({
    type: DELETE_USERS_FROM_RUN,
    payload
});

export const saveRunConfigurationDispatch = payload => ({
    type: SAVE_RUN_CONFIGURATION,
    payload
});

export const saveRunStatusDispatch = payload => ({
    type: SAVE_RUN_STATUS,
    payload
});

export const saveUsersToRunsDispatch = payload => ({
    type: SAVE_USERS_TO_RUNS,
    payload
});

export function getActiveRuns() {
    return async function(dispatch) {
        const response = await axios.get('/api/run/active');
        return dispatch(activeRunsDispatch(response.data));
    };
}

export function deleteUsersFromRun(users, runId) {
    return async function(dispatch) {
        const response = await axios.delete('/api/user/run', {
            data: { users, runId }
        });
        return dispatch(
            deleteUsersFromRunDispatch({
                ...response.data,
                runId
            })
        );
    };
}

export function saveRunConfiguration(config) {
    return async function(dispatch) {
        const response = await axios.post('/api/run', {
            data: config
        });
        return dispatch(
            saveRunConfigurationDispatch({
                runs: response.data,
                config
            })
        );
    };
}

export function saveRunStatus(status, runId) {
    return async function(dispatch) {
        const response = await axios.post('/api/cycle/run/status', {
            data: { run_status: status, id: runId }
        });
        return dispatch(
            saveRunStatusDispatch({
                runId,
                run_status: status,
                run_status_id: response.data.run_status_id
            })
        );
    };
}

export function saveUsersToRuns(users, runs) {
    return async function(dispatch) {
        const response = await axios.post('/api/user/run', {
            users,
            runs
        });
        return dispatch(saveUsersToRunsDispatch({ ...response.data }));
    };
}
