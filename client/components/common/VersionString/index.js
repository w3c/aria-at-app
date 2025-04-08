import React from 'react';
import PropTypes from 'prop-types';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import styles from './VersionString.module.css';

const VersionString = ({
  fullWidth = true,
  autoWidth = true,
  iconColor = 'var(--negative-gray)',
  linkRef,
  linkHref,
  children: versionString
}) => {
  const body = (
    <span>
      <FontAwesomeIcon
        className="check"
        icon={faCircleCheck}
        color={iconColor}
      />
      <b>{versionString}</b>
    </span>
  );

  let possibleLink;
  if (linkHref) {
    if (linkRef) {
      possibleLink = (
        <a ref={linkRef} href={linkHref}>
          {body}
        </a>
      );
    } else {
      possibleLink = <a href={linkHref}>{body}</a>;
    }
  } else {
    possibleLink = body;
  }

  return (
    <span
      className={clsx(
        styles.styledPill,
        fullWidth && styles.fullWidth,
        autoWidth && styles.autoWidth
      )}
    >
      {possibleLink}
    </span>
  );
};

VersionString.propTypes = {
  fullWidth: PropTypes.bool,
  autoWidth: PropTypes.bool,
  iconColor: PropTypes.string,
  linkRef: PropTypes.shape({ current: PropTypes.any }),
  linkHref: PropTypes.string,
  children: PropTypes.string
};

export default VersionString;
