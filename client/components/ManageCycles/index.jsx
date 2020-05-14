import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import ManageCycleRow from '@components/ManageCycleRow';
import { getTestCycles } from '../../actions/cycles';
import nextId from 'react-id-generator';

class ManageCycles extends Component {
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
                    <title>Test Management | ARIA-AT</title>
                </Helmet>
                <h2>Initiate a Test Cycle</h2>
                <Button as={Link} to="/cycles/new">
                    Initiate
                </Button>
                <h2 id={tableId}>Test Cycle Status</h2>
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
                        {Object.keys(cyclesById).map(cycleId => (
                            <ManageCycleRow
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
    cyclesById: PropTypes.object,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { cyclesById } = state.cycles;

    return { cyclesById };
};

export default connect(mapStateToProps)(ManageCycles);
