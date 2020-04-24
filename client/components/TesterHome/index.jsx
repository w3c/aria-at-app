import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import { getTestCycles } from '../../actions/cycles';

class TesterHome extends Component {
    componentDidMount() {
        const { dispatch, cycles } = this.props;
        if (cycles.length === 0) {
            dispatch(getTestCycles());
        }
    }

    render() {
        const { cycles } = this.props;
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
                        {cycles.map(cycle => (
                            <tr key={cycle.id}>
                                <td>{cycle.name}</td>
                                <td>{cycle.date}</td>
                                <td>In Progress</td>
                                <td>
                                    <Button
                                        as={Link}
                                        to={`/cycle/${cycle.id}/test-queue`}
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
    cycles: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { cycles } = state.cycles;
    return { cycles };
};

export default connect(mapStateToProps)(TesterHome);
