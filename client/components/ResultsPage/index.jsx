import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getTestCycles, getTestsForRunsCycle } from '../../actions/cycles';
import nextId from 'react-id-generator';

class ResultsPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch, cyclesById, fetchCycleResults } = this.props;

        if (!Object.keys(cyclesById).length) {
            dispatch(getTestCycles());
        }

        if (fetchCycleResults.length) {
            for (let cycleId of fetchCycleResults) {
                dispatch(getTestsForRunsCycle(cycleId));
            }
        }
    }

    componentDidUpdate(prevProps) {
        const { dispatch, fetchCycleResults } = this.props;

        // If we now know which cycle's results to fetch, fetch them
        if (fetchCycleResults.length !== prevProps.fetchCycleResults.length) {
            for (let cycleId of this.props.fetchCycleResults) {
                dispatch(getTestsForRunsCycle(cycleId));
            }
        }
        return null;
    }

    renderRow(row) {
        return (
            <tr key={nextId()}>
                <td>{row.cycle}</td>
                <td>{`${row.at} ${row.at_version}`}</td>
                <td>{`${row.browser} ${row.browser_version}`}</td>
                <td>
                    <Link
                        to={`/results/cycles/${row.cycleId}/run/${row.runId}`}
                    >
                        {row.plan}
                    </Link>
                </td>
                <td>{row.status}</td>
            </tr>
        );
    }

    render() {
        const { cyclesById } = this.props;

        if (!Object.keys(cyclesById).length) {
            return <div>Loading</div>;
        }

        const rowsData = [];

        let cyclesByNewest = Object.keys(cyclesById).sort(function(a, b) {
            return parseInt(b) - parseInt(a);
        });

        for (let cycleId of cyclesByNewest) {
            let cycle = cyclesById[cycleId];
            for (let run of Object.values(cycle.runsById)) {
                if (run.run_status === 'final' || run.run_status === 'draft') {
                    rowsData.push({
                        cycle: cycle.name,
                        cycleId: cycle.id,
                        runId: run.id,
                        at: run.at_name,
                        at_version: run.at_version,
                        browser: run.browser_name,
                        browser_version: run.browser_version,
                        plan: run.apg_example_name,
                        status: run.run_status
                    });
                }
            }
        }

        let tableId = nextId('table_name_');
        let content;
        if (rowsData.length) {
            content = (
                <Table aria-labelledby={tableId} striped bordered hover>
                    <thead>
                        <tr>
                            <th>Test Cycle</th>
                            <th>Assistive Technology</th>
                            <th>Browser</th>
                            <th>Test Plan</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>{rowsData.map(row => this.renderRow(row))}</tbody>
                </Table>
            );
        } else {
            content = <p>There are no results in a draft or final state.</p>;
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Results`}</title>
                </Helmet>
                <h1 id={tableId}>Test Reports</h1>
                {content}
            </Fragment>
        );
    }
}

ResultsPage.propTypes = {
    cyclesById: PropTypes.object,
    testsByRunId: PropTypes.object,
    fetchCycleResults: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { cyclesById, testsByRunId } = state.cycles;

    let fetchCycleResults = Object.keys(cyclesById);

    return {
        cyclesById,
        testsByRunId,
        fetchCycleResults
    };
};

export default connect(mapStateToProps)(ResultsPage);
