import React from 'react';

// https://stackoverflow.com/a/53215514
const useForceUpdate = () => {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    return forceUpdate;
};

export default useForceUpdate;
