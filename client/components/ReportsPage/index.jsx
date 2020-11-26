import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns } from '../../actions/runs';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFolder } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from 'react-bootstrap';

class ReportsPage extends Component {
    constructor() {
        super();
        this.state = {
            techMatrix: [[null]] // This is a matrix of ATs and Browsers
        };

        this.setTechPairsState = this.setTechPairsState.bind(this);
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

    selectTechPair(i, j) {
        const originalElement = this.state.techMatrix[i][j];
        const newElement = {
            ...originalElement,
            active: !originalElement['active']
        };
        const updatedRow = [
            ...this.state.techMatrix[i].slice(0, j),
            newElement,
            ...this.state.techMatrix[i].slice(j + 1)
        ];
        this.setState({
            techMatrix: [
                ...this.state.techMatrix.slice(0, i),
                updatedRow,
                ...this.state.techMatrix.slice(i + 1)
            ]
        });
    }

    setTechPairsState() {
        const { publishedRunsById } = this.props;

        this.setState(prevState => {
            let techMatrix = prevState.techMatrix;
            Object.values(publishedRunsById).forEach(
                ({ at_name, browser_name }) => {
                    // fill in the AT columns
                    if (!techMatrix[0].includes(at_name)) {
                        techMatrix[0].push(at_name);
                    }

                    // Set browser rows
                    if (!techMatrix.flat().includes(browser_name)) {
                        techMatrix.push([browser_name]);
                    }
                }
            );

            // Fill the browser roles
            for (let [i, row] of techMatrix.entries()) {
                if (row[0] !== null) {
                    techMatrix[i] = [
                        row[0],
                        ...Array(techMatrix[0].length - 1).fill(null)
                    ];
                }
            }

            Object.values(publishedRunsById).forEach(
                ({ at_name, browser_name, apg_example_name, tests }) => {
                    const colIdx = techMatrix[0].findIndex(
                        at => at === at_name
                    );
                    const rowIdx = techMatrix.findIndex(
                        browserRow => browserRow[0] === browser_name
                    );
                    const testsWithResults = tests.filter(
                        test => Object.keys(test.results).length > 0
                    );
                    const testsPassed = testsWithResults.filter(
                        test =>
                            Object.values(test.results)[0].result.status ===
                            'PASS'
                    );
                    if (techMatrix[rowIdx][colIdx] === null)
                        techMatrix[rowIdx][colIdx] = {
                            active: true,
                            tests: {}
                        };

                    techMatrix[rowIdx][colIdx]['tests'][apg_example_name] = {
                        total: testsWithResults.length,
                        pass: testsPassed.length
                    };
                }
            );

            return {
                techMatrix
            };
        });
    }

    render() {
        const { publishedRunsById } = this.props;
        const { techMatrix } = this.state;
        let techPairSelectors = [];
        let techPairHeaders = [];
        let apgExampleRows = [];
        let topLevelRowData = [
            <td key="High level pattern">
                <span>
                    <FontAwesomeIcon icon={faFolderOpen} />
                </span>
                ARIA Design Pattern Example
            </td>
        ];

        if (techMatrix.length > 1) {
            // Get the table headers by checking with at/browser
            // row/column is set to true in the techMatrix.
            // Start at i = 1 because the first row is ats only
            // Start at j = 1 because the first column is browsers only
            for (let i = 1; i < techMatrix.length; i++) {
                for (let j = 1; j < techMatrix[0].length; j++) {
                    if (techMatrix[i][j] !== null) {
                        techPairSelectors.push(
                            <div class="form-check form-check-inline">
                                <input
                                    type="checkbox"
                                    id={`${techMatrix[0][j]}-with-${techMatrix[i][0]}-checkbox`}
                                    name={`${techMatrix[0][j]}-with-${techMatrix[i][0]}`}
                                    checked={techMatrix[i][j]['active']}
                                    onChange={() => this.selectTechPair(i, j)}
                                    className="form-check-input"
                                ></input>
                                <label
                                    for={`${techMatrix[0][j]}-with-${techMatrix[i][0]}-checkbox`}
                                    className="form-check-label"
                                >
                                    {techMatrix[0][j]} with {techMatrix[i][0]}
                                </label>
                            </div>
                        );

                        techPairHeaders.push(
                            <th
                                key={`${techMatrix[0][j]} with ${techMatrix[i][0]}`}
                                className={
                                    techMatrix[i][j]['active'] ? '' : 'd-none'
                                }
                            >
                                {techMatrix[0][j]} with {techMatrix[i][0]}
                            </th>
                        );

                        const topLevelColumnObj = Object.values(
                            techMatrix[i][j]['tests']
                        ).reduce(
                            (acc, { total, pass }) => {
                                acc.total += total;
                                acc.pass += pass;
                                return acc;
                            },
                            { total: 0, pass: 0 }
                        );

                        const percentage = Math.trunc(
                            (topLevelColumnObj.pass / topLevelColumnObj.total) *
                                100
                        );

                        // The math for the top level row works by adding all the passing values
                        // for each test plan and dividing by the total of all the totals
                        topLevelRowData.push(
                            <td
                                key={`Percentage of ${techMatrix[0][j]} with ${techMatrix[i][0]}`}
                                className={
                                    techMatrix[i][j]['active'] ? '' : 'd-none'
                                }
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

            apgExampleRows.push(
                <tr key="ARIA Design Pattern Examples">{topLevelRowData}</tr>
            );

            // Determine which columns should have percentages
            // for the published result
            publishedRunsById &&
                Object.values(publishedRunsById).forEach(run => {
                    const tableRows = [];
                    const apgRowIndex = apgExampleRows.findIndex(row =>
                        row.key.includes(run.apg_example_name)
                    );
                    const headerColumnIndex = techPairHeaders.findIndex(
                        header =>
                            header.key.includes(run.at_name) &&
                            header.key.includes(run.browser_name)
                    );
                    const techMatrixCol = techMatrix[0].findIndex(
                        at_name => at_name === run.at_name
                    );
                    const techMatrixrow = techMatrix.findIndex(
                        browserRow => browserRow[0] === run.browser_name
                    );

                    // The math for the rows works by taking all the passing tests
                    // and dividing by total number of tests with results
                    const percentage = Math.trunc(
                        (techMatrix[techMatrixrow][techMatrixCol]['tests'][
                            run.apg_example_name
                        ].pass /
                            techMatrix[techMatrixrow][techMatrixCol]['tests'][
                                run.apg_example_name
                            ].total) *
                            100
                    );

                    // Add new column
                    if (apgRowIndex < 0) {
                        tableRows[0] = (
                            <td
                                key={`example-${run.id}-${run.apg_example_name}`}
                            >
                                <span>
                                    <FontAwesomeIcon icon={faFolder} />
                                </span>
                                {run.apg_example_name}
                            </td>
                        );
                        for (let i = 0; i < techPairHeaders.length; i++) {
                            if (i === headerColumnIndex) {
                                tableRows.push(
                                    <td
                                        key={`data-${run.id}-${run.apg_example_name}-${techPairHeaders[headerColumnIndex].key}`}
                                        className={
                                            techMatrix[techMatrixrow][
                                                techMatrixCol
                                            ]['active']
                                                ? ''
                                                : 'd-none'
                                        }
                                    >
                                        <ProgressBar
                                            now={percentage}
                                            variant="info"
                                            label={`${percentage}%`}
                                        />
                                    </td>
                                );
                            } else {
                                tableRows.push(
                                    <td
                                        key={`data-${run.id}-${run.apg_example_name}-${techPairHeaders[i].key}`}
                                        className={
                                            techMatrix[techMatrixrow][
                                                techMatrixCol
                                            ]['active']
                                                ? ''
                                                : 'd-none'
                                        }
                                    >
                                        -
                                    </td>
                                );
                            }
                        }
                        apgExampleRows.push(
                            <tr key={`${run.id}-${run.apg_example_name}`}>
                                {tableRows}
                            </tr>
                        );
                    } else {
                        // If the row already exists, update the column with percent
                        let apgExampleRow = apgExampleRows[apgRowIndex];
                        let dataEntries = [];
                        for (let dataEntry of apgExampleRow.props.children) {
                            if (
                                dataEntry.key.includes(run.at_name) &&
                                dataEntry.key.includes(run.browser_name)
                            ) {
                                dataEntries.push(
                                    <td
                                        key={dataEntry.key}
                                        className={
                                            techMatrix[techMatrixrow][
                                                techMatrixCol
                                            ]['active']
                                                ? ''
                                                : 'd-none'
                                        }
                                    >
                                        <ProgressBar
                                            now={percentage}
                                            variant="info"
                                            label={`${percentage}%`}
                                        />
                                    </td>
                                );
                            } else {
                                dataEntries.push(dataEntry);
                            }
                        }
                        apgExampleRows[apgRowIndex] = (
                            <tr key={`${run.id}-${run.apg_example_name}`}>
                                {dataEntries}
                            </tr>
                        );
                    }
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
