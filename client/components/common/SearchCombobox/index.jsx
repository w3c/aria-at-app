import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './SearchCombobox.module.css';

/**
 * Generic searchable combobox component
 */
const SearchCombobox = ({
  id,
  label,
  placeholder,
  searchText,
  onSearchChange,
  items,
  onSelectItem,
  onFetchItems,
  loading,
  initialFocusRef,
  itemRenderer,
  searchFields,
  excludeIds = [],
  maxResults = 20,
  ariaLabel = 'Available items',
  instructions = 'Use arrow keys to navigate results, Enter to select, Escape to close.'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialFocusRef) {
      initialFocusRef.current = inputRef.current;
    }
  }, [initialFocusRef]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        listboxRef.current &&
        !listboxRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reset active index when items change
  useEffect(() => {
    setActiveIndex(-1);
  }, [items]);

  const handleFocus = () => {
    if (onFetchItems) {
      onFetchItems();
    }
    setIsOpen(true);
  };

  const handleBlur = e => {
    // Only close if not clicking within the listbox
    if (listboxRef.current && listboxRef.current.contains(e.relatedTarget)) {
      return;
    }
    // Small delay to allow click events to register
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleSelect = item => {
    onSelectItem(item);
    setIsOpen(false);
    onSearchChange('');
    setActiveIndex(-1);
    // Return focus to input
    inputRef.current?.focus();
  };

  const handleKeyDown = e => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          handleSelect(items[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      default:
        break;
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeOption = listboxRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      activeOption?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const listboxId = `${id}-listbox`;
  const activeDescendant =
    activeIndex >= 0 ? `${id}-option-${items[activeIndex]?.id}` : '';

  return (
    <div className="mb-1">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="position-relative">
        <input
          ref={inputRef}
          id={id}
          className="form-control"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-owns={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-describedby={`${id}-instructions`}
        />
        <span id={`${id}-instructions`} className="visually-hidden">
          {instructions}
        </span>

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className={`list-group position-absolute w-100 ${styles.listbox}`}
          >
            {loading && (
              <li className="list-group-item" role="status" aria-live="polite">
                Loading...
              </li>
            )}
            {!loading && items.length === 0 && (
              <li className="list-group-item text-muted" role="status">
                No items found.
              </li>
            )}
            {!loading &&
              items.map((item, idx) => {
                const isActive = idx === activeIndex;
                const optionId = `${id}-option-${item.id}`;
                return (
                  <li
                    key={item.id}
                    id={optionId}
                    role="option"
                    aria-selected={isActive}
                    data-index={idx}
                    className={`list-group-item list-group-item-action${
                      isActive ? ' active' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    {itemRenderer ? (
                      itemRenderer(item, styles)
                    ) : (
                      <>
                        <strong>{item.title || item.name}</strong>
                        {item.id && (
                          <span className="text-muted"> (#{item.id})</span>
                        )}
                        {item.url && (
                          <div
                            className={`small text-truncate ${styles.itemUrl}`}
                          >
                            {item.url}
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
};

SearchCombobox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  searchText: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelectItem: PropTypes.func.isRequired,
  onFetchItems: PropTypes.func,
  loading: PropTypes.bool,
  initialFocusRef: PropTypes.object,
  itemRenderer: PropTypes.func,
  searchFields: PropTypes.func,
  excludeIds: PropTypes.arrayOf(PropTypes.string),
  maxResults: PropTypes.number,
  ariaLabel: PropTypes.string,
  instructions: PropTypes.string
};

export default SearchCombobox;
