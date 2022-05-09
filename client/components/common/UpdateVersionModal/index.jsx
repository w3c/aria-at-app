import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../BasicModal';
import { convertDateToString } from '../../../utils/formatter';

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
    const [updatedVersionText, setUpdatedVersionText] = useState(versionText);
    const [
        updatedDateAvailabilityText,
        setUpdatedDateAvailabilityText
    ] = useState(convertDateToString(dateAvailabilityText));

    useEffect(() => {
        setUpdatedVersionText(versionText);
        setUpdatedDateAvailabilityText(
            convertDateToString(dateAvailabilityText)
        );
    }, [versionText, dateAvailabilityText]);

    const handleVersionTextChange = e => {
        const value = e.target.value;
        setUpdatedVersionText(value);
    };

    const handleDateAvailabilityTextChange = e => {
        const value = e.target.value;
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
                    <Form.Group>
                        <Form.Label>Version Number</Form.Label>
                        <Form.Control
                            type="text"
                            value={updatedVersionText}
                            onChange={handleVersionTextChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            Approximate date of availability
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={updatedDateAvailabilityText}
                            onChange={handleDateAvailabilityTextChange}
                            onKeyPress={handleDateAvailabilityTextKeyPress}
                            maxLength={10}
                        />
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
