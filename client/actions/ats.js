import { ATS } from './types';
import axios from 'axios';

const setAts = payload => ({
    type: ATS,
    payload
});

export function handleGetValidAts() {
    return async function(dispatch) {
        const response = await axios.get('/api/at');
        dispatch(setAts(response.data));
    };
}
