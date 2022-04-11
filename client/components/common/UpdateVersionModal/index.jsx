import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../BasicModal';

const ModalInnerSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const UpdateVersionModal = ({
    show = false,
    title = '',
    updateType = 'add', // or edit
    versionValue = '',
    dateAvailabilityValue = '',
    onVersionChange = null,
    onDateAvailabilityChange = null,
    handleAction = null,
    handleClose = null
}) => {
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
                            value={versionValue}
                            onChange={onVersionChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            Approximate date of availability
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={dateAvailabilityValue}
                            onChange={onDateAvailabilityChange}
                        />
                    </Form.Group>
                </ModalInnerSectionContainer>
            }
            actionLabel={updateType === 'add' ? 'Add Version' : 'Save'}
            handleAction={handleAction}
            handleClose={handleClose}
        />
    );
};

UpdateVersionModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.node.isRequired,
    updateType: PropTypes.string,
    versionValue: PropTypes.string,
    dateAvailabilityValue: PropTypes.string,
    onVersionChange: PropTypes.func,
    onDateAvailabilityChange: PropTypes.func,
    handleAction: PropTypes.func,
    handleClose: PropTypes.func
};

export default UpdateVersionModal;
