import axios from 'axios';
import {
    CYCLES,
    DELETE_CYCLE,
    SAVE_CYCLE,
    TEST_SUITE_VERSIONS,
    TESTS_BY_RUN_ID
} from './types';

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

export const getIssuesByTestIdDispatch = payload => ({
    type: ISSUES_BY_TEST_ID,
    payload
});

export const createIssueSuccessDispatch = payload => ({
    type: CREATE_ISSUE_SUCCESS,
    payload
});

export function saveCycle(cycle) {
    return async function(dispatch) {
        const response = await axios.post('/api/cycle', {
            data: cycle
        });
        return dispatch(saveCycleDispatch(response.data));
    };
}

export function deleteCycle(id) {
    return async function(dispatch) {
        const response = await axios.delete('/api/cycle', {
            data: { id }
        });
        return dispatch(deleteCycleDispatch(response.data));
    };
}

export function getTestCycles() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle');
        return dispatch(cyclesDispatch(response.data));
    };
}

export function getTestsForRunsCycle(cycleId) {
    return async function(dispatch) {
        const response = await axios.get(`/api/cycle/runs?cycleId=${cycleId}`);
        return dispatch(testsByRunIdDispatch(response.data));
    };
}

export function getTestSuiteVersions() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle/testversions');
        return dispatch(testSuiteVersionsDispatch(response.data));
    };
}

