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
    calculateTotalObjectPercentage,
    findAndCalculatePercentage
} from './utils';

class ReportsPage extends Component {
    constructor() {
        super();
        this.state = {
            techMatrix: [[null]] // This is a matrix of ATs and Browsers
        };

        this.setTechPairsState = this.setTechPairsState.bind(this);
        this.generateTopLevelData = this.generateTopLevelData.bind(this);
        this.generateApgExampleRows = this.generateApgExampleRows.bind(this);
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

    setTechPairsState() {
        const { publishedRunsById } = this.props;
        let techMatrix = generateStateMatrix(publishedRunsById);
        this.setState({ techMatrix });
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
                    techPairHeaders.push(
                        <th
                            key={`${techMatrix[0][j]} with ${techMatrix[i][0]}`}
                        >
                            {techMatrix[0][j]} with {techMatrix[i][0]}
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
                            key={`Percentage of ${techMatrix[0][j]} with ${techMatrix[i][0]}`}
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

    generateApgExampleRows(apgExampleRows, techPairHeaders) {
        const { techMatrix } = this.state;
        const { publishedRunsById } = this.props;
        // Determine which columns should have percentages
        // for the published result
        publishedRunsById &&
            Object.values(publishedRunsById).forEach(run => {
                const tableRows = [];

                // Get the APG example row index
                const apgRowIndex = apgExampleRows.findIndex(row =>
                    row.key.includes(run.apg_example_name)
                );

                // Get the browser column index
                const headerColumnIndex = techPairHeaders.findIndex(
                    header =>
                        header.key.includes(run.at_name) &&
                        header.key.includes(run.browser_name)
                );

                const percentage = findAndCalculatePercentage(
                    techMatrix,
                    run.at_name,
                    run.browser_name,
                    run.apg_example_name
                );

                // Add new row
                if (apgRowIndex < 0) {
                    tableRows[0] = (
                        <td key={`example-${run.id}-${run.apg_example_name}`}>
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
                                    aria-label={`No results data for ${run.apg_example_name} on ${techPairHeaders[i].key}`}
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
                                <td key={dataEntry.key}>
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

    render() {
        const { techMatrix } = this.state;
        let techPairHeaders = [];
        let topLevelRowData = [];
        let apgExampleRows = [];

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
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Reports`}</title>
                </Helmet>
                <h1>Reports Page</h1>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>Design Pattern Examples</th>
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
