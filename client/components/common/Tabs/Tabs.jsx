import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, basePath }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabRefs = useRef([]);
  const focusRef = useRef(null);

  const getTabIndexFromPath = () => {
    if (!basePath) return 0;
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const baseSegments = basePath.split('/').filter(Boolean);
    const relativePath = pathSegments.slice(baseSegments.length);
    const currentTabKey = relativePath[0];

    if (!currentTabKey) return 0;
    const index = tabs.findIndex(tab => tab.tabKey === currentTabKey);
    return index >= 0 ? index : 0;
  };

  const [selectedTab, setSelectedTab] = useState(() => getTabIndexFromPath());

  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  useEffect(() => {
    const targetIndex = focusRef.current;
    if (
      targetIndex !== null &&
      targetIndex === selectedTab &&
      tabRefs.current[targetIndex]
    ) {
      // setTimeout to ensure focus happens after DOM updates and path changes
      setTimeout(() => {
        if (tabRefs.current[targetIndex]) {
          tabRefs.current[targetIndex].focus();
        }
        focusRef.current = null;
      }, 0);
    }
  }, [selectedTab, location.pathname]);

  useEffect(() => {
    if (!basePath) return;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const baseSegments = basePath.split('/').filter(Boolean);
    const relativePath = pathSegments.slice(baseSegments.length);
    const currentTabKey = relativePath[0];

    if (currentTabKey) {
      const index = tabs.findIndex(tab => tab.tabKey === currentTabKey);
      if (index < 0) {
        navigate(basePath, { replace: true });
        return;
      }
    }

    const pathIndex = getTabIndexFromPath();
    // Don't update selectedTab if we're in the middle of a programmatic nav
    // (indicated by focusTargetRef being set)
    if (pathIndex !== selectedTab && focusRef.current === null) {
      setSelectedTab(pathIndex);
    }
  }, [location.pathname, tabs, basePath, selectedTab, navigate]);

  const updateSelectedTab = index => {
    setSelectedTab(index);
    const tab = tabs[index];
    const tabKey = tab.tabKey || `tab-${index}`;
    let targetPath;
    if (!basePath) {
      targetPath = location.pathname;
    } else if (index === 0) {
      targetPath = basePath;
    } else {
      targetPath = `${basePath}/${tabKey}`;
    }
    navigate(`${targetPath}${location.search}${location.hash}`, {
      replace: true
    });
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
    focusRef.current = newIndex;
    updateSelectedTab(newIndex);
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
  ).isRequired,
  basePath: PropTypes.string
};

export default Tabs;
