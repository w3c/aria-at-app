import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { dates } from 'shared';
import BasicModal from '../BasicModal';
import commonStyles from '../../styles.module.css';

const UpdateTargetDateModal = ({
  show = false,
  title = null,
  dateText = '',
  handleAction = () => {},
  handleClose = () => {}
}) => {
  const dateTextRef = useRef();

  const [updatedDateText, setUpdatedDateText] = useState(
    dates.convertDateToString(dateText)
  );
  const [isDateError, setIsDateError] = useState(false);

  useEffect(() => {
    setUpdatedDateText(dates.convertDateToString(dateText));
  }, [dateText]);

  const handleDateTextChange = e => {
    const value = e.target.value;
    setIsDateError(false);
    setUpdatedDateText(value);
  };

  const handleDateTextKeyPress = e => {
    /**
     * Only accept the following ASCII characters:
     * 45: -
     * 48: 0
     * 49: 1
     * 50: 2
     * 51: 3
     * 52: 4
     * 53: 5
     * 54: 6
     * 55: 7
     * 56: 8
     * 57: 9
     */
    const HYPHEN = 45;
    const DIGIT_ZERO = 48;
    const DIGIT_NINE = 57;
    if (
      (e.charCode < DIGIT_ZERO && e.charCode !== HYPHEN) ||
      e.charCode > DIGIT_NINE
    ) {
      e.preventDefault();
    }

    let input = e.target;
    let inputLength = input.value.length;
    if (inputLength !== 1 || inputLength !== 3) {
      if (e.charCode === HYPHEN) e.preventDefault();
    }
    if (inputLength === 2) input.value += '-';
    if (inputLength === 5) input.value += '-';
  };

  const onSubmit = () => {
    // Passed handleAction prop should account for dateText
    const dateTextError =
      !updatedDateText ||
      updatedDateText.length !== 10 ||
      !dates.isValidDate(updatedDateText);

    if (dateTextError) {
      setIsDateError(dateTextError);
      dateTextRef.current.focus();
      return;
    }

    handleAction({ updatedDateText });
  };

  return (
    <BasicModal
      show={show}
      closeButton={false}
      title={title}
      content={
        <div className={commonStyles.modalInnerSectionContainer}>
          <Form.Group className={commonStyles.formGroup}>
            <Form.Label htmlFor="target-date-input">Target Date</Form.Label>
            <Form.Control
              id="target-date-input"
              ref={dateTextRef}
              type="text"
              placeholder="DD-MM-YYYY"
              value={updatedDateText}
              onChange={handleDateTextChange}
              onKeyPress={handleDateTextKeyPress}
              maxLength={10}
              isInvalid={isDateError}
              aria-invalid={isDateError}
            />
            {isDateError && (
              <Form.Control.Feedback
                style={{ display: 'block' }}
                type="invalid"
              >
                Please enter a valid date.
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </div>
      }
      actions={[
        {
          label: 'Save',
          onClick: onSubmit
        }
      ]}
      handleClose={handleClose}
      useOnHide={true}
      handleHide={handleClose}
      initialFocusRef={dateTextRef}
    />
  );
};

UpdateTargetDateModal.propTypes = {
  show: PropTypes.bool,
  title: PropTypes.node.isRequired,
  dateText: PropTypes.string,
  handleAction: PropTypes.func,
  handleClose: PropTypes.func
};

export default UpdateTargetDateModal;
