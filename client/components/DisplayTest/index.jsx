import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './DisplayTest.css';
import { withRouter } from 'react-router-dom';
import nextId from 'react-id-generator';
import { Button, ButtonToolbar, Col, Modal, Row } from 'react-bootstrap';
import RaiseIssueModal from '@components/RaiseIssueModal';
import ReviewConflictsModal from '@components/ReviewConflictsModal';
import StatusBar from '@components/StatusBar';
import TestResult from '@components/TestResult';
import TestIframe from '@components/TestIframe';

class DisplayTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showRaiseIssueModal: false,
            showConfirmModal: false,
            showConflictsModal: false
        };
        this.buttonAction = null;

        // Test run actions
        this.handleNextTestClick = this.handleNextTestClick.bind(this);
        this.handlePreviousTestClick = this.handlePreviousTestClick.bind(this);
        this.handleCloseRunClick = this.handleCloseRunClick.bind(this);
        this.handleRedoClick = this.handleRedoClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleRaiseIssueClick = this.handleRaiseIssueClick.bind(this);
        this.handleConflictsModalClick = this.handleConflictsModalClick.bind(
            this
        );
        this.handleRaiseIssueFromConflictClick = this.handleRaiseIssueFromConflictClick.bind(
            this
        );

        // Modal actions
        this.handleModalCloseClick = this.handleModalCloseClick.bind(this);
        this.handleModalConfirmClick = this.handleModalConfirmClick.bind(this);

        // iframe action
        this.handleSubmit = this.handleSubmit.bind(this);

        this.iframe = React.createRef();
    }

    handleModalCloseClick() {
        this.setState({
            showConfirmModal: false
        });
    }

    handleModalConfirmClick() {
        const action = this.buttonAction;
        this.buttonAction = null;
        this.setState({
            showConfirmModal: false
        });
        this.performButtonAction(action);
    }

    async performButtonAction(action) {
        const {
            test,
            testerId,
            cycleId,
            history,
            displayNextTest,
            displayPreviousTest,
            deleteResultFromTest
        } = this.props;

        switch (action) {
            case 'closeTest': {
                history.push(`/test-queue/${cycleId}`);
                break;
            }
            case 'goToNextTest': {
                displayNextTest();
                break;
            }
            case 'goToPreviousTest': {
                displayPreviousTest();
                break;
            }
            case 'redoTest': {
                if (!this.testHasResult) {
                    this.iframe.current.reloadAndClear();
                } else {
                    await deleteResultFromTest();
                }
                break;
            }
            case 'editTest': {
                // save serialized form state, since it will be
                // gone from state after results are deleted
                const serializedForm = test.results[testerId].serialized_form;
                await deleteResultFromTest();
                // hydrate form with serialized state
                this.iframe.current.reloadAndHydrate(serializedForm);
                break;
            }
        }
    }

    confirm(action) {
        this.buttonAction = action;
        this.setState({
            showConfirmModal: true
        });
    }

    handleNextTestClick() {
        if (this.testHasResult) {
            this.performButtonAction('goToNextTest');
        } else {
            this.confirm('goToNextTest');
        }
    }

    handlePreviousTestClick() {
        if (this.testHasResult) {
            this.performButtonAction('goToPreviousTest');
        } else {
            this.confirm('goToPreviousTest');
        }
    }

    handleRedoClick() {
        this.confirm('redoTest');
    }

    handleCloseRunClick() {
        if (this.testHasResult) {
            this.performButtonAction('closeTest');
        } else {
            this.confirm('closeTest');
        }
    }

    handleEditClick() {
        this.performButtonAction('editTest');
    }

    handleRaiseIssueClick() {
        this.setState({
            showRaiseIssueModal: !this.state.showRaiseIssueModal,
            showConflictsModal: false
        });
    }

    handleConflictsModalClick() {
        this.setState({
            showConflictsModal: !this.state.showConflictsModal
        });
    }

    handleRaiseIssueFromConflictClick() {
        this.setState({
            showConflictsModal: false,
            showRaiseIssueModal: true
        });
    }

    handleSubmit(data) {
        const { saveResultFromTest } = this.props;
        saveResultFromTest(data);
    }

    renderModal() {
        let {
            at_key,
            cycleId,
            git_hash,
            run,
            test,
            testIndex,
            userId,
            testerId
        } = this.props;

        let modalTitle, action;
        let cannotSave = `Test ${testIndex} has not been completed in full and your progress on this test won’t be saved.`;

        if (this.buttonAction === 'closeTest') {
            modalTitle = 'Save and Close';
            action = `You are about to leave this test run. ${cannotSave}`;
        }
        if (this.buttonAction === 'goToNextTest') {
            modalTitle = 'Skip Test';
            action = `You are about to move to the next test. ${cannotSave}`;
        }
        if (this.buttonAction === 'goToPreviousTest') {
            modalTitle = 'Previous Test';
            action = `You are about to move to the previous test. ${cannotSave}`;
        }
        if (this.buttonAction === 'redoTest') {
            modalTitle = 'Re-Do';
            action = `Are you sure you want to re-do test ${testIndex}. Your progress (if any) will be lost.`;
        }

        return (
            <>
                <Modal
                    show={this.state.showConfirmModal}
                    onHide={this.handleModalCloseClick}
                    centered
                    animation={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{action}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleModalCloseClick}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.handleModalConfirmClick}
                        >
                            Continue
                        </Button>
                    </Modal.Footer>
                </Modal>

                <ReviewConflictsModal
                    onHide={this.handleConflictsModalClick}
                    show={this.state.showConflictsModal}
                    userId={userId}
                    testerId={testerId}
                    test={test}
                    handleRaiseIssueClick={this.handleRaiseIssueClick}
                />

                <RaiseIssueModal
                    at_key={at_key}
                    cycleId={cycleId}
                    git_hash={git_hash}
                    onHide={this.handleRaiseIssueClick}
                    run={run}
                    show={this.state.showRaiseIssueModal}
                    test={test}
                    testIndex={testIndex}
                    userId={userId}
                    testerId={testerId}
                />
            </>
        );
    }

    render() {
        const {
            handleCloseRunClick,
            handleNextTestClick,
            handlePreviousTestClick,
            handleRaiseIssueClick,
            handleRedoClick,
            handleConflictsModalClick,
            handleEditClick
        } = this;

        const {
            cycleId,
            run,
            test,
            git_hash,
            at_key,
            testIndex,
            testerId
        } = this.props;

        const { conflicts } = this.state;

        this.testHasResult =
            test.results &&
            test.results[testerId] &&
            test.results[testerId].status === 'complete'
                ? true
                : false;

        const statusProps = {
            conflicts,
            cycleId,
            git_hash,
            handleCloseRunClick,
            handleNextTestClick,
            handlePreviousTestClick,
            handleRaiseIssueClick,
            handleRedoClick,
            handleConflictsModalClick,
            run,
            test,
            testIndex,
            testerId
        };

        let testContent = null;
        let menuUnderContent = (
            <ButtonToolbar className="testrun__button-toolbar--margin">
                {testIndex !== 1 && (
                    <Button variant="primary" onClick={handlePreviousTestClick}>
                        Previous test
                    </Button>
                )}
                <Button
                    className="testrun__button--right"
                    variant="primary"
                    onClick={handleNextTestClick}
                >
                    {this.testHasResult ? 'Next' : 'Skip'} test
                </Button>
            </ButtonToolbar>
        );
        let menuRightOContent = (
            <>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={handleRaiseIssueClick}
                >
                    Raise an issue
                </Button>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={handleRedoClick}
                >
                    Re-do test
                </Button>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={handleCloseRunClick}
                >
                    {this.testHasResult ? 'Close' : 'Save and close'}
                </Button>
                {this.testHasResult ? (
                    <Button
                        className="btn-block"
                        variant="primary"
                        onClick={handleEditClick}
                    >
                        Edit
                    </Button>
                ) : null}
            </>
        );

        if (this.testHasResult) {
            testContent = <TestResult testResult={test.results[testerId]} />;
        } else {
            testContent = (
                <TestIframe
                    git_hash={git_hash}
                    file={test.file}
                    at_key={at_key}
                    onSubmit={this.handleSubmit}
                    ref={this.iframe}
                ></TestIframe>
            );
        }

        let modals = this.renderModal();

        // Quick and lazy fix to make sure the
        // content row lines up with everything
        // else on the left.
        const contentRowStyle = { marginLeft: '0px' };
        return (
            <Fragment>
                <Row>
                    <Col>
                        <h4 data-test="test-run-h4">
                            Testing task: {test.name}
                        </h4>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StatusBar key={nextId()} {...statusProps} />
                    </Col>
                </Row>

                <Row style={contentRowStyle}>
                    <Col md={9}>
                        <Row>{testContent}</Row>
                        <Row>{menuUnderContent}</Row>
                    </Col>
                    <Col md={3}>{menuRightOContent}</Col>
                </Row>
                {modals}
            </Fragment>
        );
    }
}

DisplayTest.propTypes = {
    dispatch: PropTypes.func,
    run: PropTypes.object,
    test: PropTypes.object,
    testIndex: PropTypes.number,
    git_hash: PropTypes.string,
    at_key: PropTypes.string,
    cycleId: PropTypes.number,
    userId: PropTypes.number,
    testerId: PropTypes.number,
    history: PropTypes.object,
    displayNextTest: PropTypes.func,
    displayPreviousTest: PropTypes.func,
    saveResultFromTest: PropTypes.func,
    deleteResultFromTest: PropTypes.func
};

export default withRouter(DisplayTest);
