import axios from 'axios';
import { CYCLES, DELETE_CYCLE } from './types';

export const deleteCycleDispatch = data => ({
    type: DELETE_CYCLE,
    payload: data
});

export const cyclesDispatch = data => ({
    type: CYCLES,
    payload: data
});

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
