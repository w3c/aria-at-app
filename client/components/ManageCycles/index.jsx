import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import ManageCycleRow from '@components/ManageCycleRow';
import { getTestCycles } from '../../actions/cycles';
import { Redirect } from 'react-router-dom';

class ManageCycles extends Component {
    componentDidMount() {
        const { dispatch, cyclesById } = this.props;
        if (Object.keys(cyclesById).length === 0) {
            dispatch(getTestCycles());
        }
    }

    render() {
        const { cyclesById, isAdmin } = this.props;

        if (!isAdmin) {
            return <Redirect to={{ pathname: '/'}} />;
        }

        return (
            <Fragment>
                <Helmet>
                    <title>Test Management | ARIA-AT</title>
                </Helmet>
                <h2>Initiate a Test Cycle</h2>
                <Button as={Link} to="/cycles/new">
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
    dispatch: PropTypes.func,
    isAdmin: PropTypes.bool
};

const mapStateToProps = state => {
    const { roles } = state.login;
    const { cyclesById } = state.cycles;

    let isAdmin = roles ? roles.includes('admin') : false;

    return { cyclesById, isAdmin };
};

export default connect(mapStateToProps)(ManageCycles);
