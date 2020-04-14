import axios from 'axios';
import { CYCLES, DELETE_CYCLE, SAVE_CYCLE, TEST_SUITE_VERSIONS } from './types';

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

export function getTestSuiteVersions() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle/testversions');
        dispatch(testSuiteVersionsDispatch(response.data));
    };
}
