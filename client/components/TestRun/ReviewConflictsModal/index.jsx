import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import styled from '@emotion/styled';
import ReviewConflicts from '../../ReviewConflicts';

const H2 = styled.h2`
  margin-top: 0;
`;

const ReviewConflictsModal = ({
  testPlanReport,
  test,
  issueLink,
  conflictMarkdown,
  show = false,
  handleClose = () => {}
}) => {
  return (
    <Modal
      show={show}
      role="dialog"
      tabIndex={-1}
      keyboard
      scrollable
      dialogClassName="modal-xl"
      aria-modal="true"
      aria-labelledby="review-conflicts-modal"
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title as={H2} id="review-conflicts-modal-title">
          Review Conflicts for &quot;{test.title}&quot;
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ReviewConflicts
          hideHeadline
          testPlanReport={testPlanReport}
          test={test}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(conflictMarkdown)}
        >
          Copy Conflicts to Clipboard
        </Button>
        <Button variant="secondary" target="_blank" href={issueLink}>
          Raise an Issue for Conflict
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ReviewConflictsModal.propTypes = {
  show: PropTypes.bool,
  testPlanVersion: PropTypes.object.isRequired,
  testPlanReport: PropTypes.object.isRequired,
  test: PropTypes.object.isRequired,
  handleClose: PropTypes.func,
  conflictMarkdown: PropTypes.string,
  issueLink: PropTypes.string.isRequired
};

export default ReviewConflictsModal;
