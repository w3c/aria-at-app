import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Tabs.module.css';

const Tabs = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabRefs = useRef([]);

  const getTabIndexFromQuery = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabKey = searchParams.get('tab');
    if (!tabKey) return 0;

    const index = tabs.findIndex(tab => tab.tabKey === tabKey);
    return index >= 0 ? index : 0;
  };

  const [selectedTab, setSelectedTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabKey = searchParams.get('tab');
    if (!tabKey) return 0;

    const index = tabs.findIndex(tab => tab.tabKey === tabKey);
    return index >= 0 ? index : 0;
  });

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  useEffect(() => {
    const queryIndex = getTabIndexFromQuery();
    if (queryIndex !== selectedTab) {
      setSelectedTab(queryIndex);
    }
  }, [location.search, tabs]);

  const updateSelectedTab = index => {
    setSelectedTab(index);
    const tab = tabs[index];
    const tabKey = tab.tabKey || `tab-${index}`;
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tabKey);
    const newSearch = searchParams.toString();
    navigate(
      `${location.pathname}${newSearch ? `?${newSearch}` : ''}${location.hash}`,
      {
        replace: true
      }
    );
  };

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
    updateSelectedTab(newIndex);
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
            onClick={() => updateSelectedTab(index)}
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
      content: PropTypes.node.isRequired,
      tabKey: PropTypes.string
    })
  ).isRequired
};

export default Tabs;
