import { combineReducers } from 'redux';
import login from './login';
import cycles from './cycles';
import ats from './ats';
import users from './users';

export default combineReducers({
    login,
    cycles,
    ats,
    users
});
