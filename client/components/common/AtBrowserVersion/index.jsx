import React from 'react';
import PropTypes from 'prop-types';
import { AtVersionPropType } from '../../common/proptypes';
import styles from './AtBrowserVersion.module.css';
import { utils } from 'shared';

const AtVersion = ({
  at,
  allowAtVersionSelect = false,
  minimumAtVersion,
  exactAtVersion,
  rowIndex,
  onMinimumAtVersionChange
}) => {
  const handleMinimumAtVersionChange = e => {
    const minimumAtVersionId = e.target.value;
    const updatedMinimumAtVersion = at.atVersions.find(
      atVersion => atVersion.id === minimumAtVersionId
    );
    onMinimumAtVersionChange(rowIndex, updatedMinimumAtVersion);
  };

  let atVersionEl;
  if (minimumAtVersion) {
    if (allowAtVersionSelect) {
      const sortedAtVersions = utils
        .sortAtVersions(at.atVersions.slice())
        .reverse();

      atVersionEl = (
        <span>
          <select
            onChange={handleMinimumAtVersionChange}
            defaultValue={minimumAtVersion.id}
            className={styles.minimumAtVersionSelect}
          >
            {sortedAtVersions.map(atVersion => (
              <option key={atVersion.id} value={atVersion.id}>
                {atVersion.name}
              </option>
            ))}
          </select>
          &nbsp;or later
        </span>
      );
    } else atVersionEl = <span>{minimumAtVersion.name} or later</span>;
  } else atVersionEl = <span>{exactAtVersion.name}</span>;

  return (
    <div className={styles.versionContainer}>
      {at.name}&nbsp;
      {atVersionEl}
    </div>
  );
};

AtVersion.propTypes = {
  at: PropTypes.shape({
    name: PropTypes.string.isRequired,
    atVersions: PropTypes.arrayOf(AtVersionPropType)
  }).isRequired,
  allowAtVersionSelect: PropTypes.bool,
  minimumAtVersion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  exactAtVersion: PropTypes.shape({ name: PropTypes.string.isRequired }),
  rowIndex: PropTypes.number,
  onMinimumAtVersionChange: PropTypes.func
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
