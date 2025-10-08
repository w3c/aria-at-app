import React from 'react';
import PropTypes from 'prop-types';
import LinkedItemsList from '../../common/LinkedItemsList';

/**
 * Displays a list of linked AT bugs with the ability to unlink them
 */
const LinkedBugsList = React.memo(({ linkedBugs, onUnlink, unlinking }) => {
  const bugRenderer = (bug, onRemove, removing, removeButtonClass) => (
    <span key={bug.id} className="badge bg-light text-dark me-2">
      <a href={bug.url} target="_blank" rel="noopener noreferrer">
        {bug.title || `#${bug.bugId}`}
      </a>
      <button
        type="button"
        aria-label={`Unlink ${bug.title || `bug ${bug.bugId}`}`}
        className={removeButtonClass}
        onClick={() => onRemove(bug.id)}
        disabled={removing}
      >
        ×
      </button>
    </span>
  );

  return (
    <LinkedItemsList
      items={linkedBugs}
      onRemove={onUnlink}
      removing={unlinking}
      itemRenderer={bugRenderer}
    />
  );
});

LinkedBugsList.propTypes = {
  linkedBugs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      bugId: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })
  ).isRequired,
  onUnlink: PropTypes.func.isRequired,
  unlinking: PropTypes.bool
};

export default LinkedBugsList;
