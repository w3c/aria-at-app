import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Table, Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns, getTestVersions } from '../../actions/runs';
import CurrentGitCommit from '@components/CurrentGitCommit';
import PropTypes from 'prop-types';
import {
    generateTechPairs,
    generateApgExamples,
    calculateTotalPercentageForTechPair,
    calculatePercentage,
    formatNoResults
} from './utils';

class ReportsPage extends Component {
    constructor() {
        super();
        this.state = {
            techPairs: [],
            apgExamples: []
        };

        this.generateInitialStateFromRuns = this.generateInitialStateFromRuns.bind(
            this
        );
        this.generateTechPairTableHeaders = this.generateTechPairTableHeaders.bind(
            this
        );
        this.generateTableRows = this.generateTableRows.bind(this);
        this.generateProgressBar = this.generateProgressBar.bind(this);
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
        const { publishedRunsById } = this.props;
        let techPairs = generateTechPairs(publishedRunsById);
        let apgExamples = generateApgExamples(publishedRunsById, techPairs);
        this.setState({ techPairs, apgExamples });
    }

    generateTechPairTableHeaders() {
        return this.state.techPairs.map(({ browser, at }) => {
            return (
                <th
                    scope="col"
                    key={`${at} with ${browser}`}
                    className="text-center text-wrap"
                >
                    {at}/{browser} Passing Tests
                </th>
            );
        });
    }

    generateProgressBar(percentage) {
        // NB: Manually style with bootstrap instead of using react-bootstrap
        // progress bars in order to improve screen reader output
        return (
            <div className="progress">
                <div
                    className="progress-bar bg-info"
                    style={{ width: `${percentage}%` }}
                >
                    {percentage}%
                </div>
            </div>
        );
    }

    generateTableRows() {
        const { apgExamples, techPairs } = this.state;
        let tableRows = [];

        let topLevelRowData = [
            <th key="High level pattern" scope="row">
                All Test Plans
            </th>
        ];

        techPairs.forEach(({ browser, at }, index) => {
            const percentage = calculateTotalPercentageForTechPair(
                apgExamples,
                index
            );

            topLevelRowData.push(
                <td key={`Percentage of ${at} with ${browser}`}>
                    {this.generateProgressBar(percentage)}
                </td>
            );
        });

        tableRows.push(
            <tr key="ARIA Design Pattern Examples">{topLevelRowData}</tr>
        );

        apgExamples.forEach(
            ({ exampleName, id, testsWithMetaDataIndexedByTechPair }) => {
                let exampleRow = [];
                exampleRow.push(
                    <th scope="row" key={`example-${exampleName}-name`}>
                        <a href={`/reports/test-plans/${id}`}>{exampleName}</a>
                    </th>
                );
                techPairs.forEach(({ browser, at }, techPairIndex) => {
                    const testsWithMetaData =
                        testsWithMetaDataIndexedByTechPair[techPairIndex];

                    if (testsWithMetaData.testsWithResults.length > 0) {
                        const percentage = calculatePercentage(
                            testsWithMetaData.passingRequiredAssertions,
                            testsWithMetaData.requiredAssertions
                        );
                        exampleRow.push(
                            <td key={`data-${exampleName}-${at}-${browser}`}>
                                {this.generateProgressBar(percentage)}
                            </td>
                        );
                    } else {
                        exampleRow.push(
                            <td
                                key={`data-${exampleName}-${at}-${browser}`}
                                aria-label={`No results`}
                            >
                                {formatNoResults()}
                            </td>
                        );
                    }
                });
                tableRows.push(<tr key={exampleName}>{exampleRow}</tr>);
            }
        );

        return tableRows;
    }

    render() {
        return (
            <Container as="main">
                <Helmet>
                    <title>ARIA-AT Reports</title>
                </Helmet>
                <h1>Summary Report</h1>
                { this.props.testVersion ?
                  <CurrentGitCommit
                    label="Results shown are from the most recent test version."
                    gitHash={this.props.testVersion.git_hash}
                    gitCommitMessage={this.props.testVersion.git_commit_msg}
                  /> : <></>}
                <Table bordered hover>
                    <caption>
                        This table shows the percentage of required passing
                        tests for all finalized test results for the most
                        recently tested version of the ARIA-AT tests. The first
                        row is a summary of results from all examples. All other
                        rows are the summary of results for a single example.
                    </caption>
                    <thead>
                        <tr>
                            <th key="design-pattern-examples">Test Plan</th>
                            {this.generateTechPairTableHeaders()}
                        </tr>
                    </thead>
                    <tbody>{this.generateTableRows()}</tbody>
                </Table>
            </Container>
        );
    }
}

ReportsPage.propTypes = {
    dispatch: PropTypes.func,
    publishedRunsById: PropTypes.object,
    testVersion: PropTypes.object
};

const mapStateToProps = state => {
    const { publishedRunsById, testVersions } = state.runs;
    let testVersion = null;
    if (publishedRunsById && testVersions) {
      const runs = Object.values(publishedRunsById);

      if (runs.length > 0) {
          testVersion = (testVersions || []).find(
              v => v.id === runs[0].test_version_id
          );
      }
    }
    return { publishedRunsById, testVersion };
};

export default connect(mapStateToProps)(ReportsPage);
