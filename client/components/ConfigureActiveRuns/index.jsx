import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import {
    saveRunConfiguration,
    getActiveRunConfiguration,
    getTestVersions,
    getActiveRuns
} from '../../actions/runs';
import ConfigureTechnologyRow from '@components/ConfigureTechnologyRow';
import ConfigurationModal from '@components/ConfigurationModal';

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
                browser_version: combo.browser_version,
                editable: false,
                deleted: false
            });
        }
    }

    return initialRunRows.length ? initialRunRows : [{}];
}

class ConfigureActiveRuns extends Component {
    constructor(props) {
        super(props);
        const { testVersions, activeRunConfiguration } = props;

        let testVersionId = activeRunConfiguration
            ? activeRunConfiguration.active_test_version.id
            : undefined;

        this.state = {
            selectedVersion: testVersionId,
            name: '',
            runTechnologyRows: [{}], // list of {at_id, at_version, browser_id, browser_version}
            exampleSelected: {},
            showChangeModal: false,
            configurationChanges: [],
            newConfiguration: {},
            resultsDeleted: false
        };

        if (activeRunConfiguration && testVersionId) {
            this.state.runTechnologyRows = getDefaultsTechCombinations(
                testVersions.filter(
                    version =>
                        activeRunConfiguration.active_test_version.id ===
                        version.id
                )[0],
                activeRunConfiguration
            );
            this.state.exampleSelected = selectExamples(
                activeRunConfiguration.active_test_version,
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
        this.showChanges = this.showChanges.bind(this);
        this.closeChanges = this.closeChanges.bind(this);
        this.configureActiveRuns = this.configureActiveRuns.bind(this);
        this.undoDeleteTechnologyRow = this.undoDeleteTechnologyRow.bind(this);
        this.calculateConfigChanges = this.calculateConfigChanges.bind(this);
        this.saveNewConfiguration = this.saveNewConfiguration.bind(this);
        this.getTestPlanStatus = this.getTestPlanStatus.bind(this);
    }

    componentDidMount() {
        const {
            dispatch,
            testVersions,
            activeRunConfiguration,
            activeRunsById
        } = this.props;
        if (!testVersions) {
            dispatch(getTestVersions());
        }
        if (!activeRunConfiguration) {
            dispatch(getActiveRunConfiguration());
        }

        if (!activeRunsById) {
            dispatch(getActiveRuns());
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
            let testVersionId =
                nextProps.activeRunConfiguration.active_test_version.id;
            let testVersion =
                nextProps.activeRunConfiguration.active_test_version;

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
        const selected = event.target.innerText.includes('Remove');
        const apgExampleId = parseInt(
            event.target.parentNode.parentNode.getAttribute('name')
        );
        this.setState({
            exampleSelected: {
                ...this.state.exampleSelected,
                [apgExampleId]: !selected // Clicking remove means remove the apgExample
            }
        });
    }

    showChanges() {
        this.setState({
            showChangeModal: true
        });
    }

    closeChanges() {
        this.setState({
            showChangeModal: false
        });
    }

    /**
     * This is a naive algorithm for finding all the configuration changes.
     * It can be vastly improved, especially with smarter logic on handling
     * duplicate changes.
     * */
    calculateConfigChanges(newConfig) {
        const { activeRunConfiguration, activeRunsById } = this.props;
        let configurationChanges = [];

        // Validate test version changes
        const oldVersionId = activeRunConfiguration.active_test_version.id;
        const newVersionId = newConfig.test_version_id;

        if (oldVersionId !== newVersionId) {
            configurationChanges = configurationChanges.concat(
                Object.values(activeRunsById).filter(
                    run => run.run_status === 'draft'
                )
            );
        }

        let pairsDelete = [];
        activeRunConfiguration.active_at_browser_pairs.reduce(
            (acc, oldPair) => {
                let pairFound = newConfig.at_browser_pairs.find(
                    pair =>
                        oldPair.at_name_id === pair.at_name_id &&
                        oldPair.at_version === pair.at_version &&
                        oldPair.browser_version === pair.browser_version &&
                        oldPair.browser_id === pair.browser_id
                );
                if (!pairFound) {
                    acc.push(oldPair);
                }
                return acc;
            },
            pairsDelete
        );

        // Find all the runs associated with these rows
        let runsToDeleteTechPair = [];
        pairsDelete.reduce((acc, row) => {
            let runFound = Object.values(activeRunsById).find(
                run =>
                    run.at_name_id === row.at_name_id &&
                    run.at_version === row.at_version &&
                    run.browser_id === row.browser_id &&
                    run.browser_version === row.browser_version &&
                    run.run_status === 'draft'
            );
            if (runFound) acc.push(runFound);
            return acc;
        }, runsToDeleteTechPair);

        configurationChanges = configurationChanges.concat(
            runsToDeleteTechPair
        );

        // Find all runs associated with example change
        let examplesDelete = [];
        activeRunConfiguration.active_apg_examples.reduce((acc, oldExample) => {
            let exampleFound = newConfig.apg_example_ids.find(
                example => example === oldExample
            );
            if (!exampleFound) {
                acc.push(oldExample);
            }
            return acc;
        }, examplesDelete);

        let runsDeleteApgExamples = [];
        examplesDelete.reduce((acc, exampleId) => {
            let runsFound = Object.values(activeRunsById).filter(
                run =>
                    run.apg_example_id === exampleId &&
                    run.run_status === 'draft'
            );
            if (runsFound.length > 0) acc.push(...runsFound);
            return acc;
        }, runsDeleteApgExamples);

        configurationChanges = configurationChanges.concat(
            runsDeleteApgExamples
        );

        // Remove duplicate changes
        let uniqueConfigChanges = [];
        configurationChanges.reduce((acc, run) => {
            let runFound = uniqueConfigChanges.find(
                duplicateRun => run.id === duplicateRun.id
            );
            if (!runFound) acc.push(run);
            return acc;
        }, uniqueConfigChanges);

        return uniqueConfigChanges;
    }

    configureActiveRuns() {
        const { testVersions } = this.props;
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

            let existingPair = atBrowserPairs.find(p => {
                return (
                    p.at_name_id === atIdToAtNameId[runTechnologyPair.at_id] &&
                    p.at_version === runTechnologyPair.at_version &&
                    p.browser_id === runTechnologyPair.browser_id &&
                    p.browser_version === runTechnologyPair.browser_version
                );
            });
            if (existingPair) {
                let deduplicatedRows = [...this.state.runTechnologyRows];
                deduplicatedRows.splice(index, 1);
                this.setState({
                    runTechnologyRows: deduplicatedRows
                });
            } else {
                if (!runTechnologyPair.deleted) {
                    atBrowserPairs.push({
                        at_name_id: atIdToAtNameId[runTechnologyPair.at_id],
                        at_version: runTechnologyPair.at_version,
                        browser_id: runTechnologyPair.browser_id,
                        browser_version: runTechnologyPair.browser_version
                    });
                }
            }
        }

        let apgExampleIds = [];
        for (let { id } of versionData.apg_examples) {
            if (this.state.exampleSelected[id]) {
                apgExampleIds.push(id);
            }
        }

        const config = {
            test_version_id: this.state.selectedVersion,
            apg_example_ids: apgExampleIds,
            at_browser_pairs: atBrowserPairs
        };

        const configurationChanges = this.calculateConfigChanges(config);

        let stateConfiguration = {
            newConfiguration: config
        };

        if (configurationChanges.length > 0) {
            stateConfiguration = {
                configurationChanges,
                newConfiguration: config,
                resultsDeleted: true
            };
        }

        this.setState(stateConfiguration, () => {
            this.showChanges();
        });
    }

    saveNewConfiguration() {
        this.props.dispatch(saveRunConfiguration(this.state.newConfiguration));

        this.closeChanges();
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
        newRunTechnologies.push({ editable: true });
        this.setState({
            runTechnologyRows: newRunTechnologies
        });
    }

    deleteTechnologyRow(index) {
        let newRunTechnologies = [...this.state.runTechnologyRows];
        const deletedRow = newRunTechnologies[index];

        if (deletedRow.editable === false) {
            deletedRow.deleted = true;
        } else {
            newRunTechnologies.splice(index, 1).pop();
        }

        this.setState({
            runTechnologyRows: newRunTechnologies
        });
    }

    undoDeleteTechnologyRow(index) {
        this.setState(prevProps => {
            let newRunTechnologies = [...prevProps.runTechnologyRows];
            newRunTechnologies[index].deleted = false;
            return {
                runTechnologyRows: newRunTechnologies
            };
        });
    }

    renderTestVersionSelect() {
        const { testVersions, activeRunConfiguration } = this.props;

        const getTestVersions = function() {
            const testVersionOption = version => (
                <option key={version.id} value={version.id}>
                    {version.git_hash.slice(0, 7) +
                        ' - ' +
                        version.git_commit_msg.slice(0, 80) +
                        '...'}
                </option>
            );
            return Object.keys(activeRunConfiguration.active_test_version)
                .length > 0
                ? testVersions
                      .filter(
                          version =>
                              version.date >
                              activeRunConfiguration.active_test_version.date
                      )
                      .map(version => {
                          return testVersionOption(version);
                      })
                : testVersions.map(version => {
                      return testVersionOption(version);
                  });
        };

        const versions = getTestVersions();

        return versions.length > 0 ? (
            <Form.Control
                data-test="configure-run-commit-select"
                value={this.state.selectedVersion}
                onChange={this.handleVersionChange}
                as="select"
            >
                {versions}
            </Form.Control>
        ) : null;
    }

    getTestPlanStatus(apgExampleId) {
        const { activeRunsById } = this.props;
        let planStatus = 'Not in Queue';
        if (!activeRunsById) return planStatus;

        const runsForExample = Object.values(activeRunsById).filter(
            run => run.apg_example_id === apgExampleId
        );
        const testsWithResults = [];

        // Find any results for the runs for this test plan
        runsForExample.reduce((acc, run) => {
            const anyResults = run.tests.filter(
                test => Object.keys(test.results) > 0
            );
            acc.push(...anyResults);
            return acc;
        }, testsWithResults);

        // Find if any complete results
        if (testsWithResults.length > 0) {
            return <span>In Queue: <span className="status-label in-progress">In Progress</span></span>;
        } else if (testsWithResults.length === 0) {
            return <span>In Queue: <span className="status-label not-started">Not Started</span></span>;
        }

        return planStatus;
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
        const deletedExistingTechnologyRows = this.state.runTechnologyRows.filter(
            run => run.editable === false && run.deleted === true
        );
        if (
            this.state.runTechnologyRows.filter(run => {
                return run.at_id && run.browser_id;
            }).length -
                deletedExistingTechnologyRows.length ===
            0
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

        const renderedTestVersions = this.renderTestVersionSelect();

        return (
            <Fragment>
                <h1 data-test="configure-run-h2">Configure Active Runs</h1>
                <h2 data-test="configure-run-h3">Update Versions</h2>
                <Form className="init-box">
                    <Row>
                        <Col>
                            {Object.keys(
                                activeRunConfiguration.active_test_version
                            ).length > 0 ? (
                                <Form.Group controlId="testVersion">
                                    <Form.Label data-test="configure-run-current-commit-label">
                                        Current Git Commit
                                    </Form.Label>
                                    <p>
                                        {activeRunConfiguration.active_test_version.git_hash.slice(
                                            0,
                                            7
                                        ) +
                                            ' - ' +
                                            activeRunConfiguration.active_test_version.git_commit_msg.slice(
                                                0,
                                                80
                                            ) +
                                            '...'}
                                    </p>
                                </Form.Group>
                            ) : null}
                        </Col>
                    </Row>
                    {renderedTestVersions !== null ? (
                        <Row>
                            <Col>
                                <Form.Group controlId="testVersion">
                                    <Form.Label data-test="configure-run-commit-label">
                                        Select a different commit
                                    </Form.Label>
                                    {renderedTestVersions}
                                </Form.Group>
                            </Col>
                        </Row>
                    ) : null}
                    <Row>
                        <Table
                            aria-label="Configure at/browser combinations for test run"
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
                                    <th>Action</th>
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
                                                    undoDeleteTechnologyRow={
                                                        this
                                                            .undoDeleteTechnologyRow
                                                    }
                                                    editable={runTech.editable}
                                                    deleted={runTech.deleted}
                                                />
                                            );
                                        }
                                    )}
                            </tbody>
                        </Table>
                    </Row>
                    <Row>
                        <Col>
                            <Button 
                                variant="secondary" 
                                onClick={this.addTechnologyRow}
                            >
                                Add another AT/Browser
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <br />
                <h2 data-test="configure-run-test-plans">Test Plans</h2>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {versionData.apg_examples.map(example => {
                            let exampleTableTitle =
                                example.name || example.directory;
                            let id = `designpattern-${example.id}`;
                            return (
                                <tr key={id} name={example.id}>
                                    <td>{exampleTableTitle}</td>
                                    <td>
                                        {this.getTestPlanStatus(example.id)}
                                    </td>
                                    <td>
                                        {this.state.exampleSelected[
                                            example.id
                                        ] ? (
                                            <Button
                                                variant="danger"
                                                onClick={this.selectExample}
                                            >
                                                Remove from Queue
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                onClick={this.selectExample}
                                            >
                                                Add to Queue
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
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
                <ConfigurationModal
                    show={this.state.showChangeModal}
                    handleClose={this.closeChanges}
                    saveRunConfiguration={this.saveNewConfiguration}
                    configurationChanges={this.state.configurationChanges}
                    resultsDeleted={this.state.resultsDeleted}
                />
            </Fragment>
        );
    }
}

ConfigureActiveRuns.propTypes = {
    activeRunConfiguration: PropTypes.object,
    activeRunsById: PropTypes.object,
    testVersions: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = state => {
    const { activeRunConfiguration, testVersions, activeRunsById } = state.runs;
    return { testVersions, activeRunConfiguration, activeRunsById };
};

export default connect(mapStateToProps)(ConfigureActiveRuns);
