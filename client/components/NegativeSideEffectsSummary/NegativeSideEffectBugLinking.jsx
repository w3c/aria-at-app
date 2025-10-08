import React from 'react';
import PropTypes from 'prop-types';
import BugLinkingModal from '../common/BugLinking/BugLinkingModal';
import {
  NegativeSideEffectBugLinkingProvider,
  useNegativeSideEffectBugLinkingContext
} from './NegativeSideEffectBugLinkingContext';

/**
 * Inner component that uses the context
 * Separated to avoid using context in the same component that provides it
 */
const LinkAtBugModalInner = ({ show, onClose }) => {
  const context = useNegativeSideEffectBugLinkingContext();

  return (
    <BugLinkingModal
      show={show}
      onClose={onClose}
      useBugLinkingContext={() => context}
      title={`Link ${context.atName || 'AT'} Bug to Negative Side Effect`}
    />
  );
};

LinkAtBugModalInner.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

/**
 * Main LinkAtBugModal component for negative side effects
 * Provides context and renders the modal
 */
const NegativeSideEffectLinkAtBugModal = ({
  show,
  onClose,
  atId,
  atName,
  negativeSideEffect,
  onLinked
}) => {
  return (
    <NegativeSideEffectBugLinkingProvider
      atId={atId}
      atName={atName}
      negativeSideEffect={negativeSideEffect}
      onLinked={onLinked}
      onClose={onClose}
    >
      <LinkAtBugModalInner show={show} onClose={onClose} />
    </NegativeSideEffectBugLinkingProvider>
  );
};

NegativeSideEffectLinkAtBugModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  atId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  atName: PropTypes.string,
  negativeSideEffect: PropTypes.object,
  onLinked: PropTypes.func
};

export default NegativeSideEffectLinkAtBugModal;
