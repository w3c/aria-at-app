import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import CycleRow from '@components/CycleRow';
import { getTestCycles } from '../../actions/cycles';

class ManageCycles extends Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getTestCycles());
    }

    render() {
        const { cycles } = this.props;
        return (
            <Fragment>
                <h2>Initiate a Test Cycle</h2>
                <Link to="/initiate-cycle">Initiate</Link>
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
                        {cycles.map(cycle => (
                            <CycleRow key={cycle.id} cycle={cycle} />
                        ))}
                    </tbody>
                </Table>
            </Fragment>
        );
    }
}

ManageCycles.propTypes = {
    cycles: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { cycles } = state.cycles;
    return { cycles };
};

export default connect(mapStateToProps)(ManageCycles);
