import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import ReviewConflicts from '../../ReviewConflicts';
import {
  TestPlanReportPropType,
  TestPlanVersionPropType,
  TestPropType
} from '../../common/proptypes';
import commonStyles from '../../common/styles.module.css';

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
      dialogClassName="modal-60w"
      aria-modal="true"
      aria-labelledby="review-conflicts-modal"
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title as="h2" className={commonStyles.noMargin}>
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
  testPlanVersion: TestPlanVersionPropType.isRequired,
  testPlanReport: TestPlanReportPropType.isRequired,
  test: TestPropType.isRequired,
  handleClose: PropTypes.func,
  conflictMarkdown: PropTypes.string,
  issueLink: PropTypes.string.isRequired
};

export default ReviewConflictsModal;
