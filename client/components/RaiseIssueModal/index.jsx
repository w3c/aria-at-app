import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { createTestPlanRunIssue } from '../../network';
import IssueCards from './IssueCards';
import MarkdownEditor from './MarkdownEditor';
import { evaluateAtNameKey } from '../../utils/aria';
import formatConflictsAsText from '../../utils/formatConflictsAsText';
import './RaiseIssueModal.css';

function createIssueDefaults(
    test,
    testPlanRun,
    conflicts,
    userId,
    isReportViewer = false
) {
    const title = `${
        isReportViewer ? "Report Viewer's" : "Tester's"
    } Issue Report For "${test.title}"`;
    let body = `### Test File at exact Commit

[${test.testFilePath}](https://aria-at.w3.org/aria-at/${
        testPlanRun.testPlanReport.testPlanVersion.gitSha
    }/${test.testFilePath}?at=${evaluateAtNameKey(
        testPlanRun.testPlanReport.testPlanTarget.at.name
    )})

### AT

${testPlanRun.testPlanReport.testPlanTarget.at.name} (version ${
        testPlanRun.testPlanReport.testPlanTarget.atVersion
    })

### Browser

${testPlanRun.testPlanReport.testPlanTarget.browser.name} (version ${
        testPlanRun.testPlanReport.testPlanTarget.browserVersion
    })

### Description

_type your description here_`;

    if (conflicts.length) body = appendConflicts(body, conflicts, userId);
    return { title, body };
}

function appendConflicts(body, conflicts, userId) {
    const useMarkdown = true;
    return `${body}

### Conflicts with other results

${formatConflictsAsText(conflicts, userId, useMarkdown)}
`;
}

const RaiseIssueModal = ({
    show = false,
    userId,
    test = {},
    testPlanRun = {},
    issues = [],
    conflicts = [],
    isReportViewer = false,
    handleUpdateTestPlanRunResultAction = () => {},
    handleClose = () => {}
}) => {
    const { title, body } = createIssueDefaults(
        test,
        testPlanRun,
        conflicts,
        userId,
        isReportViewer
    );
    const [showCreateIssue, setShowCreateIssue] = useState(!issues.length);
    const [createdIssueNumber, setCreatedIssueNumber] = useState(-1);
    const [showCreateIssueResult, setShowCreateIssueResult] = useState(false);
    const [fields, setFields] = useState({
        title,
        body
    });

    const onCreateNewIssueClick = () => setShowCreateIssue(true);

    const onCreateNewIssueSubmit = async e => {
        e.preventDefault();

        // shadow top level
        const { title, body } = fields;

        const result = await createTestPlanRunIssue({ title, body });
        if (result && result.number) {
            // FIXME: This causes an unsightly flicker
            await handleUpdateTestPlanRunResultAction({
                issues: [result.number]
            });

            setCreatedIssueNumber(result.number);
            setShowCreateIssueResult(true);
        }
    };

    const onFieldChange = e => {
        setFields({ ...fields, [e.target.name]: e.target.value });
    };

    const onBackClick = () => {
        setShowCreateIssue(false);
        setShowCreateIssueResult(false);
    };

    const onHideButtonClick = async () => {
        // reset issue template when closing the issue modal
        onBackClick();
        await handleClose();
    };

    const renderExistingIssues = () => {
        return [
            'Review Existing Issues',
            <IssueCards key="render-issues-cards" issues={issues} />,
            <Fragment key="render-issues-buttons">
                <Button variant="secondary" onClick={onHideButtonClick}>
                    My Issue exists in this list
                </Button>
                <Button variant="primary" onClick={onCreateNewIssueClick}>
                    My Issue is not in this list
                </Button>
            </Fragment>
        ];
    };

    const renderCreateIssueForm = () => {
        return [
            'Create An Issue',
            <Form key="create-issue-form" onSubmit={onCreateNewIssueSubmit}>
                <Form.Group controlId="create-an-issue-title">
                    <Form.Control
                        autoFocus
                        as="input"
                        name="title"
                        onChange={onFieldChange}
                        defaultValue={title}
                    />
                </Form.Group>
                <Form.Group controlId="create-an-issue-body">
                    <MarkdownEditor
                        name="body"
                        onChange={onFieldChange}
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
                        Back to Issues List
                    </Button>
                ) : null}
                <Button variant="secondary" onClick={onHideButtonClick}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onCreateNewIssueSubmit}>
                    Submit New Issue
                </Button>
            </Fragment>
        ];
    };

    const renderCreateIssueResult = () => {
        const REPO_LINK = `https://github.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`;
        return [
            'Issue created',
            <p key="create-issue-result-body">
                <a
                    href={`${REPO_LINK}/issues/${createdIssueNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Issue #{createdIssueNumber} created
                </a>
            </p>,
            <Button
                key="create-issue-result-button"
                variant="primary"
                onClick={onHideButtonClick}
            >
                Done
            </Button>
        ];
    };

    const renderCreateIssue = () =>
        showCreateIssueResult
            ? renderCreateIssueResult()
            : renderCreateIssueForm();

    const [renderedTitle, renderedBody, renderedFooter] = showCreateIssue
        ? renderCreateIssue()
        : renderExistingIssues();

    return (
        <Modal
            show={show}
            role="dialog"
            tabIndex={-1}
            keyboard
            scrollable
            dialogClassName="modal-xl"
            aria-modal="true"
            aria-labelledby="raise-issue-modal"
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title id="raise-issue-modal-title">
                    {renderedTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>{renderedBody}</Modal.Body>
            <Modal.Footer>{renderedFooter}</Modal.Footer>
        </Modal>
    );
};

RaiseIssueModal.propTypes = {
    show: PropTypes.bool,
    userId: PropTypes.any,
    test: PropTypes.object,
    testPlanRun: PropTypes.object,
    issues: PropTypes.array,
    conflicts: PropTypes.array,
    isReportViewer: PropTypes.bool,
    handleUpdateTestPlanRunResultAction: PropTypes.func,
    handleClose: PropTypes.func
};

export default RaiseIssueModal;
