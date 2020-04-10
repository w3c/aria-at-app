import { combineReducers } from 'redux';
import login from './login';
import cycles from './cycles';

export default combineReducers({
    login,
    cycles
});
