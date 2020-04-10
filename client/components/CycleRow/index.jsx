import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { deleteCycle } from '../../actions/cycles';

class CycleRow extends Component {

    deleteCycle() {
        const { id } = this.props.cycle;

        // TODO: How do we call the delete cycle action..? :/
    }

    render() {
        const { name, date, id } = this.props.cycle;
        return (
            <tr>
              <td>{name}</td>
              <td>{date}</td>
              <td>In Progress</td>
              <td><Button onClick={this.deleteCycle}>Delete</Button></td>
            </tr>
        );
    }
}

CycleRow.propTypes = {
    cycle: PropTypes.object
};

export default CycleRow;
