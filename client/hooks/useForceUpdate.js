import React from 'react';

/**
 * Hook to force a component re-render. Useful when you need to trigger a re-render
 * without changing state or props.
 *
 * @returns {Function} Function that when called forces a re-render
 */
const useForceUpdate = () => {
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  return forceUpdate;
};

export default useForceUpdate;
