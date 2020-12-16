import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Table, Container, Breadcrumb } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns, getTestVersions } from '../../actions/runs';
import CurrentGitCommit from '@components/CurrentGitCommit';
import PropTypes from 'prop-types';
import {
    generateTechPairs,
    generateApgExample,
    formatFraction,
    formatInteger,
    formatNoResults
} from '../ReportsPage/utils';

class TestPlanReportPage extends Component {
    constructor() {
        super();
        this.state = {
            techPairs: null,
            apgExample: null
        };

        this.generateTables = this.generateTables.bind(this);
        this.generateTableRows = this.generateTableRows.bind(this);
    }

    componentDidMount() {
        const { dispatch, publishedRunsById, testVersion } = this.props;
        if (!publishedRunsById) {
            dispatch(getPublishedRuns());
        } else {
            this.generateInitialStateFromRuns();
        }
        if (!testVersion) {
            dispatch(getTestVersions());
        }
    }

    componentDidUpdate(prevProps) {
        const { publishedRunsById } = this.props;
        if (publishedRunsById !== prevProps.publishedRunsById) {
            this.generateInitialStateFromRuns();
        }
    }

    generateInitialStateFromRuns() {
        const { publishedRunsById, testPlanId } = this.props;
        let techPairs = generateTechPairs(publishedRunsById);
        let apgExample = generateApgExample(
            publishedRunsById,
            techPairs,
            testPlanId
        );
        this.setState({ techPairs, apgExample });
    }

    generateTableRows(testsWithMetaData) {
        const { apgExample } = this.state;
        const {
            requiredAssertions,
            passingRequiredAssertions,
            optionalAssertions,
            passingOptionalAssertions,
            unexpectedBehaviors
        } = testsWithMetaData;
        let rows = [];
        rows.push(
            <tr key="summary">
                <th scope="row" key="summary">
                    <a href="/reports">All Tests</a>
                </th>

                <td key="summary-required">
                    {formatFraction(
                        passingRequiredAssertions,
                        requiredAssertions
                    )}
                </td>
                <td key="summary-optional">
                    {formatFraction(
                        passingOptionalAssertions,
                        optionalAssertions
                    )}
                </td>
                <td key="summary-unexpected">
                    {formatInteger(unexpectedBehaviors)}
                </td>
            </tr>
        );

        apgExample.testNames.forEach((testName, testIndex) => {
            const testWithResults = testsWithMetaData.testsWithResults.find(
                t => t.testName === testName
            );
            rows.push(
                <tr key={`${testIndex}-row`}>
                    <th scope="row" key={`${testIndex}-name`}>
                        {(testWithResults && (
                            <a
                                href={`/results/run/${testWithResults.runId}#test-${testWithResults.executionOrder}`}
                            >
                                {testName}
                            </a>
                        )) ||
                            testName}
                    </th>
                    <td key={`${testIndex}-required`}>
                        {(testWithResults &&
                            formatFraction(
                                testWithResults.passingRequiredAssertions,
                                testWithResults.requiredAssertions
                            )) ||
                            formatNoResults()}
                    </td>
                    <td key={`${testIndex}-optional`}>
                        {(testWithResults &&
                            formatFraction(
                                testWithResults.passingOptionalAssertions,
                                testWithResults.optionalAssertions
                            )) ||
                            formatNoResults()}
                    </td>
                    <td key={`${testIndex}-unexpected`}>
                        {(testWithResults &&
                            formatInteger(unexpectedBehaviors)) ||
                            formatNoResults()}
                    </td>
                </tr>
            );
        });

        return rows;
    }

    generateTables() {
        const { apgExample, techPairs } = this.state;
        let tables = [];

        techPairs.forEach(
            ({ browser, browserVersion, at, atVersion }, techPairIndex) => {
                const testsWithMetaData =
                    apgExample.testsWithMetaDataIndexedByTechPair[
                        techPairIndex
                    ];
                if (testsWithMetaData.testsWithResults.length > 0) {
                    tables.push(
                        <div>
                            <h2 id={`table-${techPairIndex}`}>
                                {browser} {browserVersion} with {at} {atVersion}{' '}
                                Results
                            </h2>
                            <Table
                                bordered
                                hover
                                key={`table-${techPairIndex}`}
                                aria-labelledby={`tabel-${techPairIndex}`}
                            >
                                <thead>
                                    <tr>
                                        <th key="tests" scope="col">
                                            Test Name
                                        </th>
                                        <th key="required" scope="col">
                                            Required Assertions
                                        </th>
                                        <th key="optional" scope="col">
                                            Optional Assertions
                                        </th>
                                        <th key="unexpected" scope="col">
                                            Unexpected Behaviors
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.generateTableRows(testsWithMetaData)}
                                </tbody>
                            </Table>
                        </div>
                    );
                }
            }
        );

        return tables;
    }

    render() {
        const { techPairs, apgExample } = this.state;

        if (techPairs && !apgExample) {
            return <Redirect to={{ pathname: '/404' }} />;
        }

        if (!apgExample) {
            return <div>Loading Test Plan Report...</div>;
        }

        return (
            <Container as="main">
                <Helmet>
                    <title>{`ARIA-AT Report ${apgExample.exampleName}`}</title>
                </Helmet>
                <Breadcrumb>
                    <Breadcrumb.Item href="/reports">
                        Summary Report
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>
                        Test Plan Report: {apgExample.exampleName}
                    </Breadcrumb.Item>
                </Breadcrumb>
                <h1>{apgExample.exampleName} Report</h1>
                <ul>
                    {apgExample.exampleUrl ? (
                        <li>
                            <a href={apgExample.exampleUrl}>
                                Example under test
                            </a>
                        </li>
                    ) : (
                        <></>
                    )}
                    {apgExample.designPatternUrl ? (
                        <li>
                            <a href={apgExample.designPatternUrl}>
                                Design pattern
                            </a>
                        </li>
                    ) : (
                        <></>
                    )}
                </ul>
                {this.props.testVersion ? (
                    <CurrentGitCommit
                        label="Results shown are from the most recent test version:"
                        gitHash={this.props.testVersion.git_hash}
                        gitCommitMessage={this.props.testVersion.git_commit_msg}
                    />
                ) : (
                    <></>
                )}
                {this.generateTables()}
            </Container>
        );
    }
}

TestPlanReportPage.propTypes = {
    dispatch: PropTypes.func,
    publishedRunsById: PropTypes.object,
    testPlanId: PropTypes.number,
    testVersion: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    const { publishedRunsById, testVersions } = state.runs;
    const testPlanId = parseInt(ownProps.match.params.testPlanId);
    let testVersion = null;
    if (publishedRunsById && testVersions) {
        const runs = Object.values(publishedRunsById);

        if (runs.length > 0) {
            testVersion = (testVersions || []).find(
                v => v.id === runs[0].test_version_id
            );
        }
    }
    return { publishedRunsById, testVersion, testPlanId };
};

export default connect(mapStateToProps)(TestPlanReportPage);
