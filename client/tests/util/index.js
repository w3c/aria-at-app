import { createStore } from 'redux';
import rootReducer from '../../redux/reducers';
import middleware from '../../redux/middleware';

export const storeFactory = initialState => {
    return createStore(rootReducer, initialState, middleware);
};

export const findByTestAttr = function(wrapper, val) {
    return wrapper.find(`[data-test="${val}"]`);
};
