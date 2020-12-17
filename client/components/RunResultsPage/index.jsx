import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import {
    Col,
    Container,
    Row,
    Table,
    Button,
    Breadcrumb
} from 'react-bootstrap';
import { getPublishedRuns, getActiveRuns, getTestVersions } from '../../actions/runs';
import checkForConflict from '../../utils/checkForConflict';
import TestResult from '@components/TestResult';
import RaiseIssueModal from '@components/RaiseIssueModal';
import nextId from 'react-id-generator';

class RunResultsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showRaiseIssueModal: {}
        };

        this.handleRaiseIssueClick = this.handleRaiseIssueClick.bind(this);

        this.$refs = {};
    }

    async componentDidMount() {
        const { dispatch, run, testVersion } = this.props;
        if (!run) {
            dispatch(getPublishedRuns());
            dispatch(getActiveRuns());
        }
        if (!testVersion) {
            dispatch(getTestVersions());
        }
    }

    async componentDidUpdate() {
        if (this.$refs && location.href.includes('#test-')) {
            const anchor = location.href.split('#')[1];
            if (anchor !== undefined) {
                const ref = this.$refs[anchor];
                if (ref !== undefined) {
                    ref.scrollIntoView();
                    ref.focus();
                }
            }
        }
    }

    handleRaiseIssueClick(i) {
        this.setState({
            showRaiseIssueModal: Object.assign(this.state.showRaiseIssueModal, {
                [i]: !this.state.showRaiseIssueModal[i]
            })
        });
    }

    renderResultRow(test) {
        const details = test.result.result.details;
        let required =
            details.summary[1].pass + details.summary[1].fail > 0
                ? `${details.summary[1].pass} / ${details.summary[1].fail +
                      details.summary[1].pass}`
                : '-';

        let optional =
            details.summary[2].pass + details.summary[2].fail > 0
                ? `${details.summary[2].pass} / ${details.summary[2].fail +
                      details.summary[1].pass}`
                : '-';

        return (
            <tr key={nextId()}>
                <td>
                    <a href={`#test-${test.execution_order}`}>{details.name}</a>
                </td>
                <td>{required}</td>
                <td>{optional}</td>
                <td>{details.summary.unexpectedCount}</td>
            </tr>
        );
    }

    render() {
        const { run, allTests, testVersion, runsLoaded, formattedRunStatus } = this.props;

        if (runsLoaded && !run) {
            return <Redirect to={{ pathname: '/404' }} />;
        }

        if (!run || !allTests || !testVersion) {
            return (
                <Container as="main">
                    <div>Loading Run Report...</div>
                </Container>
            );
        }

        const {
            at_key,
            apg_example_name,
            apg_example_id,
            at_name,
            at_version,
            browser_name,
            browser_version,
            run_status
        } = run;

        const { git_hash } = testVersion;

        let title = `Results for ${apg_example_name} tested with ${at_name} ${at_version} on ${browser_name} ${browser_version}`;
        if (!run_status) {
            return (
                <>
                    <Helmet>
                        <title>{title}</title>
                    </Helmet>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Fragment>
                                    <h1>{title}</h1>
                                    <p>{`No results have been marked as 'In Review' or 'Published' for this run.`}</p>
                                </Fragment>
                            </Col>
                        </Row>
                    </Container>
                </>
            );
        }

        let tests = [];
        let skippedTests = [];
        for (let test of allTests) {
            if (!test.results) {
                skippedTests.push(test);
                continue;
            }

            // Only include tests that have at least one complete result
            // and no conflicting results
            let result;
            for (let r of Object.values(test.results)) {
                if (r.status === 'complete') {
                    if (checkForConflict(test.results).length === 0) {
                        result = r;
                        continue;
                    }
                }
            }

            if (result) {
                tests.push({
                    ...test,
                    result
                });
            } else {
                skippedTests.push(test);
            }
        }

        // This array is for caculating percentage support
        // Accross all tests for priorities 1-2
        let support = {
            1: [0, 0],
            2: [0, 0]
        };
        let totalUnexpecteds = 0;
        for (let test of tests) {
            let result = test.result.result;
            let details = result.details;
            totalUnexpecteds += parseInt(details.summary.unexpectedCount);
            for (let i = 1; i <= 2; i++) {
                support[i][0] += details.summary[i].pass;
                support[i][1] +=
                    details.summary[i].pass + details.summary[i].fail;
            }
        }

        title = `${apg_example_name} with ${at_name} ${at_version} on ${browser_name} ${browser_version} Report`;

        return (
            <Container as="main">
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <Container fluid>
                    <Row>
                        <Col>
                            <Fragment>
                                { formattedRunStatus == 'Published' ?
                                  <Breadcrumb>
                                      <Breadcrumb.Item href="/reports">
                                          Summary Report
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item
                                          href={`/reports/test-plans/${apg_example_id}`}
                                      >
                                          Test Plan Report: {apg_example_name}
                                      </Breadcrumb.Item>
                                      <Breadcrumb.Item active>
                                          Tech Pair Report: {at_name} {at_version}{' '}
                                          on {browser_name} {browser_version}
                                        </Breadcrumb.Item>
                                </Breadcrumb> : <></> }
                                <h1><span>{formattedRunStatus}:</span> {title}</h1>
                            </Fragment>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2>Summary of tests</h2>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Test</th>
                                        <th>
                                            <div>Required</div>
                                            <div>(pass/total)</div>
                                        </th>
                                        <th>
                                            <div>Optional</div>
                                            <div>(pass/total)</div>
                                        </th>
                                        <th>
                                            <div>Unexpected Behaviors</div>
                                            <div>(total count)</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map(test =>
                                        this.renderResultRow(test)
                                    )}
                                    <tr>
                                        <td>Support</td>
                                        <td>
                                            {support[1][1]
                                                ? `${Math.round(
                                                      (support[1][0] /
                                                          support[1][1]) *
                                                          100
                                                  )}%`
                                                : '-'}
                                        </td>
                                        <td>
                                            {support[2][1]
                                                ? `${Math.round(
                                                      (support[2][0] /
                                                          support[2][1]) *
                                                          100
                                                  )}%`
                                                : '-'}
                                        </td>
                                        <td>
                                            {totalUnexpecteds
                                                ? `${totalUnexpecteds} command(s) produced unexpected behaviors`
                                                : 'No unexpected behaviors'}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <h2>Skipped Tests</h2>
                            <p>
                                The following tests have been skipped in this
                                test run:
                            </p>
                            <ul>
                                {skippedTests.map(s => {
                                    return (
                                        <li key={nextId()}>
                                            <a
                                                href={`/aria-at/${git_hash}/${s.file}?at=${at_key}`}
                                            >
                                                {s.name}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {tests.map((t, i) => {
                                return (
                                    <Fragment key={nextId()}>
                                        <div>
                                            <h2
                                                ref={ref => {
                                                    this.$refs[
                                                        `test-${t.execution_order}`
                                                    ] = ref;
                                                }}
                                                id={`test-${t.execution_order}`}
                                                tabIndex="-1"
                                                className="float-left"
                                            >
                                                Details for test: {t.name}
                                            </h2>
                                            <div className="float-right">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.handleRaiseIssueClick(
                                                            i
                                                        )
                                                    }
                                                >
                                                    Raise an Issue
                                                </Button>
                                                <Button
                                                    target="_blank"
                                                    href={`/aria-at/${git_hash}/${t.file}?at=${at_key}`}
                                                    variant="secondary"
                                                >
                                                    Open Test
                                                </Button>
                                            </div>
                                        </div>
                                        <TestResult
                                            testResult={t.result}
                                            label={`test-${t.execution_order}`}
                                        />
                                        <RaiseIssueModal
                                            at_key={at_key}
                                            git_hash={git_hash}
                                            onHide={() =>
                                                this.handleRaiseIssueClick(i)
                                            }
                                            run={run}
                                            show={
                                                this.state.showRaiseIssueModal[
                                                    i
                                                ]
                                            }
                                            test={t}
                                            userDescriptor="Report viewer"
                                        />
                                    </Fragment>
                                );
                            })}
                        </Col>
                    </Row>
                </Container>
            </Container>
        );
    }
}

RunResultsPage.propTypes = {
    dispatch: PropTypes.func,
    allTests: PropTypes.array,
    formattedRunStatus: PropTypes.string,
    run: PropTypes.object,
    testVersion: PropTypes.object,
    runsLoaded: PropTypes.bool,
    isSignedIn: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    const { isSignedIn } = state.user;
    const { publishedRunsById, activeRunsById, testVersions } = state.runs;

    const runId = parseInt(ownProps.match.params.runId);

    let run, testVersion, allTests;
    let runsLoaded = false;
    let formattedRunStatus = 'In Review';
    if (publishedRunsById) {
        run = publishedRunsById[runId];
        formattedRunStatus = 'Published'
    }
    if (!run && activeRunsById) {
      run = activeRunsById[runId];
    }
    if (publishedRunsById && activeRunsById) {
      runsLoaded = true;
    }
    if (run) {
        testVersion = (testVersions || []).find(
            v => v.id === run.test_version_id
        );
        allTests = run.tests;
    }

    return {
        run,
        formattedRunStatus,
        allTests,
        testVersion,
        runsLoaded,
        isSignedIn
    };
};

export default connect(mapStateToProps)(RunResultsPage);
