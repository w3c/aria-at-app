import { combineReducers } from 'redux';
import cycles from './cycles';
import ats from './ats';
import user from './user';
import users from './users';

export default combineReducers({
    user,
    cycles,
    ats,
    users
});
