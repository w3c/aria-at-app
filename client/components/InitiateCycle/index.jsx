import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { getTestSuiteVersions, saveCycle } from '../../actions/cycles';
import { getAllUsers } from '../../actions/users';
import ConfigureTechnologyRow from '@components/ConfigureTechnologyRow';
import ConfigureRunsForExample from '@components/ConfigureRunsForExample';
import nextId from 'react-id-generator';

// This is a temporary solution. Eventually this data will come from an admin page.
function getDefaultsTechCombinations(versionData) {
    let combos = [
        ['JAWS', 'Chrome'],
        ['JAWS', 'Firefox'],
        ['NVDA', 'Chrome'],
        ['NVDA', 'Firefox'],
        ['VoiceOver for macOS', 'Chrome'],
        ['VoiceOver for macOS', 'Safari']
    ];

    let initialRunRows = [];
    for (let combo of combos) {
        let at = versionData.supported_ats.find(at => at.at_name === combo[0]);
        let at_id = at ? at.at_id : undefined;

        let browser = versionData.browsers.find(b => b.name === combo[1]);
        let browser_id = browser ? browser.id : undefined;

        if (at_id && browser_id) {
            initialRunRows.push({
                at_id,
                browser_id
            });
        }
    }

    return initialRunRows.length ? initialRunRows : [{}];
}

class InitiateCycle extends Component {
    constructor(props) {
        super(props);
        const { testSuiteVersions } = props;

        let testSuiteVersionId = testSuiteVersions.length
            ? testSuiteVersions[0].id
            : undefined;
        this.state = {
            selectedVersion: testSuiteVersionId,
            name: '',
            runTechnologyRows: [{}], // list of {at_id, at_version, browser_id, browser_version}
            assignedTesters: [], // list of {at_id, browser_id, example_id, tester_id}
            exampleSelected: this.selectAllExamples(testSuiteVersionId)
        };

        // This is a temporary fix until we have an admin page to control the defaults
        if (testSuiteVersions.length) {
            this.state.runTechnologyRows = getDefaultsTechCombinations(
                testSuiteVersions[0]
            );
        }

        this.handleVersionChange = this.handleVersionChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleTechnologyRowChange = this.handleTechnologyRowChange.bind(
            this
        );
        this.deleteTechnologyRow = this.deleteTechnologyRow.bind(this);
        this.addTechnologyRow = this.addTechnologyRow.bind(this);
        this.assignTesters = this.assignTesters.bind(this);
        this.removeAllTestersFromRun = this.removeAllTestersFromRun.bind(this);
        this.selectExample = this.selectExample.bind(this);
        this.initiateCycle = this.initiateCycle.bind(this);
    }

    componentDidMount() {
        const { dispatch, testSuiteVersions, usersById } = this.props;

        if (!testSuiteVersions.length) {
            dispatch(getTestSuiteVersions());
        }
        if (!Object.keys(usersById).length) {
            dispatch(getAllUsers());
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // When we get the testSuiteVersions list for the first time, the application automatically
        // selected the most recent version
        if (
            prevState.selectedVersion === undefined &&
            nextProps.testSuiteVersions.length > 0
        ) {
            let versionId = nextProps.testSuiteVersions[0].id;
            let version = nextProps.testSuiteVersions[0];
            let exampleSelected = {};
            for (let example of version.apg_examples) {
                exampleSelected[example.id] = true;
            }

            return {
                selectedVersion: versionId,
                exampleSelected,
                runTechnologyRows: getDefaultsTechCombinations(version)
            };
        }
        return null;
    }

    selectAllExamples(testSuiteVersionId) {
        const { testSuiteVersions } = this.props;
        if (!testSuiteVersions.length) {
            return {};
        }
        let version = testSuiteVersions.find(v => v.id === testSuiteVersionId);
        let exampleSelected = {};
        for (let example of version.apg_examples) {
            exampleSelected[example.id] = true;
        }
        return exampleSelected;
    }

    selectExample(event) {
        const value = event.target.checked;
        const apgExampleId = parseInt(event.target.name);
        this.setState({
            exampleSelected: {
                ...this.state.exampleSelected,
                [apgExampleId]: value
            }
        });
    }

    initiateCycle() {
        const { dispatch, testSuiteVersions, history, user } = this.props;
        let versionData = testSuiteVersions.filter(
            version => version.id === this.state.selectedVersion
        )[0];

        let cycle = {
            name: this.state.name,
            test_version_id: this.state.selectedVersion,
            created_user_id: user.id
        };

        // Do not allow saving of cycle without a name. Put focus on name field
        if (!this.state.name || this.state.name === '') {
            this.nameInput.focus();
            return;
        }

        const runs = [];
        for (
            let index = 0;
            index < this.state.runTechnologyRows.length;
            index++
        ) {
            const runTechnologyPair = this.state.runTechnologyRows[index];

            if (
                !runTechnologyPair.at_id ||
                !runTechnologyPair.at_version ||
                !runTechnologyPair.browser_id ||
                !runTechnologyPair.browser_version
            ) {
                // TODO: if one of these fields is not filled out, put focus on field
                // TODO: if ALL of these fields are blank, ignore it
                continue;
            }

            for (let example of versionData.apg_examples) {
                if (!this.state.exampleSelected[example.id]) {
                    continue;
                }

                let testers = this.state.assignedTesters
                    .filter(t => {
                        return (
                            t.example_id === example.id &&
                            t.at_id === runTechnologyPair.at_id &&
                            t.browser_id === runTechnologyPair.browser_id
                        );
                    })
                    .map(t => t.tester_id);

                runs.push({
                    ...runTechnologyPair,
                    apg_example_id: example.id,
                    users: testers
                });
            }
        }

        if (runs.length === 0) {
            window.alert(
                "TODO: Make sure it's clear to user you need to fill in the AT/Browser fields all the way"
            );
            return;
        }

        cycle.runs = runs;
        dispatch(saveCycle(cycle));

        history.push('/cycles');
    }

    assignTesters(exampleId, runTechnologyIndexes, userId) {
        let newAssignedTesters = [...this.state.assignedTesters];

        for (let techIndex of runTechnologyIndexes) {
            let techs = this.state.runTechnologyRows[techIndex];
            newAssignedTesters.push({
                at_id: techs.at_id,
                browser_id: techs.browser_id,
                example_id: exampleId,
                tester_id: userId
            });
        }

        this.setState({
            assignedTesters: newAssignedTesters
        });
    }

    removeAllTestersFromRun(exampleId, runTechnologyIndexes) {
        let newAssignedTesters = [...this.state.assignedTesters];

        for (let techIndex of runTechnologyIndexes) {
            let techs = this.state.runTechnologyRows[techIndex];
            newAssignedTesters = newAssignedTesters.filter(t => {
                return !(
                    t.at_id === techs.at_id &&
                    t.browser_id === techs.browser_id &&
                    t.example_id === exampleId
                );
            });
        }

        this.setState({
            assignedTesters: newAssignedTesters
        });
    }

    handleVersionChange(event) {
        const { testSuiteVersions } = this.props;

        let versionData = testSuiteVersions.filter(
            version => version.id === parseInt(event.currentTarget.value)
        )[0];

        this.setState({
            selectedVersion: versionData.id,
            assignedTesters: [],
            exampleSelected: this.selectAllExamples(versionData.id),
            runTechnologyRows: getDefaultsTechCombinations(versionData)
        });
    }

    handleNameChange(event) {
        this.setState({
            name: event.currentTarget.value
        });
    }

    handleTechnologyRowChange(runTechnologies, index) {
        let newRunTechnologies = [];
        for (let i = 0; i < this.state.runTechnologyRows.length; i++) {
            if (i === index) {
                newRunTechnologies.push(runTechnologies);
            } else {
                newRunTechnologies.push({ ...this.state.runTechnologyRows[i] });
            }
        }
        this.setState({
            runTechnologyRows: newRunTechnologies
        });
    }

    addTechnologyRow() {
        let newRunTechnologies = [...this.state.runTechnologyRows];
        newRunTechnologies.push({});
        this.setState({
            runTechnologyRows: newRunTechnologies
        });
    }

    deleteTechnologyRow(index) {
        let newRunTechnologies = [...this.state.runTechnologyRows];
        newRunTechnologies.splice(index, 1);
        this.setState({
            runTechnologyRows: newRunTechnologies
        });
    }

    renderTestVersionSelect() {
        const { testSuiteVersions } = this.props;

        return (
            <Form.Control
                data-test="initiate-cycle-commit-select"
                value={this.state.selectedVersion}
                onChange={this.handleVersionChange}
                as="select"
            >
                {testSuiteVersions.map(version => {
                    return (
                        <option key={version.id} value={version.id}>
                            {version.git_hash.slice(0, 7) +
                                ' - ' +
                                version.git_commit_msg.slice(0, 30) +
                                '...'}
                        </option>
                    );
                })}
            </Form.Control>
        );
    }

    render() {
        const { testSuiteVersions, usersById } = this.props;

        if (!testSuiteVersions.length) {
            return <div data-test="initiate-cycle-loading">Loading</div>;
        }

        let versionData = testSuiteVersions.filter(
            version => version.id === this.state.selectedVersion
        )[0];

        let runs = [];
        if (versionData) {
            for (let i = 0; i < this.state.runTechnologyRows.length; i++) {
                let row = this.state.runTechnologyRows[i];

                // Skip rows that don't have both browser and at
                if (row.at_id === undefined || row.browser_id === undefined) {
                    continue;
                }

                let { at_name, at_name_id } = versionData.supported_ats.find(
                    at => {
                        return row.at_id === at.at_id;
                    }
                );

                let browser_name = versionData.browsers.find(b => {
                    return row.browser_id === b.id;
                }).name;

                runs.push({
                    id: i,
                    at_name: at_name,
                    at_name_id: at_name_id,
                    browser_name: browser_name,
                    at_id: row.at_id,
                    browser_id: row.browser_id
                });
            }
        }

        let displayExamples = false;
        if (
            this.state.runTechnologyRows.filter(run => {
                return run.at_id && run.browser_id;
            }).length
        ) {
            displayExamples = true;
        }

        let selectedPatterns = versionData.apg_examples
            .filter(e => {
                return this.state.exampleSelected[e.id];
            })
            .map(e => {
                return e.name || e.directory;
            });
        let disableInitiateButton =
            selectedPatterns.length === 0 || !displayExamples;

        let listSelectedPatterns = null;
        if (displayExamples) {
            if (selectedPatterns.length) {
                listSelectedPatterns = (
                    <div>
                        The following patterns have been selected for testing:{' '}
                        {`${selectedPatterns.join(', ')}`}
                    </div>
                );
            } else {
                listSelectedPatterns = (
                    <div>No patterns have been selected for testing.</div>
                );
            }
        }

        return (
            <Fragment>
                <h1 data-test="initiate-cycle-h2">Initiate a Test Cycle</h1>
                <h2 data-test="initiate-cycle-h3">Test Cycle Configuration</h2>
                <Form className="init-box">
                    <Row>
                        <Col>
                            <Form.Group controlId="cycleName">
                                <Form.Label data-test="initiate-cycle-name-label">
                                    Test Cycle Name
                                </Form.Label>
                                <Form.Control
                                    data-test="initiate-cycle-name-input"
                                    value={this.state.name}
                                    onChange={this.handleNameChange}
                                    ref={input => {
                                        this.nameInput = input;
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="testVersion">
                                <Form.Label data-test="initiate-cycle-commit-label">
                                    Git Commit of Tests
                                </Form.Label>
                                {this.renderTestVersionSelect()}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Table
                            aria-label="Configure at/browser combinations for cycle"
                            striped
                            bordered
                            hover
                        >
                            <thead>
                                <tr>
                                    <th>Assistive Technology</th>
                                    <th>AT Version</th>
                                    <th>Browser</th>
                                    <th>Browser Version</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {versionData &&
                                    this.state.runTechnologyRows.map(
                                        (runTech, index) => {
                                            return (
                                                <ConfigureTechnologyRow
                                                    key={index}
                                                    runTechnologies={runTech}
                                                    index={index}
                                                    availableAts={
                                                        versionData.supported_ats
                                                    }
                                                    availableBrowsers={
                                                        versionData.browsers
                                                    }
                                                    handleTechnologyRowChange={
                                                        this
                                                            .handleTechnologyRowChange
                                                    }
                                                    deleteTechnologyRow={
                                                        this.deleteTechnologyRow
                                                    }
                                                />
                                            );
                                        }
                                    )}
                            </tbody>
                        </Table>
                    </Row>
                    <Row>
                        <Col>
                            <Button onClick={this.addTechnologyRow}>
                                Add another AT/Browser
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <h2 data-test="initiate-cycle-test-plans">Test Plans</h2>
                {displayExamples &&
                    versionData.apg_examples.map(example => {
                        let exampleRuns = runs.map(run => {
                            let exampleRun = { ...run };
                            exampleRun.testers = this.state.assignedTesters
                                .filter(t => {
                                    return (
                                        t.example_id === example.id &&
                                        t.at_id === run.at_id &&
                                        t.browser_id === run.browser_id
                                    );
                                })
                                .map(t => t.tester_id);
                            return exampleRun;
                        });
                        let tableId = nextId('table_name_');
                        let exampleTableTitle =
                            example.name || example.directory;

                        return (
                            <Fragment key={`test-plan-${example.id}`}>
                                <h3 id={tableId}>
                                    <input
                                        type="checkbox"
                                        id={`designpattern-${example.id}`}
                                        name={example.id}
                                        checked={
                                            this.state.exampleSelected[
                                                example.id
                                            ]
                                        }
                                        onChange={this.selectExample}
                                    ></input>
                                    {exampleTableTitle}
                                </h3>
                                <ConfigureRunsForExample
                                    data-test={`initiate-cycle-run-${example.id}`}
                                    newRun={true}
                                    runs={exampleRuns}
                                    key={example.id}
                                    example={example}
                                    usersById={usersById}
                                    assignTesters={this.assignTesters}
                                    removeAllTestersFromRun={
                                        this.removeAllTestersFromRun
                                    }
                                    tableId={tableId}
                                />
                            </Fragment>
                        );
                    })}
                {!displayExamples && (
                    <div>
                        You must have at least one AT/Browser combination
                        configured to review the test plans and initiate the
                        cycle.
                    </div>
                )}
                {listSelectedPatterns}
                <div>
                    <Button
                        disabled={disableInitiateButton}
                        onClick={this.initiateCycle}
                    >
                        Initiate Cycle
                    </Button>
                </div>
            </Fragment>
        );
    }
}

InitiateCycle.propTypes = {
    testSuiteVersions: PropTypes.array,
    dispatch: PropTypes.func,
    history: PropTypes.object,
    usersById: PropTypes.object,
    user: PropTypes.object
};

const mapStateToProps = state => {
    const { testSuiteVersions } = state.cycles;
    const { usersById } = state.users;
    const { user } = state;
    return { testSuiteVersions, usersById, user };
};

export default connect(mapStateToProps)(InitiateCycle);
