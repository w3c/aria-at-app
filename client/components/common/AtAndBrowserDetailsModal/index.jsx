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
    isAdmin = false,
    atName = '',
    atVersion = '',
    selectedAtVersion = '',
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
    const [updatedAtVersion, setUpdatedAtVersion] = useState(atVersion);
    const [updatedBrowserVersion, setUpdatedBrowserVersion] = useState(
        browserVersion
    );

    const [uaBrowser, setUaBrowser] = useState();
    const [uaMajor, setUaMajor] = useState();
    const [uaMinor, setUaMinor] = useState();
    const [uaPatch, setUaPatch] = useState();

    const [firstDetection, setFirstDetection] = useState(false);
    const [
        forceBrowserVersionUpdateMessage,
        setForceBrowserVersionUpdateMessage
    ] = useState(false);
    const [
        browserVersionMismatchMessage,
        setBrowserVersionMismatchMessage
    ] = useState(false);

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

        if (browserName === uaBrowser && !browserVersion) {
            setFirstDetection(true);
            onBrowserVersionChange(`${uaMajor}.${uaMinor}.${uaPatch}`);
        }

        if (
            uaBrowser === browserName &&
            browserVersion &&
            `${uaMajor}.${uaMinor}.${uaPatch}` !== browserVersion &&
            // needs to check if browser version exists in browserVersions
            browserVersions.includes(`${uaMajor}.${uaMinor}.${uaPatch}`)
        ) {
            setForceBrowserVersionUpdateMessage(true);
            setUpdatedBrowserVersion(`${uaMajor}.${uaMinor}.${uaPatch}`);
        }
    }, []);

    useEffect(() => {
        // check to support Tester Scenario 5
        if (updatedBrowserVersion !== `${uaMajor}.${uaMinor}.${uaPatch}`)
            setBrowserVersionMismatchMessage(true);
        else setBrowserVersionMismatchMessage(false);
    }, [updatedBrowserVersion, uaMajor, uaMinor, uaPatch]);

    const handleAtVersionChange = e => {
        const value = e.target.value;
        setUpdatedAtVersion(value);
    };

    const handleBrowserVersionChange = e => {
        const value = e.target.value;
        setUpdatedBrowserVersion(value);

        // remove message once browser has been changed
        setForceBrowserVersionUpdateMessage(false);
    };

    const onSubmit = () => {
        // todo: Evaluate the use of these methods
        onAtVersionChange();
        onBrowserVersionChange();
        handleAction();
    };

    // All scenarios here are based on https://github.com/w3c/aria-at-app/issues/406
    return (
        <BasicModal
            show={show}
            closeButton={false}
            headerSep={false}
            title="Assistive Technology and Browser Details"
            dialogClassName="modal-60w"
            content={
                <ModalInnerSectionContainer>
                    {/* Admin Scenario 1 */}
                    {isAdmin && (
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
                    )}
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
                        {/* Scenario Tester 6 */}
                        {selectedAtVersion !== atVersion && (
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
                                    have already been submitted for this plan.
                                    However, results you submit during this
                                    session will be recorded with the versions
                                    specified in this form.
                                </span>
                            </Alert>
                        )}
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
                                value={updatedAtVersion}
                                onChange={handleAtVersionChange}
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
                        {/* Tester Scenario 1 */}
                        {firstDetection && (
                            <Alert
                                variant="primary"
                                className="at-browser-details-modal-alert"
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                                <span>
                                    We have automatically detected your version
                                    of {uaBrowser}
                                </span>
                            </Alert>
                        )}
                        {/* Tester Scenario 3 */}
                        {forceBrowserVersionUpdateMessage && (
                            <Alert
                                variant="warning"
                                className="at-browser-details-modal-alert"
                            >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>
                                    We have automatically detected you are using
                                    a different version of <b>{uaBrowser}</b>{' '}
                                    and we have updated it below. The previous
                                    version you were using was{' '}
                                    <b>{browserVersion}</b>.
                                    <br />
                                    <br />
                                    This change doesn&apos;t affect results that
                                    have already been submitted for this plan.
                                    However, results you submit during this
                                    session will be recorded with the versions
                                    specified in this form.
                                </span>
                            </Alert>
                        )}
                        {/* Tester Scenario 4 */}
                        {uaBrowser !== browserName && (
                            <Alert
                                variant="warning"
                                className="at-browser-details-modal-alert"
                            >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>
                                    We have automatically detected you are now
                                    using{' '}
                                    <b>
                                        {uaBrowser} {uaMajor}.{uaMinor}.
                                        {uaPatch}
                                    </b>{' '}
                                    which is a different browser from the last
                                    one you were testing with, which was{' '}
                                    <b>
                                        {browserName} {browserVersion}
                                    </b>
                                    .
                                    <br />
                                    <br />
                                    You can&apos;t edit your Browser type, but
                                    you can continue with{' '}
                                    <b>
                                        {uaBrowser} {uaMajor}.{uaMinor}.
                                        {uaPatch}
                                    </b>
                                    . Keep in mind that your test results will
                                    be recorded as if you were still using{' '}
                                    <b>
                                        {browserName} {browserVersion}
                                    </b>
                                </span>
                            </Alert>
                        )}
                        {/* Tester Scenario 5 */}
                        {browserVersionMismatchMessage && (
                            <Alert
                                variant="warning"
                                className="at-browser-details-modal-alert"
                            >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>
                                    The version of {browserName} you have
                                    selected is different from the one we have
                                    automatically detected, which is{' '}
                                    <b>
                                        {uaMajor}.{uaMinor}.{uaPatch}
                                    </b>
                                    .
                                    <br />
                                    <br />
                                    This change doesn&apos;t affect results that
                                    have already been submitted for this plan.
                                    However, results you submit during this
                                    session will be recorded with the versions
                                    specified in this form.
                                </span>
                            </Alert>
                        )}
                        {/* Tester Scenario 7 */}
                        {uaMajor === 0 && (
                            <Alert
                                variant="warning"
                                className="at-browser-details-modal-alert"
                            >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>
                                    We could not automatically detect what
                                    version of <b>{uaBrowser}</b> you are using.
                                    Before continuing, please provide your
                                    version number.
                                </span>
                            </Alert>
                        )}
                        {/* Admin Scenario 1 */}
                        {isAdmin &&
                            (uaBrowser !== browserName ||
                                `${uaMajor}.${uaMinor}.${uaPatch}` !==
                                    browserVersion) && (
                                <Alert
                                    variant="warning"
                                    className="at-browser-details-modal-alert"
                                >
                                    <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                    />
                                    <span>
                                        We have automatically detected you are
                                        using{' '}
                                        <b>
                                            {uaBrowser} {uaMajor}.{uaMinor}.
                                            {uaPatch}
                                        </b>
                                        . This version is different than what{' '}
                                        <b>{testerName}</b> was using last time,
                                        which was{' '}
                                        <b>
                                            {browserName} {browserVersion}
                                        </b>
                                        .
                                        <br />
                                        <br />
                                        We have not updated this information
                                        below. Please proceed with caution.
                                    </span>
                                </Alert>
                            )}
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
                                disabled={uaMajor === '0'}
                                value={updatedBrowserVersion}
                                onChange={handleBrowserVersionChange}
                            >
                                {(uaMajor === '0'
                                    ? ['Not detected', ...browserVersions]
                                    : browserVersions
                                ).map(item => (
                                    <option
                                        key={`browserVersionKey-${item}`}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        {/* Tester Scenario 7 */}
                        {uaMajor === '0' && (
                            <Form.Group className="at-browser-details-full-column">
                                <Form.Label>Enter Browser Version</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={handleBrowserVersionChange}
                                />
                            </Form.Group>
                        )}
                    </FieldsetRow>
                </ModalInnerSectionContainer>
            }
            actionLabel={'Save and Continue'}
            handleAction={onSubmit}
            handleClose={handleClose}
        />
    );
};

AtAndBrowserDetailsModal.propTypes = {
    show: PropTypes.bool,
    isAdmin: PropTypes.bool,
    atName: PropTypes.string,
    atVersion: PropTypes.string,
    selectedAtVersion: PropTypes.string,
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
