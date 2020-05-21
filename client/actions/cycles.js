import checkForConflict from '../utils/checkForConflict';
import axios from 'axios';
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

export const getIssuesByTestIdDispatch = payload => ({
    type: ISSUES_BY_TEST_ID,
    payload
});

export const createIssueSuccessDispatch = payload => ({
    type: CREATE_ISSUE_SUCCESS,
    payload
});

export const getConflictsByTestResultsDispatch = payload => ({
    type: CONFLICTS_BY_TEST_RESULTS,
    payload
});

export function saveResult(result) {
    return async function(dispatch) {
        const response = await axios.post('/api/cycle/result', {
            data: result
        });
        return dispatch(saveResultDispatch(response.data));
    };
}

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

export function saveUsersToRuns(users, runs, cycleId) {
    return async function(dispatch) {
        const response = await axios.post('/api/user/run', {
            users,
            runs
        });
        return dispatch(saveUsersToRunsDispatch({ ...response.data, cycleId }));
    };
}

export function deleteUsersFromRun(users, runId, cycleId) {
    return async function(dispatch) {
        const response = await axios.delete('/api/user/run', {
            data: { users, runId }
        });
        return dispatch(
            deleteUsersFromRunDispatch({ ...response.data, cycleId })
        );
    };
}

/**
 * getIssuesByTestId        Retrieve all issues known to ARIA-AT and
 *                          their corresponding Github Issue object
 * @param  {Number} test_id The test_id that corresponds to a given Issue
 * @return {Array}          An array of Github Issue objects.
 */
export function getIssuesByTestId(test_id) {
    return async function(dispatch) {
        const response = await axios.get(
            `/api/cycle/issues?test_id=${test_id}`
        );
        return dispatch(getIssuesByTestIdDispatch(response.data));
    };
}

/**
 * createIssue           Create a new issue via Github API
 * @param  {Object} data Title, body, run, test
 * @return {Issue}       The Issue object returned by Github
 */
export function createIssue(data) {
    return async function(dispatch) {
        const response = await axios.post('/api/cycle/issue', {
            data
        });
        return dispatch(createIssueSuccessDispatch(response.data));
    };
}

//
// TODO: These are intentionally unimplemented and will
//       be completed in a follow up changeset.
//

/**
 * getConflictsByTestResults    Returns an array of conflicts for a
 *                              test in a given test results set.
 * @param  {Test} test          The test object
 * @param  {Number} userId      This user's id
 *
 * @return {Object { test_id, conflicts }}
 */
export function getConflictsByTestResults(test, userId) {
    return async function(dispatch) {
        // const response = await axios.get(
        //     `/api/cycle/conflicts?cycle_id=${cycle_id}`
        // );
        // dispatch(getConflictsByTestResultsDispatch(response.data));
        const conflicts = test.results
            ? checkForConflict(test.results, userId)
            : [];
        return dispatch(
            getConflictsByTestResultsDispatch({
                test_id: test.id,
                conflicts
            })
        );
    };
}
