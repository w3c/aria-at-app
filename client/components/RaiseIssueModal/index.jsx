import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';
import {
    getConflictsByTestResults,
    getIssuesByTestId,
    createIssue
} from '../../actions/cycles';
import IssueCards from './IssueCards';
import MarkdownEditor from './MarkdownEditor';
import formatConflictsAsText from '../../utils/formatConflictsAsText';
import './RaiseIssueModal.css';

const REPO_LINK = `https://github.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`;

function createIssueDefaults(test, cycle, run, sha) {
    const title = `Tester issue report for: "${test.name}"`;
    let body = `
### Test file at exact commit

[${test.file}](https://github.com/w3c/aria-at/blob/${sha}/${test.file})

### Cycle:

${cycle.name} (${cycle.date})

### AT:

${run.at_name} (version ${run.at_version})

### Browser:

${run.browser_name} (version ${run.browser_version})

### Description

Type your description here.

`;

    return { title, body };
}

function appendConflicts(body, conflicts, testerId) {
    const useMarkdown = true;
    return `
${body}

### Conflicts with other results

${formatConflictsAsText(conflicts, testerId, useMarkdown)}

`;
}

class RaiseIssueModal extends Component {
    constructor(props) {
        super(props);

        const { test, cycle, run, git_hash, userId } = this.props;
        const { title, body } = createIssueDefaults(
            test,
            cycle,
            run,
            git_hash,
            userId
        );
        this.state = {
            isReady: false,
            showCreateIssue: false,
            showCreateIssueResult: false,
            title,
            body
        };

        this.onHide = this.onHide.bind(this);
        this.onCreateNewIssueClick = this.onCreateNewIssueClick.bind(this);
        this.onCreateNewIssueSubmit = this.onCreateNewIssueSubmit.bind(this);
        this.onIssueChange = this.onIssueChange.bind(this);
    }

    async componentDidMount() {
        const { dispatch, test, testerId } = this.props;

        await dispatch(getConflictsByTestResults(test, testerId));
        await dispatch(getIssuesByTestId(test.id));

        const { conflicts } = this.props;

        const body = this.props.conflicts.length
            ? appendConflicts(this.state.body, conflicts, testerId)
            : this.state.body;

        this.setState({
            body,
            showCreateIssue: !this.props.issues.length,
            isReady: true
        });
    }

    onHide() {
        this.setState({
            showCreateIssue: false,
            showCreateIssueResult: false
        });

        this.props.onHide();
    }

    onCreateNewIssueClick() {
        this.setState({
            showCreateIssue: true
        });
    }

    async onCreateNewIssueSubmit(event) {
        event.preventDefault();
        const { dispatch, issues, run, test } = this.props;
        const { title, body } = this.state;
        const data = {
            run_id: run.id,
            test_id: test.id,
            title,
            body
        };
        const issuesCount = issues.length;

        await dispatch(createIssue(data));

        if (issuesCount < this.props.issuesByTestId[test.id].length) {
            this.setState({
                showCreateIssueResult: true
            });
        }
    }

    onIssueChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    renderIssues() {
        const { onHide, onCreateNewIssueClick } = this;
        const { issues = [] } = this.props;

        return [
            'Review existing issues',
            <IssueCards key="render-issues-cards" issues={issues} />,
            <Fragment key="render-issues-buttons">
                <Button variant="secondary" onClick={onHide}>
                    My issue exists in this list
                </Button>
                <Button variant="primary" onClick={onCreateNewIssueClick}>
                    My issue is not in this list
                </Button>
            </Fragment>
        ];
    }

    renderCreateIssueForm() {
        const { onHide, onCreateNewIssueSubmit, onIssueChange } = this;
        const { issues = [] } = this.props;
        const { body, title } = this.state;

        const onBackClick = () => {
            this.setState({
                showCreateIssue: false,
                showCreateIssueResult: false
            });
        };
        return [
            'Create an issue',
            <Form key="create-issue-form" onSubmit={onCreateNewIssueSubmit}>
                <Form.Group controlId="create-an-issue-title">
                    <Form.Control
                        autoFocus
                        as="input"
                        name="title"
                        onChange={onIssueChange}
                        defaultValue={title}
                    />
                </Form.Group>
                <Form.Group controlId="create-an-issue-body">
                    <MarkdownEditor
                        name="body"
                        onChange={onIssueChange}
                        defaultValue={body}
                    />
                </Form.Group>
            </Form>,
            <Fragment key="create-issue-form-buttons">
                {issues.length ? (
                    <Button
                        variant="secondary"
                        className="float-left"
                        onClick={onBackClick}
                    >
                        Back to issues list
                    </Button>
                ) : null}
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={onCreateNewIssueSubmit}
                >
                    Submit new issue
                </Button>
            </Fragment>
        ];
    }

    renderCreateIssueResult() {
        const { onHide } = this;
        const { issues } = this.props;
        const issue = issues[issues.length - 1];
        return [
            'Issue created',
            <p key="create-issue-result-body">
                <a href={`${REPO_LINK}/issues/${issue.number}`} target="_blank">
                    Issue #{issue.number} created
                </a>
            </p>,
            <Button
                key="create-issue-result-button"
                variant="primary"
                onClick={onHide}
            >
                Done
            </Button>
        ];
    }

    renderCreateIssue() {
        return this.state.showCreateIssueResult
            ? this.renderCreateIssueResult()
            : this.renderCreateIssueForm();
    }

    render() {
        const { onHide } = this;
        const { issues, show } = this.props;
        const { isReady, showCreateIssue } = this.state;

        if (!isReady || !show) {
            return null;
        }

        if (!showCreateIssue && !issues.length) {
            this.setState({ showCreateIssue: true });
            return null;
        }

        const [title, body, footer] = showCreateIssue
            ? this.renderCreateIssue()
            : this.renderIssues();

        const role = 'dialog';
        return (
            <Modal
                aria-labelledby="raise-issue-modal-title"
                aria-modal="true"
                keyboard
                scrollable
                dialogClassName="modal-xl"
                onHide={onHide}
                role={role}
                show={show}
                tabIndex={-1}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="raise-issue-modal-title">
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{body}</Modal.Body>
                <Modal.Footer>{footer}</Modal.Footer>
            </Modal>
        );
    }
}

RaiseIssueModal.propTypes = {
    at_key: PropTypes.string,
    conflicts: PropTypes.array,
    cycle: PropTypes.object,
    cycleId: PropTypes.number,
    dispatch: PropTypes.func,
    git_hash: PropTypes.string,
    issues: PropTypes.array,
    issuesByTestId: PropTypes.object,
    onHide: PropTypes.func,
    run: PropTypes.object,
    show: PropTypes.bool,
    test: PropTypes.object,
    testIndex: PropTypes.number,
    userId: PropTypes.number,
    testerId: PropTypes.number
};

const mapStateToProps = (state, ownProps) => {
    const {
        cycles: { conflictsByTestId, cyclesById, issuesByTestId }
    } = state;

    const conflicts = conflictsByTestId[ownProps.test.id];
    const cycle = cyclesById[ownProps.cycleId] || {};
    const issues = (issuesByTestId[ownProps.test.id] || []).filter(
        ({ closed }) => !closed
    );
    return { conflicts, cycle, issues, issuesByTestId };
};
export default connect(mapStateToProps, null)(RaiseIssueModal);
