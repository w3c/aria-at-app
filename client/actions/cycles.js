import axios from 'axios';
import { CYCLES, DELETE_CYCLE } from './types';

export function deleteCycle(id) {
    return async function(dispatch) {
        const response = await axios.delete('/api/cycle', {
            data: { id }
        });
        dispatch({
            type: DELETE_CYCLE,
            payload: response.data
        });
    };
}

export function getTestCycles() {
    return async function(dispatch) {
        const response = await axios.get('/api/cycle');
        dispatch({
            type: CYCLES,
            payload: response.data
        });
    };
}
