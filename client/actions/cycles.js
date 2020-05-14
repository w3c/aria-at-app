import axios from 'axios';
import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    SAVE_RESULT,
    TEST_SUITE_VERSIONS,
    TESTS_BY_RUN_ID,
    SAVE_USERS_TO_RUNS,
    DELETE_USERS_FROM_RUN
} from './types';

export const saveResultDispatch = payload => ({
    type: SAVE_RESULT,
    payload
});

export const saveCycleDispatch = payload => ({
    type: SAVE_CYCLE,
    payload
});

export const deleteCycleDispatch = payload => ({
    type: DELETE_CYCLE,
    payload
});

export const cyclesDispatch = payload => ({
    type: CYCLES,
    payload
});

export const testSuiteVersionsDispatch = payload => ({
    type: TEST_SUITE_VERSIONS,
    payload
});

export const testsByRunIdDispatch = payload => ({
    type: TESTS_BY_RUN_ID,
    payload
});

export const saveUsersToRunsDispatch = payload => ({
    type: SAVE_USERS_TO_RUNS,
    payload
});

export const deleteUsersFromRunDispatch = payload => ({
    type: DELETE_USERS_FROM_RUN,
    payload
});

export function saveResult(result) {
    return async function(dispatch) {
        const response = await axios.post('/api/cycle/result', {
            data: result
        });
        dispatch(saveResultDispatch(response.data));
    };
}

export function saveCycle(cycle) {
    return async function(dispatch) {
        const response = await axios.post('/api/cycle', {
            data: cycle
        });
        dispatch(saveCycleDispatch(response.data));
    };
}

export function deleteCycle(id) {
    return async function(dispatch) {
        const response = await axios.delete('/api/cycle', {
            data: { id }
        });
        dispatch(deleteCycleDispatch(response.data));
    };
}

export function getTestCycles() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle');
        dispatch(cyclesDispatch(response.data));
    };
}

export function getTestsForRunsCycle(cycleId) {
    return async function(dispatch) {
        const response = await axios.get(`/api/cycle/runs?cycleId=${cycleId}`);
        dispatch(testsByRunIdDispatch(response.data));
    };
}

export function getTestSuiteVersions() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle/testversions');
        dispatch(testSuiteVersionsDispatch(response.data));
    };
}

export function saveUsersToRuns(users, runs, cycleId) {
    return async function(dispatch) {
        const response = await axios.post('/api/user/run', {
            users,
            runs
        });
        dispatch(saveUsersToRunsDispatch({ ...response.data, cycleId }));
    };
}

export function deleteUsersFromRun(users, runId, cycleId) {
    return async function(dispatch) {
        const response = await axios.delete('/api/user/run', {
            data: { users, runId }
        });
        dispatch(deleteUsersFromRunDispatch({ ...response.data, cycleId }));
    };
}
