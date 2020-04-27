import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import { getTestCycles } from '../../actions/cycles';

class TesterHome extends Component {
    componentDidMount() {
        const { dispatch, cyclesById } = this.props;
        if (Object.keys(cyclesById).length === 0) {
            dispatch(getTestCycles());
        }
    }

    render() {
        const { cyclesById } = this.props;
        return (
            <Fragment>
                <h2>Test Cycles</h2>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Test Cycle</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>More Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(cyclesById).map(cycleId => (
                            <tr key={cycleId}>
                                <td>{cyclesById[cycleId].name}</td>
                                <td>{cyclesById[cycleId].date}</td>
                                <td>In Progress</td>
                                <td>
                                    <Button
                                        as={Link}
                                        to={`/cycle/${cycleId}/test-queue`}
                                    >
                                        Contribute Tests
                                    </Button>
                                </td>
                            </tr>
                        ))}
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
