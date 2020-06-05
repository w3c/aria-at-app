import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Table, Modal } from 'react-bootstrap';
import ManageCycleRow from '@components/ManageCycleRow';
import { getTestCycles, deleteCycle } from '../../actions/cycles';
import nextId from 'react-id-generator';

class ManageCycles extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmModal: false,
            deleteCycleId: undefined
        };

        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleModalCloseClick = this.handleModalCloseClick.bind(this);
        this.handleConfirmDeleteClick = this.handleConfirmDeleteClick.bind(
            this
        );
    }

    componentDidMount() {
        const { dispatch, cyclesById } = this.props;
        if (Object.keys(cyclesById).length === 0) {
            dispatch(getTestCycles());
        }
    }

    handleModalCloseClick() {
        this.setState({
            showConfirmModal: false
        });
    }

    handleDeleteClick(cycleId) {
        this.setState({
            showConfirmModal: true,
            deleteCycleId: cycleId
        });
    }

    handleConfirmDeleteClick() {
        const { dispatch } = this.props;
        dispatch(deleteCycle(this.state.deleteCycleId));
        this.setState({
            showConfirmModal: false,
            deleteCycleId: undefined
        });
    }

    render() {
        const { cyclesById } = this.props;

        let tableId = nextId('table_name_');

        let modalBody, modalTitle;
        if (this.state.deleteCycleId) {
            let cycle = cyclesById[this.state.deleteCycleId];
            modalTitle = (
                <>
                    Delete Cycle: <b>{cycle.name}</b>
                </>
            );
            modalBody = (
                <>
                    Deleting cycle <b>{cycle.name}</b> will delete all associate
                    runs and test results. You will not be able to undo this
                    delete.
                </>
            );
        }

        return (
            <Fragment>
                <Helmet>
                    <title>Test Management | ARIA-AT</title>
                </Helmet>
                <h1>Test Management</h1>
                <p>
                    Initiate a full test cycle or a partial test cycle and
                    assign testers to different test plan runs.
                </p>
                <Button as={Link} to="/cycles/new">
                    Initiate Test Cycle
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
                                handleDeleteClick={this.handleDeleteClick}
                            />
                        ))}
                    </tbody>
                </Table>
                <Modal
                    show={this.state.showConfirmModal}
                    onHide={this.handleModalCloseClick}
                    centered
                    animation={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalBody}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleModalCloseClick}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.handleConfirmDeleteClick}
                        >
                            Delete Cycle
                        </Button>
                    </Modal.Footer>
                </Modal>
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
