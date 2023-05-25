import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../BasicModal';
import { convertDateToString, isValidDate } from '../../../utils/formatter';

const ModalInnerSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const UpdateVersionModal = ({
    show = false,
    title = null,
    actionType = 'add', // or edit
    versionText = '',
    dateAvailabilityText = '',
    handleAction = () => {},
    handleClose = () => {}
}) => {
    const versionTextRef = useRef();
    const dateAvailabilityTextRef = useRef();

    const [updatedVersionText, setUpdatedVersionText] = useState(versionText);
    const [updatedDateAvailabilityText, setUpdatedDateAvailabilityText] =
        useState(convertDateToString(dateAvailabilityText));
    const [isVersionError, setIsVersionError] = useState(false);
    const [isDateError, setIsDateError] = useState(false);

    useEffect(() => {
        setUpdatedVersionText(versionText);
        setUpdatedDateAvailabilityText(
            convertDateToString(dateAvailabilityText)
        );
    }, [versionText, dateAvailabilityText]);

    const handleVersionTextChange = e => {
        const value = e.target.value;
        setIsVersionError(false);
        setUpdatedVersionText(value);
    };

    const handleDateAvailabilityTextChange = e => {
        const value = e.target.value;
        setIsDateError(false);
        setUpdatedDateAvailabilityText(value);
    };

    const handleDateAvailabilityTextKeyPress = e => {
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
        // Passed action prop should account for actionType, versionText and dateAvailabilityText
        const versionTextError = !updatedVersionText;
        const dateTextError =
            !updatedDateAvailabilityText ||
            updatedDateAvailabilityText.length !== 10 ||
            !isValidDate(updatedDateAvailabilityText);

        if (versionTextError || dateTextError) {
            setIsVersionError(versionTextError);
            versionTextRef.current.focus();

            setIsDateError(dateTextError);
            if (!versionTextError) dateAvailabilityTextRef.current.focus();
            return;
        }

        handleAction(actionType, {
            updatedVersionText,
            updatedDateAvailabilityText
        });
    };

    return (
        <BasicModal
            show={show}
            closeButton={false}
            title={title}
            content={
                <ModalInnerSectionContainer>
                    <Form.Group className="form-group">
                        <Form.Label>Version Number</Form.Label>
                        <Form.Control
                            ref={versionTextRef}
                            type="text"
                            value={updatedVersionText}
                            onChange={handleVersionTextChange}
                            isInvalid={isVersionError}
                            aria-invalid={isVersionError}
                        />
                        {isVersionError && (
                            <Form.Control.Feedback
                                style={{ display: 'block' }}
                                type="invalid"
                            >
                                Please enter a valid version number.
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>

                    <Form.Group className="form-group">
                        <Form.Label>
                            Approximate date of availability
                        </Form.Label>
                        <Form.Control
                            ref={dateAvailabilityTextRef}
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={updatedDateAvailabilityText}
                            onChange={handleDateAvailabilityTextChange}
                            onKeyPress={handleDateAvailabilityTextKeyPress}
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
                </ModalInnerSectionContainer>
            }
            actionLabel={actionType === 'add' ? 'Add Version' : 'Save'}
            handleAction={onSubmit}
            handleClose={handleClose}
        />
    );
};

UpdateVersionModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.node.isRequired,
    actionType: PropTypes.string,
    versionText: PropTypes.string,
    dateAvailabilityText: PropTypes.string,
    onVersionChange: PropTypes.func,
    onDateAvailabilityChange: PropTypes.func,
    handleAction: PropTypes.func,
    handleClose: PropTypes.func
};

export default UpdateVersionModal;
