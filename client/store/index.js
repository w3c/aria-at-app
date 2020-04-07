import { createStore } from 'redux';
import rootReducer from '@client/reducers';
import middleware from '@client/middleware';

export default createStore(rootReducer, middleware);
