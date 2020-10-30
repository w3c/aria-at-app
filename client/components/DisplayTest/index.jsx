import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './DisplayTest.css';
import { withRouter } from 'react-router-dom';
import nextId from 'react-id-generator';
import {
    Button,
    ButtonToolbar,
    Col,
    Modal,
    Pagination,
    Row
} from 'react-bootstrap';
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
        this.handleSaveClick = this.handleSaveClick.bind(this);
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
        this.handleResults = this.handleResults.bind(this);

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
            history,
            displayNextTest,
            displayPreviousTest,
            deleteResultFromTest
        } = this.props;

        switch (action) {
            case 'saveTest': {
                this.iframe.current.triggerSubmit();
                break;
            }
            case 'closeTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.processResults(null);
                }
                history.push(`/test-queue`);
                break;
            }
            case 'goToNextTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.processResults(null);
                }
                displayNextTest();
                break;
            }
            case 'goToPreviousTest': {
                // Save the serialized form of iframe
                if (this.iframe.current) {
                    await this.iframe.current.processResults(null);
                }
                displayPreviousTest();
                break;
            }
            case 'redoTest': {
                if (this.iframe.current) {
                    this.iframe.current.reloadAndClear();
                }
                await deleteResultFromTest();
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

    handleSaveClick() {
        this.performButtonAction('saveTest');
    }

    handleNextTestClick() {
        this.performButtonAction('goToNextTest');
    }

    handlePreviousTestClick() {
        this.performButtonAction('goToPreviousTest');
    }

    handleRedoClick() {
        this.confirm('redoTest');
    }

    handleCloseRunClick() {
        this.performButtonAction('closeTest');
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

    handleResults(data) {
        const { saveResultFromTest } = this.props;
        saveResultFromTest(data);
    }

    renderModal() {
        let {
            at_key,
            git_hash,
            run,
            test,
            testIndex,
            userId,
            testerId
        } = this.props;

        let modalTitle, action;

        if (this.buttonAction === 'redoTest') {
            modalTitle = 'Start Over';
            action = `Are you sure you want to start over test ${testIndex}. Your progress (if any) will be lost.`;
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
            handleSaveClick,
            handleCloseRunClick,
            handleNextTestClick,
            handlePreviousTestClick,
            handleRaiseIssueClick,
            handleRedoClick,
            handleConflictsModalClick,
            handleEditClick
        } = this;

        const { run, test, git_hash, at_key, testIndex, testerId } = this.props;

        const { conflicts } = this.state;

        this.testHasResult = test.results && test.results[testerId];

        this.testResultsCompleted =
            this.testHasResult && test.results[testerId].status === 'complete';

        this.testResultsSkipped =
            this.testHasResult &&
            test.results[testerId].status === 'incomplete';

        const statusProps = {
            conflicts,
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

        let primaryButtonGroup;

        if (this.testResultsCompleted) {
            primaryButtonGroup = (
                <div className="testrun__button-toolbar-group">
                    <Button variant="primary" onClick={handleNextTestClick}>
                        Next test
                    </Button>
                    <Button variant="secondary" onClick={handleEditClick}>
                        Edit results
                    </Button>
                </div>
            );
        } else {
            primaryButtonGroup = (
                <div className="testrun__button-toolbar-group">
                    <Button variant="primary" onClick={handleSaveClick}>
                        Save results
                    </Button>
                </div>
            );
        }

        // note ButtonToolbar children are in row-reverse flex
        // direction to align right when there is only one child
        // and create a more logical tab order
        let menuUnderContent = (
            <ButtonToolbar className="testrun__button-toolbar">
                {primaryButtonGroup}
                <Pagination>
                    <Pagination.First
                        onClick={() => {
                            this.props.displayTestByIndex(1);
                        }}
                    />
                    <Pagination.Prev onClick={handlePreviousTestClick} />
                    {run.tests.reduce((acc, t, i, arr) => {
                        const item = (
                            <Pagination.Item
                                key={i}
                                active={i + 1 === testIndex}
                                onClick={() => {
                                    this.props.displayTestByIndex(i + 1);
                                }}
                            >
                                {i + 1}
                            </Pagination.Item>
                        );
                        if (arr.length < 10 || i < 5 || i >= arr.length - 5) {
                            acc.push(item);
                        } else if (arr.length > 10 && i === 6) {
                            acc.push(<Pagination.Ellipsis />);
                        }
                        return acc;
                    }, [])}
                    <Pagination.Next onClick={handleNextTestClick} />
                    <Pagination.Last
                        onClick={() => {
                            this.props.displayTestByIndex(run.tests.length + 1);
                        }}
                    />
                </Pagination>
            </ButtonToolbar>
        );
        let menuRightOContent = (
            <nav>
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
                    Start over
                </Button>
                <Button
                    className="btn-block"
                    variant="primary"
                    onClick={handleCloseRunClick}
                >
                    Close
                </Button>
            </nav>
        );

        if (this.testResultsCompleted) {
            testContent = <TestResult testResult={test.results[testerId]} />;
        } else if (this.testResultsSkipped) {
            testContent = (
                <TestIframe
                    git_hash={git_hash}
                    file={test.file}
                    at_key={at_key}
                    onResults={this.handleResults}
                    ref={this.iframe}
                    serializedForm={test.results[testerId].serialized_form}
                ></TestIframe>
            );
        } else {
            testContent = (
                <TestIframe
                    git_hash={git_hash}
                    file={test.file}
                    at_key={at_key}
                    onResults={this.handleResults}
                    ref={this.iframe}
                ></TestIframe>
            );
        }

        let modals = this.renderModal();

        return (
            <Fragment>
                <h4 data-test="test-run-h4">Testing task: {test.name}</h4>
                <StatusBar key={nextId()} {...statusProps} />
                <Row>
                    <Col md={9} className="test-iframe-contaner">
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
    userId: PropTypes.number,
    testerId: PropTypes.number,
    history: PropTypes.object,
    displayNextTest: PropTypes.func,
    displayPreviousTest: PropTypes.func,
    displayTestByIndex: PropTypes.func,
    saveResultFromTest: PropTypes.func,
    deleteResultFromTest: PropTypes.func
};

export default withRouter(DisplayTest);
