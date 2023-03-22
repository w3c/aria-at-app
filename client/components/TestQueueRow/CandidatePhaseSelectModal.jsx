import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import BasicModal from '../common/BasicModal';
import { convertDateToString } from '../../utils/formatter';
import FormCheck from 'react-bootstrap/FormCheck';

const ModalInnerSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const CandidatePhaseSelectModal = ({
    show = false,
    title = null,
    dates = [],
    handleAction = () => {},
    handleClose = () => {}
}) => {
    const [selectedDateIndex, setSelectedDateIndex] = useState('0');

    const handleChange = e => {
        const { value } = e.target;
        setSelectedDateIndex(value);
    };

    const onSubmit = () => {
        if (selectedDateIndex == -1) handleAction(null);
        const date = dates[selectedDateIndex];
        handleAction(date);
    };

    return (
        <BasicModal
            show={show}
            closeButton={false}
            title={title}
            content={
                <ModalInnerSectionContainer>
                    <Form.Group>
                        {dates.map((d, index) => {
                            return (
                                <FormCheck
                                    key={`CandidatePhaseSelection_${index}`}
                                >
                                    <FormCheck.Input
                                        id={`${index}`}
                                        type="radio"
                                        value={index}
                                        onChange={handleChange}
                                        checked={selectedDateIndex == index}
                                    />
                                    <FormCheck.Label htmlFor={`${index}`}>
                                        Candidate Phase Start Date on{' '}
                                        <b>
                                            {convertDateToString(
                                                d.candidateStatusReachedAt,
                                                'MMMM D, YYYY'
                                            )}
                                        </b>{' '}
                                        and Recommended Phase Target Completion
                                        Date on{' '}
                                        <b>
                                            {convertDateToString(
                                                d.recommendedStatusTargetDate,
                                                'MMMM D, YYYY'
                                            )}
                                        </b>
                                    </FormCheck.Label>
                                </FormCheck>
                            );
                        })}
                        <FormCheck key={'CandidatePhaseSelection_-1'}>
                            <FormCheck.Input
                                id="-1"
                                type="radio"
                                value={-1}
                                onChange={handleChange}
                                checked={selectedDateIndex == -1}
                            />
                            <FormCheck.Label htmlFor="-1">
                                <b>Create new Candidate Phase starting today</b>
                            </FormCheck.Label>
                        </FormCheck>
                    </Form.Group>
                </ModalInnerSectionContainer>
            }
            actionLabel={'Select Candidate Phase'}
            handleAction={onSubmit}
            handleClose={handleClose}
        />
    );
};

CandidatePhaseSelectModal.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.node.isRequired,
    dates: PropTypes.array,
    handleAction: PropTypes.func,
    handleClose: PropTypes.func
};

export default CandidatePhaseSelectModal;
