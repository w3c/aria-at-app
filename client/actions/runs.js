import axios from 'axios';
import {
    ACTIVE_RUNS,
    DELETE_USERS_FROM_RUN,
    RUN_CONFIGURATION,
    SAVE_RESULT,
    SAVE_RUN_CONFIGURATION,
    SAVE_RUN_STATUS,
    SAVE_USERS_TO_RUNS,
    TEST_VERSIONS
} from './types';

export const activeRunsDispatch = payload => ({
    type: ACTIVE_RUNS,
    payload
});

export const deleteUsersFromRunDispatch = payload => ({
    type: DELETE_USERS_FROM_RUN,
    payload
});

export const runConfigurationDispatch = payload => ({
    type: RUN_CONFIGURATION,
    payload
});

export const saveResultDispatch = payload => ({
    type: SAVE_RESULT,
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

export const testVersionsDispatch = payload => ({
    type: TEST_VERSIONS,
    payload
});

export function getActiveRuns() {
    return async function(dispatch) {
        const response = await axios.get('/api/run/active');
        return dispatch(activeRunsDispatch(response.data));
    };
}

export function getActiveRunConfiguration() {
    return async function(dispatch) {
        const response = await axios.get('/api/run/config');
        return dispatch(runConfigurationDispatch(response.data));
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

export function saveResult(result) {
    return async function(dispatch) {
        const response = await axios.post('/api/test/result', {
            data: result
        });
        return dispatch(saveResultDispatch(response.data));
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

export function getTestVersions() {
    return async function(dispatch) {
        const response = await axios.get('/api/test-versions');
        return dispatch(testVersionsDispatch(response.data));
    };
}
