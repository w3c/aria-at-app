import { combineReducers } from 'redux';
import ats from './ats';
import issues from './issues';
import runs from './runs';
import user from './user';
import users from './users';

export default combineReducers({
    ats,
    issues,
    runs,
    user,
    users,
});
