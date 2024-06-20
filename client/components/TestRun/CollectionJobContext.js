import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { COLLECTION_JOB_UPDATES_QUERY } from './queries';
import { isJobStatusFinal } from '../../utils/collectionJobStatus';
const pollInterval = 5000;

export const Context = createContext({
    state: {
        collectionJob: null
    },
    actions: {}
});

export const Provider = ({ children, testPlanRun }) => {
    if (!testPlanRun) {
        // Anonymous page / not working, just viewing the tests, no need for the
        // provider to provide any data or updates, but to be consistent we will
        // still wrap with a provider with static data
        return (
            <Context.Provider value={{ state: {}, actions: {} }}>
                {children}
            </Context.Provider>
        );
    }
    const { id: testPlanRunId, collectionJob: initialCollectionJob } =
        testPlanRun;
    const [providerValue, setProviderValue] = useState({
        state: { collectionJob: initialCollectionJob },
        actions: {}
    });

    const [, { data: collectionJobUpdateData, startPolling, stopPolling }] =
        testPlanRunId
            ? useLazyQuery(COLLECTION_JOB_UPDATES_QUERY, {
                  fetchPolicy: 'cache-and-network',
                  variables: { collectionJobId: initialCollectionJob?.id },
                  pollInterval
              })
            : {};

    // control the data flow, turn on polling if this is a collection job report
    // that still has possible updates.
    useEffect(() => {
        // use the colllection job from the polling update first priority
        // otherwise, default to the first data fetch from the API
        const collectionJob =
            collectionJobUpdateData?.collectionJob ?? initialCollectionJob;
        const status = collectionJob?.status;
        if (collectionJob && !isJobStatusFinal(status)) {
            startPolling(pollInterval);
        } else {
            stopPolling();
        }
        setProviderValue({ state: { collectionJob }, actions: {} });
    }, [collectionJobUpdateData]);

    return (
        <Context.Provider value={providerValue}>{children}</Context.Provider>
    );
};

Provider.propTypes = {
    children: PropTypes.node,
    testPlanRun: PropTypes.shape({
        id: PropTypes.string,
        collectionJob: PropTypes.shape({
            id: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            testStatus: PropTypes.arrayOf(PropTypes.object).isRequired
        })
    })
};
