import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays a list of linked AT bugs with the ability to unlink them
 */
const LinkedBugsList = ({ linkedBugs, onUnlink, unlinking }) => {
  if (!linkedBugs || linkedBugs.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      {linkedBugs.map(b => (
        <span key={b.id} className="badge bg-light text-dark me-2">
          <a href={b.url} target="_blank" rel="noopener noreferrer">
            {b.title || `#${b.bugId}`}
          </a>
          <button
            type="button"
            aria-label={`Unlink ${b.title || `bug ${b.bugId}`}`}
            className="btn btn-sm btn-link ms-1"
            onClick={() => onUnlink(b.id)}
            disabled={unlinking}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

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
