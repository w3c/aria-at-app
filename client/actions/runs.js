import axios from 'axios';
import {
    SAVE_RUN_CONFIGURATION,
    ACTIVE_RUNS
} from './types';

export const saveRunConfigurationDispatch = payload => ({
    type: SAVE_RUN_CONFIGURATION,
    payload
});

export const activeRunsDispatch = payload => ({
    type: ACTIVE_RUNS,
    payload
});

export function saveRunConfiguration(config) {
    return async function(dispatch) {
        const response = await axios.post('/api/run', {
            data: config
        });
        return dispatch(saveRunConfigurationDispatch({
            runs: response.data,
            config
        }));
    };
}

export function getActiveRuns() {
    return async function(dispatch) {
        const response = await axios.get('/api/run/active');
        return dispatch(activeRunsDispatch(response.data));
    };
}
