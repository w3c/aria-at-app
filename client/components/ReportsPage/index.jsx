import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns } from '../../actions/runs';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFolder } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from 'react-bootstrap';
import {
    generateStateMatrix,
    generateTechPairs,
    generateApgExamples,
    calculateTotalObjectPercentage,
} from './utils';

class ReportsPage extends Component {
    constructor() {
        super();
        this.state = {
            techMatrix: [[null]], // This is a matrix of ATs and Browsers
            techPairs: [],
            apgExamples: []
        };

        this.setTechPairsState = this.setTechPairsState.bind(this);
        this.generateTopLevelData = this.generateTopLevelData.bind(this);
        this.generateApgExampleRows = this.generateApgExampleRows.bind(this);
        this.selectTechPair = this.selectTechPair.bind(this);
    }

    componentDidMount() {
        const { dispatch, publishedRunsById } = this.props;
        if (!publishedRunsById) {
            dispatch(getPublishedRuns());
        } else {
            this.setTechPairsState();
        }
    }

    componentDidUpdate(prevProps) {
        const { publishedRunsById } = this.props;
        if (publishedRunsById !== prevProps.publishedRunsById) {
            this.setTechPairsState();
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

    setTechPairsState() {
        const { publishedRunsById } = this.props;
        let techMatrix = generateStateMatrix(publishedRunsById);
        let techPairs = generateTechPairs(techMatrix);
        let apgExamples = generateApgExamples(publishedRunsById);
        this.setState({ techMatrix, techPairs, apgExamples });
    }

    generateTopLevelData() {
        const { techMatrix } = this.state;

        let techPairHeaders = [];
        let topLevelRowData = [
            <td key="High level pattern">
                <span>
                    <FontAwesomeIcon icon={faFolderOpen} />
                </span>
                ARIA Design Pattern Example
            </td>
        ];

        // Get the table headers by checking which at/browser
        // row/column is set to an object in the techMatrix.
        // Start at i = 1 because the first row is ats only
        // Start at j = 1 because the first column is browsers only
        for (let i = 1; i < techMatrix.length; i++) {
            for (let j = 1; j < techMatrix[0].length; j++) {
                if (techMatrix[i][j] !== null) {
                    let at = techMatrix[0][j];
                    let browser = techMatrix[i][0];
                    let techPair = this.state.techPairs.find(
                        pair => pair.browser === browser && pair.at === at
                    );
                    techPairHeaders.push(
                        <th
                            key={`${at} with ${browser}`}
                            className={techPair.active ? '' : 'd-none'}
                            colspan={3}
                        >
                            {at} with {browser}
                        </th>
                    );

                    // Calculate the percentage of this top level column
                    const percentage = calculateTotalObjectPercentage(
                        techMatrix[i][j]
                    );

                    // The math for the top level row works by adding all the passing values
                    // for each test plan and dividing by the total of all the totals
                    topLevelRowData.push(
                        <td
                            key={`Percentage of ${at} with ${browser}`}
                            className={techPair.active ? '' : 'd-none'}
                            colspan={3}
                        >
                            <ProgressBar
                                now={percentage}
                                variant="info"
                                label={`${percentage}%`}
                            />
                        </td>
                    );
                }
            }
        }
        return { techPairHeaders, topLevelRowData };
    }

    generateApgExampleRows(apgExampleRows) {
        const { techMatrix, apgExamples, techPairs } = this.state;
        const { publishedRunsById } = this.props;
        const runs = Object.values(publishedRunsById);

        apgExamples.forEach(apgExample => {
            let row = [];
            row.push(
                <td key={`example-${apgExample}`}>
                    <span>
                        <FontAwesomeIcon icon={faFolder} />
                    </span>
                    {apgExample}
                </td>
            );
            techPairs
                .filter(pair => pair.active)
                .forEach(pair => {
                    let techMatrixExample =
                        techMatrix[pair.techMatrixRow][pair.techMatrixColumn][
                            apgExample
                        ];
                    if (techMatrixExample) {
                        let percentage = Math.trunc(
                            (techMatrixExample.pass / techMatrixExample.total) *
                                100
                        );
                        row.push(
                            <td
                                key={`data-${apgExample}-${pair.at}-${pair.browser}`}
                                colspan={3}
                            >
                                <ProgressBar
                                    now={percentage}
                                    variant="info"
                                    label={`${percentage}%`}
                                />
                            </td>
                        );
                    } else {
                        row.push(
                            <td
                                key={`data-${apgExample}-${pair.at}-${pair.browser}`}
                                aria-label={`No results data for ${apgExample} on ${pair.at} with ${pair.browser}`}
                                colspan={3}
                            >
                                -
                            </td>
                        );
                    }
                });
            apgExampleRows.push(<tr key={apgExample}>{row}</tr>);

            const exampleRuns = runs.filter(r => r.apg_example_name === apgExample);
            const tests = exampleRuns[0].tests;
            tests.forEach(test => {
              let testRow = [<td key={`${apgExample}-${test.name}`}>{test.name}</td>];
              techPairs
                  .filter(pair => pair.active)
                  .forEach(pair => {
                    const run = exampleRuns.find(r => r.browser_name === pair.browser && r.at_name === pair.at);
                    const results = Object.values(test.results || {});
                    // TODO: Also check for conflicts if there are conflicts
                    // don't show results
                    //
                    // TODO: Is it even possible for their to be conflicts??? I
                    // feel like there shouldn't be for published results!!?
                    const result = results.find(result => result.status === 'complete');

                    if (result) {
                      const details = result.result.details;
                      const required =
                          details.summary[1].pass + details.summary[1].fail > 0
                              ? `${details.summary[1].pass} / ${details.summary[1].fail +
                                    details.summary[1].pass}`
                              : '-';

                      const optional =
                          details.summary[2].pass + details.summary[2].fail > 0
                              ? `${details.summary[2].pass} / ${details.summary[2].fail +
                                    details.summary[1].pass}`
                              : '-';
                      testRow.push(<td>{required}</td>);
                      testRow.push(<td>{optional}</td>);
                      testRow.push(<td>{details.summary.unexpectedCount}</td>);
                    } else {
                      testRow.push(<td colspan={3}></td>);
                    }

              });
              apgExampleRows.push(<tr key={`${apgExample}-${test.name}`}>{testRow}</tr>)
            });
        });
    }

    render() {
        const { techMatrix } = this.state;
        let techPairHeaders = [];
        let topLevelRowData = [];
        let apgExampleRows = [];
        let techPairSelectors = [];

        // Generate the data table only if there is data
        if (techMatrix.length > 1) {
            const topLevelData = this.generateTopLevelData();
            techPairHeaders = topLevelData.techPairHeaders;
            topLevelRowData = topLevelData.topLevelRowData;

            // Set the very first row
            apgExampleRows.push(
                <tr key="ARIA Design Pattern Examples">{topLevelRowData}</tr>
            );

            this.generateApgExampleRows(apgExampleRows, techPairHeaders);

            this.state.techPairs.forEach((techPair, index) => {
                techPairSelectors.push(
                    <div
                        className="form-check form-check-inline"
                        key={`${techPair['at']}-with-${techPair['browser']}`}
                    >
                        <input
                            type="checkbox"
                            id={`${techPair['at']}-with-${techPair['browser']}-checkbox`}
                            name={`${techPair['at']}-with-${techPair['browser']}`}
                            checked={techPair['active']}
                            onChange={() => this.selectTechPair(index)}
                            className="form-check-input"
                        ></input>
                        <label
                            htmlFor={`${techPair['at']}-with-${techPair['browser']}-checkbox`}
                            className="form-check-label"
                        >
                            {`${techPair['at']} with ${techPair['browser']}`}
                        </label>
                    </div>
                );
            });
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Reports`}</title>
                </Helmet>
                <h1>Reports Page</h1>
                <h2>Available AT and Browser Combinations</h2>
                <form className="mb-3">{techPairSelectors}</form>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>
                                <h2>Design Pattern Examples</h2>
                            </th>
                            {techPairHeaders}
                        </tr>
                    </thead>
                    <tbody>{apgExampleRows}</tbody>
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
