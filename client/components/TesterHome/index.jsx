import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import { getTestCycles } from '../../actions/cycles';
import nextId from 'react-id-generator';

class TesterHome extends Component {
    componentDidMount() {
        const { dispatch, cyclesById } = this.props;
        if (Object.keys(cyclesById).length === 0) {
            dispatch(getTestCycles());
        }
    }

    render() {
        const { cyclesById } = this.props;

        let tableId = nextId('table_name_');

        return (
            <Fragment>
                <Helmet>
                    <title>Test Queue (for all cycles) | ARIA-AT</title>
                </Helmet>
                <h2 id={tableId}>Test Cycles</h2>
                <Table aria-labelledby={tableId} striped bordered hover>
                    <thead>
                        <tr>
                            <th>Test Cycle</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>More Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(cyclesById).map(cycleId => {
                            const name = cyclesById[cycleId].name;
                            const date = cyclesById[cycleId].date;
                            return (
                                <tr key={cycleId}>
                                    <td>{name}</td>
                                    <td>{date}</td>
                                    <td>In Progress</td>
                                    <td>
                                        <Button
                                            as={Link}
                                            to={`/test-queue/${cycleId}`}
                                            aria-label={`Contribute tests to cycle: ${name}`}
                                        >
                                            Contribute Tests
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Fragment>
        );
    }
}

TesterHome.propTypes = {
    cyclesById: PropTypes.object,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { cyclesById } = state.cycles;
    return { cyclesById };
};

export default connect(mapStateToProps)(TesterHome);
