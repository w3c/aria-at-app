import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import { Octicon, Octicons } from 'octicons-react';
import nextId from 'react-id-generator';
import { getConflictsByTestResults } from '../../redux/actions/runs';
import { getIssuesByTestId } from '../../redux/actions/issues';

class StatusBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statuses: [
                /*
            {
                action: null,
                icon: 'info',
                message: '',
                variant: 'info',
                visible: false
            }
             */
            ]
        };
    }

    async componentDidMount() {
        const { dispatch, test, testerId } = this.props;
        let { statuses } = this.state;

        await dispatch(getConflictsByTestResults(test, testerId));
        await dispatch(getIssuesByTestId(test.id));

        const { conflicts, issues } = this.props;

        if (issues.length) {
            let variant = 'warning';
            let action = (
                <Button
                    className="ml-2"
                    variant={variant}
                    onClick={this.props.handleRaiseIssueClick}
                >
                    Review issues
                </Button>
            );
            let icon = 'alert';
            let message = 'This test has open issues.';
            statuses.push({
                action,
                icon,
                message,
                variant
            });
        }

        if (conflicts.length) {
            let variant = 'warning';
            let action = (
                <Button
                    className="ml-2"
                    variant={variant}
                    onClick={this.props.handleConflictsModalClick}
                >
                    Review Conflicts
                </Button>
            );
            let icon = 'alert';
            let message = 'This test has conflicting results.';
            statuses.push({
                action,
                icon,
                message,
                variant
            });
        }

        this.setState({
            statuses
        });
    }

    render() {
        const { statuses } = this.state;
        return statuses.map(({ action, icon, message, variant }) => {
            return (
                <Alert key={nextId()} variant={variant}>
                    <Octicon icon={Octicons[icon]} /> {message}
                    {action}
                </Alert>
            );
        });
    }
}

StatusBar.propTypes = {
    conflicts: PropTypes.array,
    dispatch: PropTypes.func,
    issues: PropTypes.array,
    run: PropTypes.object,
    test: PropTypes.object,
    testIndex: PropTypes.number,
    tests: PropTypes.array,
    testerId: PropTypes.number,
    handleCloseRunClick: PropTypes.func,
    handleNextTestClick: PropTypes.func,
    handlePreviousTestClick: PropTypes.func,
    handleRaiseIssueClick: PropTypes.func,
    handleRedoClick: PropTypes.func,
    handleConflictsModalClick: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const {
        runs: { conflictsByTestId, activeRunsById },
        issues: { issuesByTestId }
    } = state;
    const conflicts = conflictsByTestId[ownProps.test.id] || [];
    const issues = (issuesByTestId[ownProps.test.id] || []).filter(
        ({ closed }) => !closed
    );

    const tests = activeRunsById[ownProps.run.id].tests;
    return { conflicts, issues, tests };
};
export default connect(mapStateToProps, null)(StatusBar);
