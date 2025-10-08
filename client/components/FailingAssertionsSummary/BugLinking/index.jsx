import React from 'react';
import PropTypes from 'prop-types';
import BugLinkingModal from '../../common/BugLinking/BugLinkingModal';
import {
  BugLinkingProvider,
  useBugLinkingContext
} from '../../common/BugLinking/BugLinkingContext';

/**
 * Inner component that uses the context
 * Separated to avoid using context in the same component that provides it
 */
const LinkAtBugModalInner = ({ show, onClose }) => {
  const context = useBugLinkingContext();

  return (
    <BugLinkingModal
      show={show}
      onClose={onClose}
      useBugLinkingContext={() => context}
      title={`Link ${context.atName || 'AT'} Bug to Failing Assertion`}
    />
  );
};

LinkAtBugModalInner.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Main LinkAtBugModal component
 * Provides context and renders the modal
 */
const LinkAtBugModal = ({
  show,
  onClose,
  atId,
  atName,
  assertion,
  onLinked
}) => {
  return (
    <BugLinkingProvider
      atId={atId}
      atName={atName}
      assertion={assertion}
      onLinked={onLinked}
      onClose={onClose}
    >
      <LinkAtBugModalInner show={show} onClose={onClose} />
    </BugLinkingProvider>
  );
};

LinkAtBugModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  atName: PropTypes.string,
  assertion: PropTypes.object,
  onLinked: PropTypes.func
};

export default LinkAtBugModal;
