import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { act } from 'react-dom/test-utils';

const IsGraphQLLoadingContext = createContext();

const useIsGraphQLLoading = () => {
    const isGraphQLLoading = useContext(IsGraphQLLoadingContext);
    return isGraphQLLoading;
};

let isLoading;
const persistentListeners = [];
let oneTimeLoadedListeners = [];
let waitForWaterfallingQueries = null;
const getNumberOfActiveQueries = numberOfActiveQueries => {
    if (waitForWaterfallingQueries !== null) {
        clearTimeout(waitForWaterfallingQueries);
        waitForWaterfallingQueries = null;
    }
    if (numberOfActiveQueries === 0) {
        waitForWaterfallingQueries = setTimeout(() => {
            isLoading = false;
            persistentListeners.forEach(listener => listener(isLoading));
            oneTimeLoadedListeners.forEach(listener => listener(isLoading));
            oneTimeLoadedListeners = [];
        }, 1);
        return;
    }
    isLoading = true;
    persistentListeners.forEach(listener => listener(isLoading));
};

const waitForGraphQL = async () => {
    return act(async () => {
        if (isLoading === false) return;
        return new Promise(resolve => {
            oneTimeLoadedListeners.push(resolve);
        });
    });
};

const IsGraphQLLoadingProvider = ({ children }) => {
    const [isGraphQLLoading, setIsGraphQLLoading] = useState(true);

    useEffect(() => {
        persistentListeners.push(setIsGraphQLLoading);
    }, []);

    return (
        <IsGraphQLLoadingContext.Provider value={isGraphQLLoading}>
            {children}
        </IsGraphQLLoadingContext.Provider>
    );
};

IsGraphQLLoadingProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export {
    IsGraphQLLoadingProvider,
    getNumberOfActiveQueries,
    useIsGraphQLLoading,
    waitForGraphQL
};
