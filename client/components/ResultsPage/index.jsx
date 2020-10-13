import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getPublishedRuns } from '../../actions/runs';
import nextId from 'react-id-generator';

class ResultsPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch, publishedRunsById } = this.props;

        if (!publishedRunsById) {
            dispatch(getPublishedRuns());
        }
    }

    renderRow(row) {
        return (
            <tr key={nextId()}>
                <td>{`${row.at} ${row.at_version}`}</td>
                <td>{`${row.browser} ${row.browser_version}`}</td>
                <td>
                    <Link
                        to={`/results/run/${row.runId}`}
                    >
                        {row.plan}
                    </Link>
                </td>
                <td>{row.status}</td>
            </tr>
        );
    }

    render() {
        const { publishedRunsById } = this.props;

        if (!publishedRunsById || !Object.keys(publishedRunsById).length) {
            return <div>Loading</div>;
        }

        const rowsData = [];

      for (let run of Object.values(publishedRunsById)) {
        rowsData.push({
          runId: run.id,
          at: run.at_name,
          at_version: run.at_version,
          browser: run.browser_name,
          browser_version: run.browser_version,
          plan: run.apg_example_name,
          status: run.run_status
        });
      }

        let tableId = nextId('table_name_');
        let content;
        if (rowsData.length) {
            content = (
                <Table aria-labelledby={tableId} striped bordered hover>
                    <thead>
                        <tr>
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
    publishedRunsById: PropTypes.object,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { publishedRunsById } = state.runs;

    return {
        publishedRunsById
    };
};

export default connect(mapStateToProps)(ResultsPage);
