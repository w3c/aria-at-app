import React from 'react';
import PropTypes from 'prop-types';
import styles from './AtBrowserVersion.module.css';

const AtVersion = ({ at, minimumAtVersion, exactAtVersion }) => {
  const atVersionFormatted = minimumAtVersion
    ? `${minimumAtVersion.name} or later`
    : exactAtVersion.name;

  return (
    <div className={styles.versionContainer}>
      {at.name}&nbsp;
      <span>{atVersionFormatted}</span>
    </div>
  );
};

AtVersion.propTypes = {
  at: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  minimumAtVersion: PropTypes.shape({ name: PropTypes.string.isRequired }),
  exactAtVersion: PropTypes.shape({ name: PropTypes.string.isRequired })
};

const BrowserVersion = ({ browser }) => {
  return (
    <div className={styles.versionContainer}>
      {browser.name}&nbsp;
      <span>Any version</span>
    </div>
  );
};

BrowserVersion.propTypes = {
  browser: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

export { AtVersion, BrowserVersion };
