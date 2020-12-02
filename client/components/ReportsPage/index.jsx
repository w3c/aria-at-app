import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns } from '../../actions/runs';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFileAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from 'react-bootstrap';
import {
    generateTechPairs,
    generateApgExamples,
    calculateTotalPercentageForTechPair,
    calculatePercentage,
    formatFraction,
    formatInteger
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
        this.generateTechPairSelectors = this.generateTechPairSelectors.bind(
            this
        );
        this.selectTechPair = this.selectTechPair.bind(this);
    }

    componentDidMount() {
        const { dispatch, publishedRunsById } = this.props;
        if (!publishedRunsById) {
            dispatch(getPublishedRuns());
        } else {
            this.generateInitialStateFromRuns();
        }
    }

    componentDidUpdate(prevProps) {
        const { publishedRunsById } = this.props;
        if (publishedRunsById !== prevProps.publishedRunsById) {
            this.generateInitialStateFromRuns();
        }
    }

    selectTechPair(i) {
        this.setState({
            techPairs: [
                ...this.state.techPairs.slice(0, i),
                Object.assign(this.state.techPairs[i], {
                    active: !this.state.techPairs[i]['active']
                }),
                ...this.state.techPairs.slice(i + 1)
            ]
        });
    }

    generateInitialStateFromRuns() {
        const { publishedRunsById } = this.props;
        let techPairs = generateTechPairs(publishedRunsById);
        let apgExamples = generateApgExamples(publishedRunsById, techPairs);
        this.setState({ techPairs, apgExamples });
    }

    generateTechPairSelectors() {
        return this.state.techPairs.map(({ browser, at, active }, index) => {
            return (
                <div
                    className="form-check form-check-inline"
                    key={`${at}-with-${browser}`}
                >
                    <input
                        type="checkbox"
                        id={`${at}-with-${browser}-checkbox`}
                        name={`${at}-with-${browser}`}
                        checked={active}
                        onChange={() => this.selectTechPair(index)}
                        className="form-check-input"
                    ></input>
                    <label
                        htmlFor={`${at}-with-${browser}-checkbox`}
                        className="form-check-label"
                    >
                        {`${at} with ${browser}`}
                    </label>
                </div>
            );
        });
    }

    generateTechPairTableHeaders() {
        return this.state.techPairs
            .filter(({ active }) => active)
            .map(({ browser, at }) => {
                return (
                    <th key={`${at} with ${browser}`} colSpan={4}>
                        <h3 className="text-center">
                            {at} with {browser}
                        </h3>
                        <p className="text-center">Passing Required Tests</p>
                    </th>
                );
            });
    }

    generateTableRows() {
        const { apgExamples, techPairs } = this.state;
        let tableRows = [];

        let topLevelRowData = [
            <td key="High level pattern">
                <span>
                    <FontAwesomeIcon icon={faFolderOpen} />
                </span>
                ARIA Design Pattern Example
            </td>
        ];

        techPairs.forEach(({ browser, at, active }, index) => {
            if (active) {
                const percentage = calculateTotalPercentageForTechPair(
                    apgExamples,
                    index
                );

                topLevelRowData.push(
                    <td key={`Percentage of ${at} with ${browser}`} colSpan={4}>
                        <ProgressBar
                            now={percentage}
                            variant="info"
                            label={`${percentage}%`}
                        />
                    </td>
                );
            }
        });

        tableRows.push(
            <tr key="ARIA Design Pattern Examples">{topLevelRowData}</tr>
        );

        apgExamples.forEach(
            ({
                exampleName,
                testNames,
                testsWithMetaDataIndexedByTechPair
            }) => {
                let exampleRow = [];
                exampleRow.push(
                    <td key={`example-${exampleName}`} rowSpan={2}>
                        <span className="ml-3">
                            <FontAwesomeIcon icon={faFolderOpen} />
                        </span>
                        {exampleName}
                    </td>
                );
                techPairs.forEach(({ browser, at, active }, techPairIndex) => {
                    if (active) {
                        const testsWithMetaData =
                            testsWithMetaDataIndexedByTechPair[techPairIndex];

                        if (testsWithMetaData.testsWithResults.length > 0) {
                            const percentage = calculatePercentage(
                                testsWithMetaData.passingRequiredAssertions,
                                testsWithMetaData.requiredAssertions
                            );
                            exampleRow.push(
                                <td
                                    key={`data-${exampleName}-${at}-${browser}`}
                                    colSpan={4}
                                >
                                    <ProgressBar
                                        now={percentage}
                                        variant="info"
                                        label={`${percentage}%`}
                                    />
                                </td>
                            );
                        } else {
                            exampleRow.push(
                                <td
                                    key={`data-${exampleName}-${at}-${browser}`}
                                    aria-label={`No results data for ${exampleName} on ${at} with ${browser}`}
                                    colSpan={4}
                                >
                                    -
                                </td>
                            );
                        }
                    }
                });

                tableRows.push(<tr key={exampleName}>{exampleRow}</tr>);

                let testStatHeaderRow = [];
                techPairs
                    .filter(pair => pair.active)
                    .forEach(({ browser, at }) => {
                        testStatHeaderRow.push(
                            <td
                                key={`stat-header-required$-${exampleName}-${at}-${browser}`}
                            >
                                Required
                            </td>
                        );
                        testStatHeaderRow.push(
                            <td
                                key={`stat-header-optional-${exampleName}-${at}-${browser}`}
                            >
                                Optional
                            </td>
                        );
                        testStatHeaderRow.push(
                            <td
                                key={`stat-header-unexpected-${exampleName}-${at}-${browser}`}
                            >
                                Unexpected Behavior
                            </td>
                        );
                        testStatHeaderRow.push(
                            <td
                                key={`stat-header-link-${exampleName}-${at}-${browser}`}
                                aria-label="Link to detailed test report"
                            >
                            </td>
                        );
                    });

                tableRows.push(
                    <tr key={`${exampleName}-stat-headers`}>
                        {testStatHeaderRow}
                    </tr>
                );

                testNames.forEach((testName, i) => {
                    let testRow = [
                        <td key={`${exampleName}-${testName}`}>
                            <span className="ml-5">
                                <FontAwesomeIcon icon={faFileAlt} />
                                {testName}
                            </span>
                        </td>
                    ];

                    techPairs.forEach(
                        ({ browser, at, active }, techPairIndex) => {
                            if (active) {
                                const testsWithMetaData =
                                    testsWithMetaDataIndexedByTechPair[
                                        techPairIndex
                                    ];
                                const testWithResults = testsWithMetaData.testsWithResults.find(
                                    t => t.testName === testName
                                );

                                if (testWithResults) {
                                    const {
                                        requiredAssertions,
                                        passingRequiredAssertions,
                                        optionalAssertions,
                                        passingOptionalAssertions,
                                        unexpectedBehaviors,
                                        runId,
                                        executionOrder
                                    } = testWithResults;
                                    testRow.push(
                                        <td
                                            key={`${exampleName}-${testName}-${i}-${at}-${browser}-required`}
                                        >
                                            {formatFraction(
                                                passingRequiredAssertions,
                                                requiredAssertions
                                            )}
                                        </td>
                                    );
                                    testRow.push(
                                        <td
                                            key={`${exampleName}-${testName}-${i}-${at}-${browser}-optional`}
                                        >
                                            {formatFraction(
                                                passingOptionalAssertions,
                                                optionalAssertions
                                            )}
                                        </td>
                                    );
                                    testRow.push(
                                        <td
                                            key={`${exampleName}-${testName}-${i}-${at}-${browser}-unexpected`}
                                        >
                                            {formatInteger(unexpectedBehaviors)}
                                        </td>
                                    );
                                    testRow.push(
                                        <td
                                            key={`${exampleName}-${testName}-${i}-${at}-${browser}-link`}
                                        >
                                          <a href={`/results/run/${runId}#test-${executionOrder}`} target="blank" aria-label={`Detailed Test Report for ${testName} ${at} ${browser}`}><FontAwesomeIcon icon={faExternalLinkAlt} /></href>
                                        </td>
                                    );
                                } else {
                                    testRow.push(
                                        <td
                                            key={`${exampleName}-${testName}-${i}-${at}-${browser}`}
                                            colSpan={4}
                                        >
                                            skipped
                                        </td>
                                    );
                                }
                            }
                        }
                    );
                    tableRows.push(
                        <tr key={`${exampleName}-${testName}-${i}-row`}>
                            {testRow}
                        </tr>
                    );
                });

                let supportRow = [];
                techPairs.forEach(({ browser, at, active }, techPairIndex) => {
                    if (active) {
                        const testsWithMetaData =
                            testsWithMetaDataIndexedByTechPair[techPairIndex];
                        const {
                            requiredAssertions,
                            passingRequiredAssertions,
                            optionalAssertions,
                            passingOptionalAssertions,
                            unexpectedBehaviors
                        } = testsWithMetaData;
                        supportRow.push(
                            <td
                                key={`${exampleName}-${browser}-${at}-support-required`}
                            >
                                {formatFraction(
                                    passingRequiredAssertions,
                                    requiredAssertions
                                )}
                            </td>
                        );
                        supportRow.push(
                            <td
                                key={`${exampleName}-${browser}-${at}-support-optional`}
                            >
                                {formatFraction(
                                    passingOptionalAssertions,
                                    optionalAssertions
                                )}
                            </td>
                        );
                        supportRow.push(
                            <td
                                key={`${exampleName}-${browser}-${at}-support-unexpected`}
                            >
                                {formatInteger(unexpectedBehaviors)}
                            </td>
                        );
                        supportRow.push(
                            <td
                                key={`${exampleName}-${browser}-${at}-support-link`}
                            >
                            </td>
                        );
                    }
                });
                tableRows.push(
                    <tr key={`${exampleName}-support`}>
                        <td>
                            <span className="ml-5">Support</span>
                        </td>
                        {supportRow}
                    </tr>
                );
            }
        );
        return tableRows;
    }

    render() {
        return (
            <Fragment>
                <Helmet>
                    <title>ARIA-AT Reports</title>
                </Helmet>
                <h1>Reports Page</h1>
                <h2>Available AT and Browser Combinations</h2>
                <form className="mb-3">{this.generateTechPairSelectors()}</form>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>
                                <h2>Design Pattern Examples</h2>
                            </th>
                            {this.generateTechPairTableHeaders()}
                        </tr>
                    </thead>
                    <tbody>{this.generateTableRows()}</tbody>
                </Table>
            </Fragment>
        );
    }
}

ReportsPage.propTypes = {
    dispatch: PropTypes.func,
    publishedRunsById: PropTypes.object
};

const mapStateToProps = state => {
    const { publishedRunsById } = state.runs;
    return { publishedRunsById };
};

export default connect(mapStateToProps)(ReportsPage);
