import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './RefreshButton.module.css';

const RefreshButton = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    try {
      await onRefresh();
      const elapsedTime = Date.now() - startTime;
      const minimumDuration = 750;
      // Allows for a full revolution of the spinner
      if (elapsedTime < minimumDuration) {
        await new Promise(resolve =>
          setTimeout(resolve, minimumDuration - elapsedTime)
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      className={styles.refreshButton}
      aria-label={isRefreshing ? 'Refreshing...' : 'Refresh'}
      disabled={isRefreshing}
    >
      <i
        className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
};

RefreshButton.propTypes = {
  onRefresh: PropTypes.func.isRequired
};

export default RefreshButton;
