import axios from 'axios';
import {
    getTestPlanRunIssuesByTestResultIndex,
    testPlanRunIssues
} from './endpoints';
import { handleError, handleResponse } from './utils';

export const getTestPlanRunIssuesForTest = (testPlanRunId, testResultIndex) => {
    const endpoint = getTestPlanRunIssuesByTestResultIndex(
        testPlanRunId,
        testResultIndex
    );
    return axios
        .get(endpoint)
        .then(handleResponse)
        .catch(handleError);
};

export const createTestPlanRunIssue = params => {
    return axios
        .post(testPlanRunIssues, params)
        .then(handleResponse)
        .catch(handleError);
};

export const getSupportJson = () => {
    // TODO: make this an environment variable
    const endpoint =
        'https://raw.githubusercontent.com/w3c/aria-at/master/tests/support.json';
    return axios
        .get(endpoint)
        .then(handleResponse)
        .catch(handleError);
};
