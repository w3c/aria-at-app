import { combineReducers } from 'redux';
import ats from './ats';
import cycles from './cycles';
import issues from './issues';
import runs from './runs';
import user from './user';
import users from './users';

export default combineReducers({
    ats,
    cycles,
    issues,
    runs,
    user,
    users
});
