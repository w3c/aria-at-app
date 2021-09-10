import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

import { authState } from './auth';
import reducer from './reducer';

const initialState = {
    auth: authState
};

const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <StoreContext.Provider value={[state, dispatch]}>
            {children}
        </StoreContext.Provider>
    );
};

export const StoreContext = createContext(initialState);

StoreProvider.propTypes = {
    children: PropTypes.node
};

export default StoreProvider;
