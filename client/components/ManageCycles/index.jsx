import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class ManageCycles extends Component {
    render() {
        const { cycles } = this.props;
        console.log("printing test cycles from props");
        console.log(cycles);

        if (cycles.length === 0) {
            return <div>This will be replaced with a list/table of existing test cycles and their states</div>;
        }
        else {
            return <div>DATAAAA: {cycles[0].name}</div>;
        }
    }
}

ManageCycles.propTypes = {
    cycles: PropTypes.array
};

const mapStateToProps = state => {
    const { cycles } = state.cycles;
    return { cycles };
};

export default connect(mapStateToProps)(ManageCycles);
