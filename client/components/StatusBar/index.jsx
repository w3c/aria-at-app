import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
import { Octicon, Octicons } from 'octicons-react';
import nextId from 'react-id-generator';
import {
    getConflictsByTestResults,
    getIssuesByTestId
} from '../../actions/cycles';

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
        const { dispatch, test, tests, testerId } = this.props;
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

        const result =
            test.results &&
            Object.values(test.results).find(
                ({ test_id, user_id }) =>
                    test_id === test.id && user_id === testerId
            );

        if (result && result.status === 'complete') {
            let variant = 'info';
            let action = (
                <ButtonGroup className="ml-2">
                    {this.props.testIndex > 1 ? (
                        <Button
                            variant={variant}
                            onClick={this.props.handlePreviousTestClick}
                        >
                            Previous
                        </Button>
                    ) : null}
                    <Button
                        variant={variant}
                        onClick={this.props.handleCloseRunClick}
                    >
                        Close
                    </Button>
                    {this.props.testIndex < tests.length ? (
                        <Button
                            variant={variant}
                            onClick={this.props.handleNextTestClick}
                        >
                            Next test
                        </Button>
                    ) : null}
                </ButtonGroup>
            );
            let icon = 'info';
            let message = 'This test is complete.';
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
    cycle: PropTypes.object,
    cycleId: PropTypes.number,
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
        cycles: { conflictsByTestId, issuesByTestId, testsByRunId }
    } = state;
    const conflicts = conflictsByTestId[ownProps.test.id] || [];
    const issues = (issuesByTestId[ownProps.test.id] || []).filter(
        ({ closed }) => !closed
    );

    const tests = testsByRunId[ownProps.run.id];
    return { conflicts, issues, tests };
};
export default connect(mapStateToProps, null)(StatusBar);
