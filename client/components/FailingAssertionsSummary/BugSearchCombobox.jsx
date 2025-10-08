import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const BugSearchCombobox = ({
  searchText,
  onSearchChange,
  filteredBugs,
  onSelectBug,
  onFetchBugs,
  loading,
  initialFocusRef
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

  // Reset active index when filtered bugs change
  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredBugs]);

  const handleFocus = () => {
    onFetchBugs();
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

  const handleSelect = bugId => {
    onSelectBug(bugId);
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
        setActiveIndex(prev => Math.min(prev + 1, filteredBugs.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && filteredBugs[activeIndex]) {
          handleSelect(filteredBugs[activeIndex].id);
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
        setActiveIndex(filteredBugs.length - 1);
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

  const comboboxId = 'bug-search-combobox';
  const listboxId = 'bug-search-listbox';
  const activeDescendant =
    activeIndex >= 0 ? `bug-option-${filteredBugs[activeIndex]?.id}` : '';

  return (
    <div className="mb-1">
      <label htmlFor={comboboxId} className="form-label">
        AT Bug
      </label>
      <div className="position-relative">
        <input
          ref={inputRef}
          id={comboboxId}
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
          placeholder="Type to search by title, number, or URL"
          aria-describedby="combobox-instructions"
        />
        <span id="combobox-instructions" className="visually-hidden">
          Use arrow keys to navigate results, Enter to select, Escape to close.
        </span>

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Available AT bugs"
            className="list-group position-absolute w-100"
            style={{
              maxHeight: '240px',
              overflowY: 'auto',
              zIndex: 1050,
              top: '100%',
              marginTop: '2px'
            }}
          >
            {loading && (
              <li className="list-group-item" role="status" aria-live="polite">
                Loading bugs...
              </li>
            )}
            {!loading && filteredBugs.length === 0 && (
              <li className="list-group-item text-muted" role="status">
                No available bugs found.
              </li>
            )}
            {!loading &&
              filteredBugs.map((bug, idx) => {
                const isActive = idx === activeIndex;
                const optionId = `bug-option-${bug.id}`;
                return (
                  <li
                    key={bug.id}
                    id={optionId}
                    role="option"
                    aria-selected={isActive}
                    data-index={idx}
                    className={`list-group-item list-group-item-action${
                      isActive ? ' active' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelect(bug.id)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <strong>{bug.title}</strong>
                    {bug.bugId && (
                      <span className="text-muted"> (#{bug.bugId})</span>
                    )}
                    {bug.url && (
                      <div
                        className="small text-truncate"
                        style={{ maxWidth: '100%' }}
                      >
                        {bug.url}
                      </div>
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

BugSearchCombobox.propTypes = {
  searchText: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filteredBugs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      bugId: PropTypes.string,
      url: PropTypes.string
    })
  ).isRequired,
  onSelectBug: PropTypes.func.isRequired,
  onFetchBugs: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialFocusRef: PropTypes.object
};

export default BugSearchCombobox;
