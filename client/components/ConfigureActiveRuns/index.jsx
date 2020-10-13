import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import {
    saveRunConfiguration,
    getActiveRunConfiguration,
    getTestVersions
} from '../../actions/runs';
import ConfigureTechnologyRow from '@components/ConfigureTechnologyRow';

function selectExamples(testVersion, activeRunConfiguration) {
    let exampleSelected = {};
    for (let example of testVersion.apg_examples) {
        let selected = true;
        // If we are looking at the currently configured test version, select
        // only the currently configured apg examples, otherwise select all by default.
        if (
            testVersion.id === activeRunConfiguration.active_test_version.id &&
            activeRunConfiguration.active_apg_examples.indexOf(example.id) ===
                -1
        ) {
            selected = false;
        }
        exampleSelected[example.id] = selected;
    }
    return exampleSelected;
}

function getDefaultsTechCombinations(testVersion, activeRunConfiguration) {
    let initialRunRows = [];
    for (let combo of activeRunConfiguration.active_at_browser_pairs) {
        let at = testVersion.supported_ats.find(
            at => at.at_name_id === combo.at_name_id
        );
        let at_id = at ? at.at_id : undefined;

        if (at_id) {
            initialRunRows.push({
                at_id,
                at_version: combo.at_version,
                browser_id: combo.browser_id,
                browser_version: combo.browser_version
            });
        }
    }

    return initialRunRows.length ? initialRunRows : [{}];
}

class ConfigureActiveRuns extends Component {
    constructor(props) {
        super(props);
        const { testVersions, activeRunConfiguration } = props;

        let testVersionId =
            testVersions && testVersions.length
                ? testVersions[0].id
                : undefined;
        this.state = {
            selectedVersion: testVersionId,
            name: '',
            runTechnologyRows: [{}], // list of {at_id, at_version, browser_id, browser_version}
            exampleSelected: {}
        };

        if (activeRunConfiguration && testVersionId) {
            this.state.runTechnologyRows = getDefaultsTechCombinations(
                testVersions[0],
                activeRunConfiguration
            );
            this.state.exampleSelected = selectExamples(
                testVersions[0],
                activeRunConfiguration
            );
        }

        this.handleVersionChange = this.handleVersionChange.bind(this);
        this.handleTechnologyRowChange = this.handleTechnologyRowChange.bind(
            this
        );
        this.deleteTechnologyRow = this.deleteTechnologyRow.bind(this);
        this.addTechnologyRow = this.addTechnologyRow.bind(this);
        this.selectExample = this.selectExample.bind(this);
        this.configureActiveRuns = this.configureActiveRuns.bind(this);
    }

    componentDidMount() {
        const { dispatch, testVersions, activeRunConfiguration } = this.props;
        if (!testVersions) {
            dispatch(getTestVersions());
        }
        if (!activeRunConfiguration) {
            dispatch(getActiveRunConfiguration());
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // When we get the testSuiteVersions list for the first time, the application automatically
        // selected the most recent version
        if (
            prevState.selectedVersion === undefined &&
            nextProps.activeRunConfiguration &&
            nextProps.testVersions
        ) {
            let testVersionId = nextProps.testVersions[0].id;
            let testVersion = nextProps.testVersions[0];

            let exampleSelected = selectExamples(
                testVersion,
                nextProps.activeRunConfiguration
            );
            let runTechnologyRows = getDefaultsTechCombinations(
                testVersion,
                nextProps.activeRunConfiguration
            );
            return {
                selectedVersion: testVersionId,
                exampleSelected,
                runTechnologyRows
            };
        }
        return null;
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

    configureActiveRuns() {
        const { dispatch, testVersions } = this.props;
        let versionData = testVersions.filter(
            version => version.id === this.state.selectedVersion
        )[0];

        const atBrowserPairs = [];
        const atIdToAtNameId = versionData.supported_ats.reduce((acc, at) => {
            acc[at.at_id] = at.at_name_id;
            return acc;
        }, {});

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

            atBrowserPairs.push({
                at_name_id: atIdToAtNameId[runTechnologyPair.at_id],
                at_version: runTechnologyPair.at_version,
                browser_id: runTechnologyPair.browser_id,
                browser_version: runTechnologyPair.browser_version
            });
        }

        const config = {
            test_version_id: this.state.selectedVersion,
            apg_example_ids: versionData.apg_examples.map(a => a.id),
            at_browser_pairs: atBrowserPairs
        };

        dispatch(saveRunConfiguration(config));

        alert('You saved results! (...what should we do after saving?)');
    }

    handleVersionChange(event) {
        const { testVersions, activeRunConfiguration } = this.props;

        let versionData = testVersions.filter(
            version => version.id === parseInt(event.currentTarget.value)
        )[0];

        this.setState({
            selectedVersion: versionData.id,
            assignedTesters: [],
            exampleSelected: selectExamples(
                versionData,
                activeRunConfiguration
            ),
            runTechnologyRows: getDefaultsTechCombinations(
                versionData,
                activeRunConfiguration
            )
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
        const { testVersions } = this.props;

        return (
            <Form.Control
                data-test="configure-run-commit-select"
                value={this.state.selectedVersion}
                onChange={this.handleVersionChange}
                as="select"
            >
                {testVersions.map(version => {
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
        const { testVersions, activeRunConfiguration } = this.props;

        if (!testVersions || !activeRunConfiguration) {
            return <div data-test="configure-run-loading">Loading</div>;
        }

        let versionData = testVersions.filter(
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

                let browser_name = activeRunConfiguration.browsers.find(b => {
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

        let enableSaveButton = true;
        if (
            this.state.runTechnologyRows.filter(run => {
                return run.at_id && run.browser_id;
            }).length === 0
        ) {
            enableSaveButton = false;
        }

        if (
            versionData.apg_examples.filter(e => {
                return this.state.exampleSelected[e.id];
            }).length === 0
        ) {
            enableSaveButton = false;
        }

        return (
            <Fragment>
                <h1 data-test="configure-run-h2">Configure Active Runs</h1>
                <h2 data-test="configure-run-h3">Update Versions</h2>
                <Form className="init-box">
                    <Row>
                        <Col>
                            <Form.Group controlId="testVersion">
                                <Form.Label data-test="configure-run-commit-label">
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
                                                        activeRunConfiguration.browsers
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
                <h2 data-test="configure-run-test-plans">Test Plans</h2>
                <div>Select test plans to include in testing:</div>
                <ul>
                    {versionData.apg_examples.map(example => {
                        let exampleTableTitle =
                            example.name || example.directory;
                        let id = `designpattern-${example.id}`;
                        return (
                            <li key={`key-${id}`}>
                                <input
                                    type="checkbox"
                                    id={id}
                                    name={example.id}
                                    checked={
                                        this.state.exampleSelected[example.id]
                                    }
                                    onChange={this.selectExample}
                                ></input>
                                {exampleTableTitle}
                            </li>
                        );
                    })}
                </ul>
                {!enableSaveButton && (
                    <div>
                        You must have at least one AT/Browser combination
                        configured and at least on APG Example selected to
                        update the Test Runs.
                    </div>
                )}
                <div>
                    <Button
                        disabled={!enableSaveButton}
                        onClick={this.configureActiveRuns}
                    >
                        Update Active Run Configuration
                    </Button>
                </div>
            </Fragment>
        );
    }
}

ConfigureActiveRuns.propTypes = {
    activeRunConfiguration: PropTypes.object,
    testVersions: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { activeRunConfiguration, testVersions } = state.runs;
    return { testVersions, activeRunConfiguration };
};

export default connect(mapStateToProps)(ConfigureActiveRuns);
