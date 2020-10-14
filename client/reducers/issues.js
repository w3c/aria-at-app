import { CREATE_ISSUE_SUCCESS, ISSUES_BY_TEST_ID } from '../actions/types';

const initialState = {
    issuesByTestId: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ISSUES_BY_TEST_ID: {
            const { test_id, issues } = action.payload;
            const issuesByTestId = test_id ? { [test_id]: issues } : {};
            return {
                ...state,
                issuesByTestId: {
                    ...state.issuesByTestId,
                    ...issuesByTestId
                }
            };
        }
        case CREATE_ISSUE_SUCCESS: {
            const { issuesByTestId } = state;

            const { test_id, issues } = action.payload;

            if (!issuesByTestId[test_id]) {
                issuesByTestId[test_id] = [];
            }

            issuesByTestId[test_id].push(...issues);

            return {
                ...state,
                issuesByTestId
            };
        }
        default:
            return state;
    }
};
