import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Col, Container, Row } from 'react-bootstrap';
import queryString from 'query-string';
import {
    getActiveRunConfiguration,
    getActiveRuns,
    saveResult
} from '../../actions/runs';
import DisplayTest from '@components/DisplayTest';
import checkForConflict from '../../utils/checkForConflict';
import './TestRun.css';

class TestRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTestIndex: 1,
            runComplete: false,
            showTestNavigator: true
        };

        this.displayNextTest = this.displayNextTest.bind(this);
        this.displayPreviousTest = this.displayPreviousTest.bind(this);
        this.displayTestByIndex = this.displayTestByIndex.bind(this);
        this.saveResultFromTest = this.saveResultFromTest.bind(this);
        this.deleteResultFromTest = this.deleteResultFromTest.bind(this);
        this.toggleTestNavigator = this.toggleTestNavigator.bind(this);
    }

    async componentDidMount() {
        const { dispatch, run, activeRunConfiguration } = this.props;
        if (!activeRunConfiguration) {
            dispatch(getActiveRunConfiguration());
        }
        if (!run) {
            dispatch(getActiveRuns());
        }
    }

    displayNextTest() {
        const { run } = this.props;
        let newIndex = this.state.currentTestIndex + 1;
        if (newIndex > run.tests.length) {
            this.setState({
                runComplete: true
            });
        } else {
            this.setState({
                currentTestIndex: newIndex
            });
        }
    }

    displayTestByIndex(index) {
        this.setState({
            currentTestIndex: index
        });
    }

    displayPreviousTest() {
        this.setState({
            currentTestIndex: this.state.currentTestIndex - 1
        });
    }

    toggleTestNavigator() {
        this.setState({
            showTestNavigator: !this.state.showTestNavigator
        });
    }

    async saveResultFromTest({ results, serializedForm }) {
        const { dispatch, run, userId, openAsUser } = this.props;
        const test = run.tests[this.state.currentTestIndex - 1];
        await dispatch(
            saveResult({
                test_id: test.id,
                run_id: run.id,
                user_id: openAsUser || userId,
                result: results,
                serialized_form: serializedForm
            })
        );
        return true;
    }

    async deleteResultFromTest() {
        const { dispatch, run, userId, openAsUser } = this.props;
        const test = run.tests[this.state.currentTestIndex - 1];
        await dispatch(
            saveResult({
                test_id: test.id,
                run_id: run.id,
                user_id: openAsUser || userId,
                serializedForm: null
            })
        );
        return true;
    }

    render() {
        const {
            run,
            activeRunConfiguration,
            userId,
            usersById,
            openAsUser
        } = this.props;

        if (!run || !activeRunConfiguration) {
            return <div data-test="test-run-loading">Loading</div>;
        }
        const { git_hash } = activeRunConfiguration.active_test_version;

        const {
            apg_example_name,
            at_key,
            at_name,
            at_version,
            browser_name,
            browser_version
        } = run;

        let test,
            testsToRun = false;
        if (run.tests.length > 0) {
            test = run.tests[this.state.currentTestIndex - 1];
            testsToRun = true;
        }

        let heading = null;
        let content = null;
        let testContent = null;
        let runningAsUserHeader = null;

        if (openAsUser) {
            runningAsUserHeader = (
                <>
                    <h2>
                        Reviewings tests of{' '}
                        <b>{`${usersById[openAsUser].username}`}</b>
                    </h2>
                    <p>{`All changes will be saved as performed by ${usersById[openAsUser].username}.`}</p>
                </>
            );
        }

        if (testsToRun) {
            heading = (
                <Fragment>
                    {runningAsUserHeader}
                    <h2 data-test="test-run-h2">
                        {' '}
                        {`${apg_example_name} (${this.state.currentTestIndex} of ${run.tests.length})`}
                    </h2>
                    <h3 data-test="test-run-h3">{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                </Fragment>
            );

            if (!this.state.runComplete) {
                testContent = (
                    <DisplayTest
                        key={`${test.id}/${this.state.currentTestIndex}`}
                        run={run}
                        test={test}
                        testIndex={this.state.currentTestIndex}
                        git_hash={git_hash}
                        at_key={at_key}
                        displayNextTest={this.displayNextTest}
                        displayPreviousTest={this.displayPreviousTest}
                        saveResultFromTest={this.saveResultFromTest}
                        deleteResultFromTest={this.deleteResultFromTest}
                        userId={userId}
                        testerId={openAsUser || userId}
                    />
                );
            } else {
                content = <div>Tests are complete.</div>;
            }
        } else {
            heading = (
                <Fragment>
                    <h2>{`${apg_example_name}`}</h2>
                    <h3>{`${at_name} ${at_version} with ${browser_name} ${browser_version}`}</h3>
                </Fragment>
            );
            content = <div>No tests for this browser / AT combination</div>;
        }

        let prepend = '';
        let title = `${apg_example_name} for ${at_name} ${at_version} with ${browser_name} ${browser_version} | ARIA-AT`;

        if (openAsUser) {
            prepend = `Reviewing test results for ${usersById[openAsUser].username} for `;
        } else {
            prepend = 'Testing ';
        }

        title = `${prepend}${title}`;

        return (
            <Fragment>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <Container fluid>
                    <Row>
                        <aside className="col-md-3 test-navigator">
                            {this.state.showTestNavigator ? (
                                <>
                                    <h3>Test Navigator</h3>
                                    <button
                                        onClick={this.toggleTestNavigator}
                                        className="test-navigator-toggle hide"
                                    >
                                        Hide
                                    </button>
                                    <ol className="test-navigator-list">
                                        {run.tests.map((t, i) => {
                                            let resultClassName = 'not-started';
                                            const testersResult =
                                                t.results &&
                                                t.results[openAsUser || userId];
                                            if (testersResult) {
                                                if (
                                                    testersResult.status ==
                                                    'incomplete'
                                                ) {
                                                    resultClassName =
                                                        'in-progress';
                                                } else if (
                                                    testersResult.status ==
                                                    'skipped'
                                                ) {
                                                    resultClassName = 'skipped';
                                                } else if (
                                                    checkForConflict(t.results)
                                                        .length
                                                ) {
                                                    resultClassName =
                                                        'conflicts';
                                                } else if (
                                                    testersResult.status ===
                                                    'complete'
                                                ) {
                                                    resultClassName =
                                                        'complete';
                                                }
                                            } else if (
                                                this.state.currentTestIndex -
                                                    1 >
                                                i
                                            ) {
                                                resultClassName = 'skipped';
                                            }
                                            return (
                                                <li
                                                    className={`test-name-wrapper ${resultClassName}`}
                                                    key={i}
                                                >
                                                    <span className="progress-indicator"></span>
                                                    <a
                                                        href="#"
                                                        onClick={() => {
                                                            this.displayTestByIndex(
                                                                i + 1
                                                            );
                                                        }}
                                                        className="test-name"
                                                    >
                                                        {t.name}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </>
                            ) : (
                                <button
                                    onClick={this.toggleTestNavigator}
                                    className="test-navigator-toggle"
                                >
                                    Show Test Navigator
                                </button>
                            )}
                        </aside>
                        <button
                            onClick={this.toggleTestNavigator}
                            className="test-navigator-toggle show"
                        ></button>
                        <Col md={9}>
                            {heading}
                            {testContent || (
                                <Row>
                                    <Col>{content}</Col>
                                </Row>
                            )}
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        );
    }
}

TestRun.propTypes = {
    activeRunConfiguration: PropTypes.object,
    dispatch: PropTypes.func,
    userId: PropTypes.number,
    openAsUser: PropTypes.number,
    run: PropTypes.object,
    testSuiteVersionData: PropTypes.object,
    usersById: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { activeRunConfiguration, activeRunsById } = state.runs;
    const { usersById } = state.users;
    let userId = state.user.id;
    const isAdmin = state.user.roles && state.user.roles.includes('admin');

    const runId = parseInt(ownProps.match.params.runId);
    let run;
    if (activeRunsById) {
        run = activeRunsById[runId];
    }

    let openAsUser;
    const openAsUserQuery = parseInt(
        queryString.parse(ownProps.location.search).user
    );
    if (isAdmin && openAsUserQuery && usersById[openAsUserQuery]) {
        openAsUser = openAsUserQuery;
    }

    return {
        activeRunConfiguration,
        run,
        usersById,
        openAsUser,
        userId
    };
};

export default connect(mapStateToProps)(TestRun);
