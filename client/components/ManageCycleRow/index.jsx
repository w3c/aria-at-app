import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

class ManageCycleRow extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { name, date, id } = this.props.cycle;
        const handleDeleteClick = this.props.handleDeleteClick;

        return (
            <tr>
                <td>
                    <Link to={`/cycles/${id}`}>{name}</Link>
                </td>
                <td>{date}</td>
                <td>In Progress</td>
                <td>
                    <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(id)}
                    >
                        Delete
                    </Button>
                </td>
            </tr>
        );
    }
}

ManageCycleRow.propTypes = {
    cycle: PropTypes.object,
    handleDeleteClick: PropTypes.func,
    dispatch: PropTypes.func
};

export default connect()(ManageCycleRow);
