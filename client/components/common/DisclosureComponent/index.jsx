import React, { Fragment, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './DisclosureComponent.module.css';

const DisclosureComponent = ({
  componentId,
  title = null,
  disclosureContainerView = null,
  onClick = null,
  expanded = false,
  headingLevel = '3',
  className = null
}) => {
  const Heading = `h${headingLevel}`;
  const [isExpanded, setIsExpanded] = useState(expanded);

  const titlesArr = Array.isArray(title) ? title : [title];
  const disclosureViewsArr = Array.isArray(disclosureContainerView)
    ? disclosureContainerView
    : [disclosureContainerView];
  const clickFuncsArr = Array.isArray(onClick)
    ? onClick
    : [() => setIsExpanded(!isExpanded)];
  const isExpandedBoolsArr = Array.isArray(expanded) ? expanded : [isExpanded];
  const isStacked = titlesArr.length > 1;

  return (
    <div
      className={clsx(
        styles.disclosureContainer,
        isStacked && styles.stacked,
        className
      )}
    >
      {titlesArr.map((_, index) => {
        const buttonTitle = titlesArr[index];
        const labelTitle =
          typeof buttonTitle === 'string' ? buttonTitle : index;
        const buttonExpanded = isExpandedBoolsArr[index];
        const buttonOnClick = clickFuncsArr[index];
        const buttonDisclosureContainerView = disclosureViewsArr[index];

        return (
          <Fragment key={`${componentId}_${index}`}>
            <Heading className={styles.disclosureHeading}>
              <button
                className={clsx(
                  styles.disclosureButton,
                  isStacked && styles.stacked
                )}
                id={`disclosure-btn-${componentId}-${labelTitle}`}
                type="button"
                aria-expanded={buttonExpanded}
                aria-controls={`disclosure-btn-controls-${componentId}-${labelTitle}`}
                onClick={buttonOnClick}
              >
                {buttonTitle}
                <FontAwesomeIcon
                  className={styles.disclosureIcon}
                  icon={buttonExpanded ? faChevronUp : faChevronDown}
                />
              </button>
            </Heading>
            <div
              className={clsx(
                styles.disclosureContent,
                buttonExpanded ? styles.visible : styles.hidden,
                isStacked && styles.stacked
              )}
              role="region"
              id={`disclosure-btn-controls-${componentId}-${labelTitle}`}
              aria-labelledby={`disclosure-btn-${componentId}-${labelTitle}`}
            >
              {buttonDisclosureContainerView}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

DisclosureComponent.propTypes = {
  componentId: PropTypes.string,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.node)
  ]),
  disclosureContainerView: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ]),
  onClick: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.func)
  ]),
  expanded: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.bool)
  ]),
  stacked: PropTypes.bool,
  headingLevel: PropTypes.string,
  className: PropTypes.string
};

export default DisclosureComponent;
