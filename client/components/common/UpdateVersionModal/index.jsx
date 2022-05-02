import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../BasicModal';
import { getCurrentDateAsString } from '../../../utils/formatter';

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
    ] = useState(getCurrentDateAsString(dateAvailabilityText));

    useEffect(() => {
        setUpdatedVersionText(versionText);
        setUpdatedDateAvailabilityText(
            getCurrentDateAsString(dateAvailabilityText)
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
        let input = e.target;
        if ((e.charCode < 48 && e.charCode !== 45) || e.charCode > 57) {
            // accept only '-1234567890'
            e.preventDefault();
        }

        let inputLength = input.value.length;
        if (inputLength !== 1 || inputLength !== 3) {
            if (e.charCode === 45) e.preventDefault();
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
