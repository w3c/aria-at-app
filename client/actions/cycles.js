import axios from 'axios';
import { CYCLES } from './types';

export function getTestCycles() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle');
        dispatch({
            type: CYCLES,
            payload: response.data
        });
    };
}
