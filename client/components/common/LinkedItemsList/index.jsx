import React from 'react';
import PropTypes from 'prop-types';

/**
 * Generic component for displaying a list of linked items with remove functionality
 */
const LinkedItemsList = ({
  items,
  onRemove,
  removing = false,
  itemRenderer,
  badgeClass = 'badge bg-light text-dark me-2',
  removeButtonClass = 'btn btn-sm btn-link ms-1'
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const defaultItemRenderer = (item, onRemove, removing, removeButtonClass) => (
    <span key={item.id} className={badgeClass}>
      {item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title || `#${item.id}`}
        </a>
      ) : (
        <span>{item.title || `#${item.id}`}</span>
      )}
      <button
        type="button"
        aria-label={`Remove ${item.title || `item ${item.id}`}`}
        className={removeButtonClass}
        onClick={() => onRemove(item.id)}
        disabled={removing}
      >
        ×
      </button>
    </span>
  );

  return (
    <div className="mb-2">
      {items.map(item =>
        itemRenderer
          ? itemRenderer(item, onRemove, removing, removeButtonClass)
          : defaultItemRenderer(item, onRemove, removing, removeButtonClass)
      )}
    </div>
  );
};

LinkedItemsList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      url: PropTypes.string
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  removing: PropTypes.bool,
  itemRenderer: PropTypes.func,
  badgeClass: PropTypes.string,
  removeButtonClass: PropTypes.string
};

export default LinkedItemsList;
