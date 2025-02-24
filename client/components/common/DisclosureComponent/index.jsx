import React, { Fragment, useState } from 'react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const DisclosureParent = styled.div`
  border: 1px solid #d3d5da;
  border-radius: 3px;
  width: 100%;

  h1,
  h2,
  h3,
  h4 {
    margin: 0;
    padding: 0;
  }

  ${({ stacked }) =>
    stacked &&
    `
    h1:not(:first-of-type) button,
    h2:not(:first-of-type) button,
    h3:not(:first-of-type) button,
    h4:not(:first-of-type) button {
        border-top: 1px solid #d3d5da;
    }`}
`;

const DisclosureButton = styled.button`
  position: relative;
  width: 100%;
  margin: 0;
  padding: 1.25rem 40px 1.25rem 1.25rem;
  text-align: left;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 3px;
  background-color: transparent;

  ${({ stacked }) =>
    stacked &&
    `
    &:nth-last-of-type(1) {
        border-radius: 0 0 3px 3px;
    } `}

  &:hover,
    &:focus {
    padding: 1.25rem;
    border: 0 solid #005a9c;
    background-color: #def;
    cursor: pointer;
  }

  .disclosure-icon {
    position: absolute;
    margin: 0;
    top: 50%;
    right: 1.25rem;

    color: #969696;
    transform: translateY(-50%);
  }
`;

const DisclosureContainer = styled.div`
  display: ${({ show, stacked }) =>
    show && stacked ? 'block' : show ? 'flex' : 'none'};
  flex-direction: ${({ stacked }) => !stacked && 'column'};
  gap: ${({ stacked }) => !stacked && '1.25rem'};

  background-color: #f8f9fa;
  padding: ${({ component }) =>
    component === 'test-management' ? '0' : '1.25rem'};
  border-top: 1px solid #d3d5da;
`;

const DisclosureComponent = ({
  componentId,
  title = null,
  disclosureContainerView = null,
  onClick = null,
  expanded,
  stacked = false,
  headingLevel = '3',
  className = null
}) => {
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(expanded || false);
  const expandedState = isControlled ? expanded : internalExpanded;

  const handleToggle = () => {
    if (isControlled) {
      if (onClick) {
        onClick();
      }
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const Tag = `h${headingLevel}`;

  return (
    <>
      {stacked ? (
        <DisclosureParent stacked className={className}>
          {title.map((_, index) => {
            const buttonTitle = title[index];
            const labelTitle =
              typeof buttonTitle === 'string' ? buttonTitle : index;
            const buttonExpanded = expanded[index];
            const buttonOnClick = onClick[index];
            const buttonDisclosureContainerView =
              disclosureContainerView[index];

            return (
              <Fragment key={`disclosure-${index}-key`}>
                <Tag>
                  <DisclosureButton
                    id={`disclosure-btn-${componentId}-${labelTitle}`}
                    type="button"
                    aria-expanded={buttonExpanded}
                    aria-controls={`disclosure-btn-controls-${componentId}-${labelTitle}`}
                    onClick={buttonOnClick}
                    stacked
                  >
                    {buttonTitle}
                    <FontAwesomeIcon
                      className="disclosure-icon"
                      icon={buttonExpanded ? faChevronUp : faChevronDown}
                    />
                  </DisclosureButton>
                </Tag>
                <DisclosureContainer
                  role="region"
                  id={`disclosure-btn-controls-${componentId}-${labelTitle}`}
                  aria-labelledby={`disclosure-btn-${componentId}-${labelTitle}`}
                  show={buttonExpanded}
                  stacked
                >
                  {buttonDisclosureContainerView}
                </DisclosureContainer>
              </Fragment>
            );
          })}
        </DisclosureParent>
      ) : (
        <DisclosureParent className={className}>
          <Tag>
            <DisclosureButton
              id={`disclosure-btn-${componentId}`}
              type="button"
              aria-expanded={expandedState}
              aria-controls={`disclosure-btn-controls-${componentId}`}
              onClick={handleToggle}
            >
              {title}
              <FontAwesomeIcon
                className="disclosure-icon"
                icon={expandedState ? faChevronUp : faChevronDown}
              />
            </DisclosureButton>
          </Tag>
          <DisclosureContainer
            component={componentId}
            role="region"
            id={`disclosure-btn-controls-${componentId}`}
            aria-labelledby={`disclosure-btn-${componentId}`}
            show={expandedState}
          >
            {disclosureContainerView}
          </DisclosureContainer>
        </DisclosureParent>
      )}
    </>
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
  expanded: PropTypes.bool,
  stacked: PropTypes.bool,
  headingLevel: PropTypes.string,
  className: PropTypes.string
};

export default DisclosureComponent;
