import React from 'react';
import PropTypes from 'prop-types';
import SearchCombobox from '../../common/SearchCombobox';

const BugSearchCombobox = React.memo(
  ({
    searchText,
    onSearchChange,
    filteredBugs,
    onSelectBug,
    onFetchBugs,
    loading,
    initialFocusRef,
    atName = 'AT'
  }) => {
    const handleSelectBug = bug => {
      onSelectBug(bug.id);
    };

    const bugRenderer = (bug, styles) => (
      <>
        <strong>{bug.title}</strong>
        {bug.bugId && ` #${bug.bugId}`}
        {bug.url && (
          <div className={`small text-truncate ${styles.itemUrl}`}>
            {bug.url}
          </div>
        )}
      </>
    );

    return (
      <SearchCombobox
        id="bug-search-combobox"
        label={`${atName} Bug`}
        placeholder="Type to search by title, number, or URL"
        searchText={searchText}
        onSearchChange={onSearchChange}
        items={filteredBugs}
        onSelectItem={handleSelectBug}
        onFetchItems={onFetchBugs}
        loading={loading}
        initialFocusRef={initialFocusRef}
        itemRenderer={bugRenderer}
        ariaLabel={`Available ${atName} bugs`}
      />
    );
  }
);

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
  initialFocusRef: PropTypes.object,
  atName: PropTypes.string
};

export default BugSearchCombobox;
