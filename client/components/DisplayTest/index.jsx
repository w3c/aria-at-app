import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './DisplayTest.css';
import { withRouter } from 'react-router-dom';
import {
    Button,
    ButtonGroup,
    ButtonToolbar,
    Col,
    Modal,
    Row
} from 'react-bootstrap';
import TestResult from '@components/TestResult';

class DisplayTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmLeaveTestModal: false
        };

        this.buttonAction = '';

        this.handleNextTestClick = this.handleNextTestClick.bind(this);
        this.handlePreviousTestClick = this.handlePreviousTestClick.bind(this);
        this.handleCloseRunClick = this.handleCloseRunClick.bind(this);
        this.handleCloseLeaveTestModal = this.handleCloseLeaveTestModal.bind(
            this
        );
        this.handleConfirmLeaveTest = this.handleConfirmLeaveTest.bind(this);

        this.testIframe = React.createRef();
    }

    handleCloseLeaveTestModal() {
        this.setState({
            showConfirmLeaveTestModal: false
        });
    }

    handleConfirmLeaveTest() {
        this.setState({
            showConfirmLeaveTestModal: false
        });
        this.performButtonAction();
    }

    performButtonAction() {
        const {
            cycleId,
            history,
            displayNextTest,
            displayPreviousTest
        } = this.props;
        if (this.buttonAction === 'exitAfterConfirm') {
            history.push(`/test-queue/${cycleId}`);
        }
        if (this.buttonAction === 'goToNextTest') {
            displayNextTest();
        }
        if (this.buttonAction === 'goToPreviousTest') {
            displayPreviousTest();
        }
        this.buttonAction = '';
    }

    handleNextTestClick() {
        this.buttonAction = 'goToNextTest';
        this.trySaving();
    }

    handlePreviousTestClick() {
        this.buttonAction = 'goToPreviousTest';
        this.trySaving();
    }

    handleCloseRunClick() {
        this.buttonAction = 'exitAfterConfirm';
        this.trySaving();
    }

    trySaving() {
        const { saveResultFromTest, test } = this.props;

        // Only to to save if results don't exist
        if (!test.result) {
            let resultsEl = this.testIframe.current.contentDocument.querySelector(
                '#__ariaatharness__results__'
            );

            if (!resultsEl) {
                this.setState({
                    showConfirmLeaveTestModal: true
                });
                return;
            }

            let result;
            try {
                result = JSON.parse(resultsEl.innerText);
            } catch (error) {
                console.error(
                    'Cannot save tests do to malformed information from test file.'
                );
                throw error;
            }

            saveResultFromTest(result);
        }

        // Save was successful
        this.performButtonAction();
    }

    renderModal() {
        let { testIndex } = this.props;
        return (
            <Fragment>
                <Modal
                    show={this.state.showConfirmLeaveTestModal}
                    onHide={this.handleCloseLeaveTestModal}
                    centered
                    animation={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Leave Test</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{`Are you sure you want to leave this test? Because the test has not been completed in full, your progress on test ${testIndex} won't be saved.`}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleCloseLeaveTestModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={this.handleConfirmLeaveTest}
                        >
                            Continue
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Fragment>
        );
    }

    render() {
        const { test, git_hash, at_key, testIndex } = this.props;

        const testHasResult = test.result ? true : false;

        let testContent = null;
        let menuUnderContent = null;
        let menuRightOContent = null;

        menuUnderContent = (
            <ButtonToolbar className="testrun__button-toolbar--margin">
                {testIndex !== 1 && (
                    <Button
                        variant="primary"
                        onClick={this.handlePreviousTestClick}
                    >
                        Previous Test
                    </Button>
                )}
                <Button
                    className="testrun__button--right"
                    variant="primary"
                    onClick={this.handleNextTestClick}
                >
                    Next Test
                </Button>
            </ButtonToolbar>
        );
        menuRightOContent = (
            <ButtonGroup vertical>
                <Button variant="primary">Raise an issue</Button>
                <Button variant="primary">Re-do Test</Button>
                <Button variant="primary" onClick={this.handleCloseRunClick}>
                    {testHasResult ? 'Close' : 'Save and Close'}
                </Button>
            </ButtonGroup>
        );

        if (testHasResult) {
            testContent = <TestResult testResult={test.result} />;
        } else {
            testContent = (
                <iframe
                    src={`/aria-at/${git_hash}/${test.file}?at=${at_key}`}
                    id="test-iframe"
                    ref={this.testIframe}
                ></iframe>
            );
        }

        let modals = this.renderModal();

        return (
            <Fragment>
                <Col md={9}>
                    <Row>{testContent}</Row>
                    <Row>{menuUnderContent}</Row>
                </Col>
                <Col md={3}>{menuRightOContent}</Col>
                {modals}
            </Fragment>
        );
    }
}

DisplayTest.propTypes = {
    dispatch: PropTypes.func,
    test: PropTypes.object,
    testIndex: PropTypes.number,
    git_hash: PropTypes.string,
    at_key: PropTypes.string,
    cycleId: PropTypes.number,
    history: PropTypes.object,
    displayNextTest: PropTypes.func,
    displayPreviousTest: PropTypes.func,
    saveResultFromTest: PropTypes.func
};

export default withRouter(DisplayTest);
