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
    const endpoint = testPlanRunIssues;
    return axios
        .post(endpoint, params)
        .then(handleResponse)
        .catch(handleError);
};
