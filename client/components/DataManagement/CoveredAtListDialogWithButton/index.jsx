import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import BasicModal from '../../common/BasicModal';
import { NoneText } from '../DataManagementRow';

const CoveredAtListDialogWithButton = ({ ats }) => {
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const renderButtonLabel = () => {
        return (
            <span>
                <strong>{ats.length} Desktop</strong> Screenreaders
            </span>
        );
    };

    const renderDialogContent = () => {
        return (
            <ul>
                {ats.map(at => (
                    <li key={`${at.name}`}>
                        <strong>{at.name}</strong>
                    </li>
                ))}
            </ul>
        );
    };

    if (!ats || ats.length === 0) {
        return <NoneText>N/A</NoneText>;
    }

    return (
        <>
            <Button variant="secondary" onClick={handleShow}>
                {renderButtonLabel()}
            </Button>
            <BasicModal
                title="Covered AT"
                show={show}
                closeButton={true}
                cancelButton={false}
                handleClose={handleClose}
                content={renderDialogContent()}
            />
        </>
    );
};

CoveredAtListDialogWithButton.propTypes = {
    ats: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            atVersions: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired
                })
            ).isRequired
        })
    ).isRequired
};

export default CoveredAtListDialogWithButton;
