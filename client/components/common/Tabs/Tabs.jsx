import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const TabList = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 2px;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${props => (props.selected ? '#0d6efd' : 'transparent')};
  color: ${props => (props.selected ? '#0d6efd' : '#6c757d')};
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.75rem 1.25rem;
  position: relative;
  transition: all 0.2s ease-in-out;
  margin-bottom: -2px;

  &:hover {
    color: #0d6efd;
    background-color: #f8f9fa;
    border-radius: 4px 4px 0 0;
  }

  &:focus-visible {
    outline: 2px solid #0d6efd;
    outline-offset: -2px;
    border-radius: 4px 4px 0 0;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const TabPanel = styled.div`
  padding: 1rem 0.5rem;
  transition: opacity 0.15s ease-in-out;
  opacity: ${props => (props.hidden ? 0 : 1)};

  &[hidden] {
    display: none;
  }
`;

const Tabs = ({ tabs }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const tabRefs = useRef([]);

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  const handleKeyDown = (event, index) => {
    const tabCount = tabs.length;
    let newIndex = index;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = (index - 1 + tabCount) % tabCount;
        break;
      case 'ArrowRight':
        newIndex = (index + 1) % tabCount;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabCount - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setSelectedTab(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div className="tabs-container">
      <TabList role="tablist" aria-label="Test Queue sections">
        {tabs.map((tab, index) => (
          <TabButton
            key={index}
            role="tab"
            ref={el => (tabRefs.current[index] = el)}
            id={`tab-${index}`}
            aria-selected={selectedTab === index}
            aria-controls={`panel-${index}`}
            selected={selectedTab === index}
            onClick={() => setSelectedTab(index)}
            onKeyDown={e => handleKeyDown(e, index)}
            tabIndex={selectedTab === index ? 0 : -1}
          >
            <span>{tab.label}</span>
          </TabButton>
        ))}
      </TabList>
      {tabs.map((tab, index) => (
        <TabPanel
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={selectedTab !== index}
          tabIndex={0}
        >
          {tab.content}
        </TabPanel>
      ))}
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired
    })
  ).isRequired
};

export default Tabs;
