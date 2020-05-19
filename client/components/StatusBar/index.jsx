import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import { Octicon, Octicons } from 'octicons-react';
import {
    getConflictsByCycleId,
    getIssuesByTestId,
    getResultsByCycleId
} from '../../actions/cycles';

class StatusBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            action: null,
            icon: 'info',
            message: '',
            variant: 'info',
            visible: false
        };
    }

    async componentDidMount() {
        const { cycle, dispatch, test } = this.props;
        let { action, icon, message, variant, visible } = this.state;

        await dispatch(getIssuesByTestId(test.id));
        // TODO: Make these actually do something
        await dispatch(getConflictsByCycleId(cycle.Id));
        await dispatch(getResultsByCycleId(cycle.Id));

        if (this.props.issues.length) {
            action = (
                <Button
                    variant="warning"
                    onClick={this.props.handleRaiseIssueClick}
                >
                    Review issues
                </Button>
            );
            message = 'This test has open issues.';
            variant = 'warning';
            visible = true;
        }

        // TODO: Not implemented
        if (this.props.conflicts.length) {
            action = (
                <Button variant="warning" onClick={this.props.handleRedoClick}>
                    Re-do Test
                </Button>
            );
            message = 'This test has conflicting results.';
            variant = 'warning';
            visible = true;
        }

        // TODO: Not implemented
        if (this.props.results.length) {
            action = (
                <Button variant="info" onClick={this.props.handleCloseRunClick}>
                    Close
                </Button>
            );
            message = 'This test is complete.';
            variant = 'info';
            visible = true;
        }

        this.setState({
            action,
            icon,
            message,
            variant,
            visible
        });
    }

    render() {
        const { action, icon, message, variant, visible } = this.state;

        if (!visible) {
            return null;
        }

        return (
            <Alert variant={variant}>
                <Octicon icon={Octicons[icon]} /> {message}
                {action}
            </Alert>
        );
    }
}

StatusBar.propTypes = {
    conflicts: PropTypes.array,
    cycle: PropTypes.object,
    cycleId: PropTypes.number,
    dispatch: PropTypes.func,
    issues: PropTypes.array,
    results: PropTypes.array,
    run: PropTypes.object,
    test: PropTypes.object,
    handleCloseRunClick: PropTypes.func,
    handleRaiseIssueClick: PropTypes.func,
    handleRedoClick: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const {
        cycles: { cyclesById, issuesByTestId }
    } = state;
    const cycle = cyclesById[ownProps.cycleId] || {};
    const issues = (issuesByTestId[ownProps.test.id] || []).filter(
        ({ closed }) => !closed
    );

    // These are placeholders for the next
    // iteration of this component.
    const conflicts = [];
    const results = [];

    return { conflicts, cycle, issues, results };
};
export default connect(mapStateToProps, null)(StatusBar);
