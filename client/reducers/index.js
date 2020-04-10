import { combineReducers } from 'redux';
import login from './login';
import cycles from './cycles';
import ats from './ats';

export default combineReducers({
    login,
    cycles,
    ats
});
