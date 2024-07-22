import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useDetectUa } from '../../../hooks/useDetectUa';
import BasicModal from '../BasicModal';

const ModalInnerSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldsetRow = styled.fieldset`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;

  legend {
    float: inherit;
  }
`;

const ModalSubtitleStyle = styled.h2`
  font-size: 0.8em;
  margin: 0;
  padding: 0;
`;

const Required = styled.span`
  color: #ce1b4c;

  :after {
    content: '*';
  }
`;

const AtAndBrowserDetailsModal = ({
  show = false,
  isAdmin = false,
  firstLoad = true,
  atName = '',
  atVersion = '',
  atVersions = [],
  browserName = '',
  browserVersion = '',
  patternName = '', // admin related prop
  testerName = '', // admin related prop
  exactAtVersion = null,
  handleAction = () => {},
  handleClose = () => {}
}) => {
  // Only take into account the major version
  // of the provided browser version
  if (browserVersion.includes('.')) {
    browserVersion = browserVersion.split('.')[0];
  }
  // Detect UA information
  const { uaBrowser, uaMajor, uaMinor, uaPatch } = useDetectUa();

  const navigate = useNavigate();

  const updatedAtVersionDropdownRef = useRef();
  const updatedBrowserVersionTextRef = useRef();

  const [showExitModal, setShowExitModal] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [updatedAtVersion, setUpdatedAtVersion] = useState(
    exactAtVersion ? exactAtVersion.name : 'Select a Version'
  );
  const [updatedBrowserVersion, setUpdatedBrowserVersion] = useState('');

  const [isAtVersionError, setIsAtVersionError] = useState(false);
  const [isBrowserVersionError, setIsBrowserVersionError] = useState(false);

  const [
    forceBrowserVersionUpdateMessage,
    setForceBrowserVersionUpdateMessage
  ] = useState(false);
  const [browserVersionMismatchMessage, setBrowserVersionMismatchMessage] =
    useState(false);

  useEffect(() => {
    setIsFirstLoad(firstLoad);
    if (!firstLoad) {
      setUpdatedAtVersion(atVersion);
      setUpdatedBrowserVersion(browserVersion);
    }
    if (uaMajor === '0') {
      setUpdatedBrowserVersion('');
      updatedBrowserVersionTextRef.current.focus();
    }

    const foundBrowserVersion =
      uaBrowser === browserName && uaMajor !== '0' && uaMajor;

    if (
      // don't force browserVersion update with admin (unless first run)
      (!isAdmin || (isAdmin && firstLoad)) &&
      // check that saved browserVersion is the same as detected
      !browserVersion.includes(uaMajor) &&
      uaBrowser === browserName &&
      foundBrowserVersion
    ) {
      setForceBrowserVersionUpdateMessage(true);
      setUpdatedBrowserVersion(foundBrowserVersion);
    }
  }, [uaBrowser, uaMajor, uaMinor, uaPatch]);

  useEffect(() => {
    // check to support Tester Scenario 5
    if (uaMajor !== '0' && !updatedBrowserVersion.includes(`${uaMajor}`))
      setBrowserVersionMismatchMessage(true);
    else setBrowserVersionMismatchMessage(!isAdmin && false);
  }, [updatedBrowserVersion, uaMajor, uaMinor, uaPatch]);

  useEffect(() => {
    const forceFocusOnBrowserVersion =
      !isFirstLoad && !isAdmin && forceBrowserVersionUpdateMessage;

    if (forceFocusOnBrowserVersion)
      updatedBrowserVersionTextRef.current.focus();
  }, [forceBrowserVersionUpdateMessage]);

  const handleAtVersionChange = e => {
    const value = e.target.value;
    setUpdatedAtVersion(value);
    setIsAtVersionError(false);
  };

  const handleBrowserVersionChange = e => {
    const value = e.target.value;

    setUpdatedBrowserVersion(value);

    // remove message once browser has been changed
    !isAdmin && setForceBrowserVersionUpdateMessage(false);
    setIsBrowserVersionError(false);
  };

  const onSubmit = () => {
    // Passed action prop should account for AtVersion & BrowserVersion
    const updatedAtVersionError = updatedAtVersion === 'Select a Version';
    const isBrowserVersionTextError = !updatedBrowserVersion;

    if (updatedAtVersionError || isBrowserVersionTextError) {
      setIsAtVersionError(updatedAtVersionError);
      updatedAtVersionDropdownRef.current.focus();

      setIsBrowserVersionError(isBrowserVersionTextError);
      if (!updatedAtVersionError) updatedBrowserVersionTextRef.current.focus();
      return;
    }

    let updateMessage = null;
    if (isFirstLoad)
      updateMessage =
        'Your AT and Browser versions have been successfully saved.';
    else {
      if (
        updatedAtVersion !== atVersion &&
        updatedBrowserVersion !== browserVersion
      )
        updateMessage = (
          <>
            Your version of <b>{atName}</b> has been updated to{' '}
            <b>{updatedAtVersion}</b>. Your previous version was{' '}
            <b>{atVersion}</b>.
            <br />
            Your version of <b>{browserName}</b> has been updated to{' '}
            <b>{updatedBrowserVersion}</b>. Your previous version was{' '}
            <b>{browserVersion}</b>.
          </>
        );
      else if (updatedAtVersion !== atVersion)
        updateMessage = (
          <>
            Your version of <b>{atName}</b> has been updated to{' '}
            <b>{updatedAtVersion}</b>. Your previous version was{' '}
            <b>{atVersion}</b>.
          </>
        );
      else if (updatedBrowserVersion !== browserVersion)
        updateMessage = (
          <>
            Your version of <b>{browserName}</b> has been updated to{' '}
            <b>{updatedBrowserVersion}</b>. Your previous version was{' '}
            <b>{browserVersion}</b>.
          </>
        );
    }

    // Save full version even though we don't display it.
    // Discard trailing zeros in found minor and patches.
    // This also accounts for trailing numbers after the patch.
    let fullVersion = '';
    let [majorVersion, minorVersion = '0', patchVersion = '0', ...rest] =
      updatedBrowserVersion.split('.');

    if (minorVersion === '0' && patchVersion === '0') {
      fullVersion = `${majorVersion}`;
    } else if (patchVersion === '0') {
      fullVersion = `${majorVersion}.${minorVersion}`;
    } else if (rest === undefined || rest.length === 0) {
      fullVersion = `${majorVersion}.${minorVersion}.${patchVersion}`;
    } else {
      fullVersion = `${majorVersion}.${minorVersion}.${patchVersion}.${rest.join(
        '.'
      )}`;
    }

    handleAction(updatedAtVersion, fullVersion, updateMessage);
  };

  const handleHide = () => setShowExitModal(true);

  // All scenarios here are based on
  // https://github.com/w3c/aria-at-app/issues/406 &
  // https://github.com/w3c/aria-at-app/issues/436
  return (
    <>
      <BasicModal
        show={showExitModal}
        closeButton={false}
        title="Are you sure you want to exit?"
        content={
          <>
            You will be taken back to the <b>Test Queue</b>. Any changes you
            made to your Assistive Technology and Browser versions will not be
            saved.
          </>
        }
        actions={[
          {
            label: 'Ok',
            onClick: () => navigate('/test-queue')
          }
        ]}
        closeLabel="Cancel"
        handleClose={() => setShowExitModal(false)}
        staticBackdrop={true}
      />

      {!showExitModal && (
        <BasicModal
          show={show}
          closeButton={true}
          cancelButton={
            updatedAtVersion !== atVersion ||
            updatedBrowserVersion !== browserVersion
          }
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
                    <b>{testerName}</b>. Your Assistive Technology and Browser
                    might be different. Please proceed with caution.
                  </span>
                </Alert>
              )}
              Your Assistive Technology and Browser Details are the following.
              Please make sure this information is still accurate.
              <br />
              <br />
              <FieldsetRow>
                <legend>
                  <ModalSubtitleStyle>
                    Assistive Technology Details
                  </ModalSubtitleStyle>
                </legend>
                {/* Tester Scenario 6 */}
                {!isFirstLoad && updatedAtVersion !== atVersion && (
                  <Alert
                    variant="warning"
                    className="at-browser-details-modal-alert"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>
                      You have selected <b>{updatedAtVersion}</b> for{' '}
                      <b>{atName}</b>. This version is different from the one
                      previously selected which was <b>{atVersion}</b>.
                      <br />
                      <br />
                      This change doesn&apos;t affect results that have already
                      been submitted for this plan. However, results you submit
                      during this session will be recorded with the versions
                      specified in this form.
                    </span>
                  </Alert>
                )}
                {exactAtVersion ? (
                  <Alert
                    variant="warning"
                    className="at-browser-details-modal-alert"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>
                      Results collected for this test plan require{' '}
                      <b>
                        {atName} {updatedAtVersion}
                      </b>
                      . By continuing, you confirm that your results are being
                      recorded using the specified version of the Assistive
                      Technology.
                    </span>
                  </Alert>
                ) : null}
                <Form.Group className="form-group">
                  <Form.Label>Assistive Technology Name</Form.Label>
                  <Form.Control disabled type="text" value={atName} />
                </Form.Group>
                <Form.Group className="form-group">
                  {exactAtVersion ? (
                    <>
                      <Form.Label>Assistive Technology Version</Form.Label>
                      <Form.Control
                        disabled
                        type="text"
                        value={exactAtVersion.name}
                      />
                    </>
                  ) : (
                    <>
                      <Form.Label>
                        Assistive Technology Version
                        <Required aria-hidden />
                      </Form.Label>
                      <Form.Select
                        ref={updatedAtVersionDropdownRef}
                        value={updatedAtVersion}
                        onChange={handleAtVersionChange}
                        isInvalid={isAtVersionError}
                        required
                      >
                        {['Select a Version', ...atVersions].map(item => (
                          <option
                            key={`atVersionKey-${item}`}
                            value={item}
                            disabled={item === 'Select a Version'}
                          >
                            {item}
                          </option>
                        ))}
                      </Form.Select>
                      {isAtVersionError && (
                        <Form.Control.Feedback
                          style={{ display: 'block' }}
                          type="invalid"
                        >
                          Please select an Assistive Technology Version.
                        </Form.Control.Feedback>
                      )}
                    </>
                  )}
                </Form.Group>
              </FieldsetRow>
              <FieldsetRow>
                <legend>
                  <ModalSubtitleStyle>Browser Details</ModalSubtitleStyle>
                </legend>
                {/* Tester Scenario 1 */}
                {isFirstLoad && uaBrowser && uaMajor !== '0' && (
                  <Alert
                    variant="primary"
                    className="at-browser-details-modal-alert"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>
                      We have automatically detected your version of {uaBrowser}
                    </span>
                  </Alert>
                )}
                {/* Tester Scenario 3 */}
                {!isFirstLoad &&
                  !isAdmin &&
                  forceBrowserVersionUpdateMessage && (
                    <Alert
                      variant="warning"
                      className="at-browser-details-modal-alert"
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>
                        We have automatically detected you are using a different
                        version of <b>{uaBrowser}</b> and we have updated it
                        below. The previous version you were using was{' '}
                        <b>{browserVersion}</b>.
                        <br />
                        <br />
                        This change doesn&apos;t affect results that have
                        already been submitted for this plan. However, results
                        you submit during this session will be recorded with the
                        versions specified in this form.
                      </span>
                    </Alert>
                  )}
                {isFirstLoad &&
                  uaBrowser !== browserName &&
                  uaMajor !== '0' && (
                    <Alert
                      variant="warning"
                      className="at-browser-details-modal-alert"
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>
                        We have automatically detected you are using{' '}
                        <b>
                          {uaBrowser} {uaMajor}
                        </b>
                        . This test plan requires <b>{browserName}</b>. If you
                        are recording results on behalf of someone else, please
                        provide the Browser version below.
                      </span>
                    </Alert>
                  )}
                {/* Tester Scenario 4 */}
                {!isAdmin &&
                  !isFirstLoad &&
                  uaBrowser !== browserName &&
                  uaMajor !== '0' && (
                    <Alert
                      variant="warning"
                      className="at-browser-details-modal-alert"
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>
                        We have automatically detected you are now using{' '}
                        <b>
                          {uaBrowser} {uaMajor}
                        </b>
                        , which is a different browser from the last one you
                        were testing with, which was{' '}
                        <b>
                          {browserName} {browserVersion}
                        </b>
                        .
                        <br />
                        <br />
                        You can&apos;t edit your Browser type, but you can
                        continue with{' '}
                        <b>
                          {uaBrowser} {uaMajor}
                        </b>
                        . Keep in mind that your test results will be recorded
                        as if you were still using{' '}
                        <b>
                          {browserName} {browserVersion}
                        </b>
                        .
                      </span>
                    </Alert>
                  )}
                {/* Tester Scenario 5 */}
                {!isAdmin &&
                  uaBrowser === browserName &&
                  browserVersionMismatchMessage && (
                    <Alert
                      variant="warning"
                      className="at-browser-details-modal-alert"
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>
                        The version of {browserName} you have set is different
                        from the one we have automatically detected, which is{' '}
                        <b>{uaMajor}</b>
                        .
                        <br />
                        <br />
                        This change doesn&apos;t affect results that have
                        already been submitted for this plan. However, results
                        you submit during this session will be recorded with the
                        versions specified in this form.
                      </span>
                    </Alert>
                  )}
                {/* Tester Scenario 7 */}
                {uaMajor === '0' && (
                  <Alert
                    variant="warning"
                    className="at-browser-details-modal-alert"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>
                      We could not automatically detect what version of{' '}
                      <b>{browserName}</b> you are using. Before continuing,
                      please provide your version number.
                    </span>
                  </Alert>
                )}
                {/* Admin Scenario 1 */}
                {isAdmin &&
                  (uaBrowser !== browserName ||
                    browserVersionMismatchMessage) && (
                    <Alert
                      variant="warning"
                      className="at-browser-details-modal-alert"
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      <span>
                        We have automatically detected you are using{' '}
                        <b>
                          {uaBrowser} {uaMajor}
                        </b>
                        . This version is different than what{' '}
                        <b>{testerName}</b> was using last time, which was{' '}
                        <b>
                          {browserName} {browserVersion}
                        </b>
                        .
                        <br />
                        <br />
                        We have not updated this information below. Please
                        proceed with caution.
                      </span>
                    </Alert>
                  )}
                <Form.Group className="form-group">
                  <Form.Label>Browser Name</Form.Label>
                  <Form.Control disabled type="text" value={browserName} />
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>
                    Browser Version
                    <Required aria-hidden />
                  </Form.Label>
                  <Form.Control
                    ref={updatedBrowserVersionTextRef}
                    type="text"
                    value={updatedBrowserVersion}
                    onChange={handleBrowserVersionChange}
                    isInvalid={isBrowserVersionError}
                    required
                  />
                  {isBrowserVersionError && (
                    <Form.Control.Feedback
                      style={{ display: 'block' }}
                      type="invalid"
                    >
                      Please enter a valid Browser Version.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </FieldsetRow>
            </ModalInnerSectionContainer>
          }
          actions={[
            {
              label:
                updatedAtVersion !== atVersion ||
                updatedBrowserVersion !== browserVersion
                  ? 'Save and Continue'
                  : 'Continue',
              onClick:
                updatedAtVersion !== atVersion ||
                updatedBrowserVersion !== browserVersion
                  ? onSubmit
                  : handleClose
            }
          ]}
          handleClose={!isFirstLoad ? handleClose : null}
          handleHide={handleHide}
          staticBackdrop={true}
          useOnHide={true}
        />
      )}
    </>
  );
};

AtAndBrowserDetailsModal.propTypes = {
  show: PropTypes.bool,
  isAdmin: PropTypes.bool,
  firstLoad: PropTypes.bool,
  atName: PropTypes.string,
  atVersion: PropTypes.string,
  atVersions: PropTypes.arrayOf(PropTypes.string),
  browserName: PropTypes.string,
  browserVersion: PropTypes.string,
  browserVersions: PropTypes.arrayOf(PropTypes.string),
  patternName: PropTypes.string,
  testerName: PropTypes.string,
  exactAtVersion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  handleClose: PropTypes.func,
  handleAction: PropTypes.func
};

export default AtAndBrowserDetailsModal;
