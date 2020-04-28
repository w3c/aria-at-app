import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { deleteCycle } from '../../actions/cycles';

class ManageCycleRow extends Component {
    constructor(props) {
        super(props);
        this.deleteCycle = this.deleteCycle.bind(this);
    }

    deleteCycle() {
        const { cycle, dispatch } = this.props;
        dispatch(deleteCycle(cycle.id));
    }

    render() {
        const { name, date, id } = this.props.cycle;
        return (
            <tr>
                <td>
                    <Link to={`/cycles/${id}`}>{name}</Link>
                </td>
                <td>{date}</td>
                <td>In Progress</td>
                <td>
                    <Button onClick={this.deleteCycle}>Delete</Button>
                </td>
            </tr>
        );
    }
}

ManageCycleRow.propTypes = {
    cycle: PropTypes.object,
    dispatch: PropTypes.func
};

export default connect()(ManageCycleRow);
