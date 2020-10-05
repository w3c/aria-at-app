import {
    SAVE_RUN_CONFIGURATION,
    ACTIVE_RUNS
} from '../actions/types';

const initialState = {
    activeRunConfiguration: undefined,
    activeRuns: undefined
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SAVE_RUN_CONFIGURATION: {
            const { runs, config } = action.payload;
            return Object.assign({}, state, {
                activeRuns: runs,
                activeRunConfiguration: config
            });
        }
        case ACTIVE_RUNS: {
            const runs = action.payload;
            return Object.assign({}, state, {
                activeRuns: runs
            });
        }
        default:
            return state;
    }
};
