import { combineReducers } from 'redux';
import auth from './auth';
import ats from './ats';
import issues from './issues';
import runs from './runs';
import user from './user';
import users from './users';

export default combineReducers({
    auth,
    ats,
    issues,
    runs,
    user,
    users
});
