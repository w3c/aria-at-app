import axios from 'axios';
import {
    CREATE_ISSUE_SUCCESS,
    ISSUES_BY_TEST_ID
} from './types';

export const getIssuesByTestIdDispatch = payload => ({
    type: ISSUES_BY_TEST_ID,
    payload
});

export const createIssueSuccessDispatch = payload => ({
    type: CREATE_ISSUE_SUCCESS,
    payload
});

/**
 * getIssuesByTestId        Retrieve all issues known to ARIA-AT and
 *                          their corresponding Github Issue object
 * @param  {Number} test_id The test_id that corresponds to a given Issue
 * @return {Array}          An array of Github Issue objects.
 */
export function getIssuesByTestId(test_id) {
    return async function(dispatch) {
        const response = await axios.get(
            `/api/tests/issues?test_id=${test_id}`
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
        const response = await axios.post('/api/tests/issue', {
            data
        });
        return dispatch(createIssueSuccessDispatch(response.data));
    };
}
