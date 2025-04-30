import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Tabs.module.css';

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
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            ref={el => (tabRefs.current[index] = el)}
            id={`tab-${index}`}
            aria-selected={selectedTab === index}
            aria-controls={`panel-${index}`}
            className={`${styles.tabButton} ${
              selectedTab === index ? styles.selectedTab : ''
            }`}
            onClick={() => setSelectedTab(index)}
            onKeyDown={e => handleKeyDown(e, index)}
            tabIndex={selectedTab === index ? 0 : -1}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={selectedTab !== index}
          tabIndex={0}
          className={styles.tabPanel}
        >
          {tab.content}
        </div>
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
