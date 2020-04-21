import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import CycleRow from '@components/CycleRow';
import { getTestCycles } from '../../actions/cycles';

class ManageCycles extends Component {
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
                <h2>Initiate a Test Cycle</h2>
                <Button as={Link} to="/initiate-cycle">
                    Initiate
                </Button>
                <h2>Test Cycle Status</h2>
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
                            <CycleRow
                                key={cycleId}
                                cycle={cyclesById[cycleId]}
                            />
                        ))}
                    </tbody>
                </Table>
            </Fragment>
        );
    }
}

ManageCycles.propTypes = {
    cyclesById: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { cyclesById } = state.cycles;
    return { cyclesById };
};

export default connect(mapStateToProps)(ManageCycles);
