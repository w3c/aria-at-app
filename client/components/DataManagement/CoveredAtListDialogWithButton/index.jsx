import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import BasicModal from '../../common/BasicModal';
import { NoneText } from '../DataManagementRow';

const CoveredAtListDialogWithButton = ({ ats }) => {
    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const [uniqueAtVersions, setUniqueAtVersions] = useState([]);

    useEffect(() => {
        const _uniqueAtVersions = [];
        ats.forEach(at => {
            at.atVersions.forEach(version => {
                _uniqueAtVersions.push({
                    name: at.name,
                    version: version.name
                });
            });
        });
        setUniqueAtVersions(_uniqueAtVersions);
    }, [ats]);

    const renderButtonLabel = () => {
        return (
            <span>
                <strong>{uniqueAtVersions.length} Desktop</strong> Screenreaders
            </span>
        );
    };

    const renderDialogContent = () => {
        return (
            <ul>
                {uniqueAtVersions.map(at => (
                    <li key={`${at.name}-${at.version}`}>
                        <strong>{at.name}</strong> {at.version}
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
    ats: PropTypes.arrayOf(PropTypes.shape({})).isRequired
};

export default CoveredAtListDialogWithButton;
