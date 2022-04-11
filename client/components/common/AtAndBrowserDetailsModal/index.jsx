import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import uaParser from 'ua-parser-js';
import { Form, Alert } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faInfoCircle,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import BasicModal from '../BasicModal';

const ModalInnerSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const FieldsetRow = styled.fieldset`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
`;

const ModalSubtitleStyle = styled.h2`
    font-size: 0.8em;
    margin: 0;
    padding: 0;
`;

const AtAndBrowserDetailsModal = ({
    show = false,
    atName = '',
    atVersion = '',
    atVersions = [],
    onAtVersionChange = () => {},
    browserName = '',
    browserVersion = '',
    browserVersions = [],
    onBrowserVersionChange = () => {},
    patternName = '',
    testerName = '',
    handleAction = null,
    handleClose = null
}) => {
    const [uaBrowser, setUaBrowser] = useState();
    const [uaMajor, setUaMajor] = useState();
    const [uaMinor, setUaMinor] = useState();
    const [uaPatch, setUaPatch] = useState();

    useEffect(() => {
        // Detect UA information
        const ua = uaParser();
        const uaBrowser = ua?.browser?.name || 'Unknown';
        const uaMajor = ua?.browser?.major || '0';
        const uaMinor = ua?.browser?.version?.split('.')?.[1] || '0';
        const uaPatch = ua?.browser?.version?.split('.')?.[2] || '0';

        setUaBrowser(uaBrowser);
        setUaMajor(uaMajor);
        setUaMinor(uaMinor);
        setUaPatch(uaPatch);
    }, []);

    return (
        <BasicModal
            show={show}
            closeButton={false}
            headerSep={false}
            title="Assistive Technology and Browser Details"
            dialogClassName="modal-60w"
            content={
                <ModalInnerSectionContainer>
                    Your Assistive Technology and Browser Details are the
                    following. Please make sure this information is still
                    accurate.
                    <br />
                    <br />
                    <FieldsetRow>
                        <legend>
                            <ModalSubtitleStyle>
                                Assistive Technology Details
                            </ModalSubtitleStyle>
                        </legend>
                        <Alert
                            variant="warning"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>
                                The version of {atName} you have selected is
                                different from the one previously selected,
                                which was <b>{atVersion}</b>.
                                <br />
                                <br />
                                This change doesn&apos;t affect results that
                                have already submitted for this plan. However
                                results you submit during this session will be
                                recorded with the versions specified in this
                                form.
                            </span>
                        </Alert>
                        <Alert
                            variant="warning"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>
                                You are about to review <b>{patternName}</b> as{' '}
                                <b>{testerName}</b>. Your Assistive Technology
                                and Browser might be different. Please proceed
                                with caution.
                            </span>
                        </Alert>
                        <Form.Group>
                            <Form.Label>Assistive Technology Name</Form.Label>
                            <Form.Control disabled type="text" value={atName} />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>
                                Assistive Technology Version
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={atVersion}
                                onChange={onAtVersionChange}
                            >
                                {atVersions.map(item => (
                                    <option
                                        key={`atVersionKey-${item}`}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </FieldsetRow>
                    <FieldsetRow>
                        <legend>
                            <ModalSubtitleStyle>
                                Browser Details
                            </ModalSubtitleStyle>
                        </legend>
                        <Alert
                            variant="primary"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faInfoCircle} />
                            <span>
                                We have automatically detected your version of{' '}
                                {uaBrowser}
                            </span>
                        </Alert>
                        <Alert
                            variant="warning"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>
                                We have automatically detected you are using a
                                different version of <b>{uaBrowser}</b> and we
                                have updated it below. The previous version you
                                were using was <b>{atVersion}</b>.
                                <br />
                                <br />
                                This change doesn&apos;t affect results that
                                have already been submitted for this plan.
                                However, results you submit during this session
                                will be recorded with the versions specified in
                                this form.
                            </span>
                        </Alert>
                        <Alert
                            variant="warning"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>
                                We have automatically detected you are now using{' '}
                                <b>
                                    {uaBrowser} {uaMajor}.{uaMinor}.{uaPatch}
                                </b>{' '}
                                which is a different browser from the last one
                                you were testing with, which was{' '}
                                <b>
                                    {browserName} {browserVersion}
                                </b>
                                .
                                <br />
                                <br />
                                You can&apos;t edit your Browser type, but can
                                continue with{' '}
                                <b>
                                    {uaBrowser} {uaMajor}.{uaMinor}.{uaPatch}
                                </b>
                                . Keep in mind that your test results will be
                                recorded as if you were still using{' '}
                                <b>
                                    {browserName} {browserVersion}
                                </b>
                            </span>
                        </Alert>
                        <Alert
                            variant="warning"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>
                                We could not automatically detect what version
                                of <b>{uaBrowser}</b> you are using. Before
                                continuing, please provide your version number.
                            </span>
                        </Alert>
                        <Alert
                            variant="warning"
                            className="at-browser-details-modal-alert"
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>
                                We have automatically detected you are using{' '}
                                <b>
                                    {uaBrowser} {uaMajor}.{uaMinor}.{uaPatch}
                                </b>
                                . This version is different than what{' '}
                                <b>{testerName}</b> was using last time, which
                                was{' '}
                                <b>
                                    {browserName} {browserVersion}
                                </b>
                                .
                                <br />
                                <br />
                                We have not updated this information below.
                                Please proceed with caution.
                            </span>
                        </Alert>
                        <Form.Group>
                            <Form.Label>Browser Name</Form.Label>
                            <Form.Control
                                disabled
                                type="text"
                                value={browserName}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Browser Version</Form.Label>
                            <Form.Control
                                as="select"
                                value={browserVersion}
                                onChange={onBrowserVersionChange}
                            >
                                {browserVersions.map(item => (
                                    <option
                                        key={`browserVersionKey-${item}`}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group className="at-browser-details-full-column">
                            <Form.Label>Enter Browser Version</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={onBrowserVersionChange}
                            />
                        </Form.Group>
                    </FieldsetRow>
                </ModalInnerSectionContainer>
            }
            actionLabel={'Save and Continue'}
            handleAction={handleAction}
            handleClose={handleClose}
        />
    );
};

AtAndBrowserDetailsModal.propTypes = {
    show: PropTypes.bool,
    atName: PropTypes.string,
    atVersion: PropTypes.string,
    atVersions: PropTypes.arrayOf(PropTypes.string),
    onAtVersionChange: PropTypes.func,
    browserName: PropTypes.string,
    browserVersion: PropTypes.string,
    browserVersions: PropTypes.arrayOf(PropTypes.string),
    onBrowserVersionChange: PropTypes.func,
    patternName: PropTypes.string,
    testerName: PropTypes.string,
    handleClose: PropTypes.func,
    handleAction: PropTypes.func
};

export default AtAndBrowserDetailsModal;
