import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, Table } from 'react-bootstrap';

class ConfigureRunsForExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userDropdownSelection: -2,
            runSelected: {}
        };

        this.handleRunCheck = this.handleRunCheck.bind(this);
        this.updateTesters = this.updateTesters.bind(this);
    }

    updateTesters(event) {
        const {
            assignTesters,
            removeAllTestersFromRun,
            testersByRunId,
            example,
            users,
            runs
        } = this.props;
        let value = parseInt(event.currentTarget.value);

        if (value === -2) {
            this.setState({
                userDropdownSelection: -2
            });
            return;
        }
        if (value === -1) {
            let runIds = [];
            for (let id in this.state.runSelected) {
                if (this.state.runSelected[id]) {
                    runIds.push(id);
                }
            }
            removeAllTestersFromRun(example.id, runIds);

            this.setState({
                userDropdownSelection: -2
            });
            return;
        }

        let runIds = [];
        for (let runId of Object.keys(this.state.runSelected)) {
            if (this.state.runSelected[runId]) {

                // Do not add to run if tester already assigned to run
                if (testersByRunId[runId].includes(value)) continue;

                // Make sure the user can be assigned to this run
                runId = parseInt(runId);
                const atName = runs.find(r => r.id === runId).at_name;
                const userAts = users.find(u => u.id === value).configured_ats;
                if (userAts.find(ua => ua.at_name === atName && ua.active)) {
                    runIds.push(runId);
                }
            }
        }

        if (runIds.length !== 0) {
            assignTesters(example.id, runIds, value);
        }
        this.setState({
            userDropdownSelection: value
        });
    }

    handleRunCheck(event) {
        const value = event.target.checked;
        const runIndex = parseInt(event.target.name);
        this.setState({
            runSelected: { ...this.state.runSelected, [runIndex]: value }
        });
    }

    render() {
        const { example, users, testersByRunId, runs } = this.props;

        runs.sort(function(a, b) {
            if (a.at_id === b.at_id) {
                return b.browser_id - a.browser_id;
            }
            return b.at_id - a.at_id;
        });

        return (
            <Fragment>
                <h4>{example.name || example.directory}</h4>
                {runs.length !== 0 && (
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Assistive Technology and Browser</th>
                                <th>Testers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runs.map(run => {
                                let checked = this.state.runSelected[run.id]
                                    ? true
                                    : false;

                                let names = undefined;
                                if (testersByRunId && testersByRunId[run.id]) {
                                    names = testersByRunId[run.id].map(
                                        testerId => {
                                            let user = users.filter(
                                                u => u.id === testerId
                                            )[0];
                                            return user.fullname;
                                        }
                                    );
                                }

                                return (
                                    <tr key={run.id}>
                                        <td>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    id={`${run.id}-configurerun`}
                                                    name={run.id}
                                                    checked={checked}
                                                    onChange={
                                                        this.handleRunCheck
                                                    }
                                                ></input>
                                                {`${run.at_name} and ${run.browser_name}`}
                                            </label>
                                        </td>
                                        <td>
                                            {names && names.length
                                                ? names.join(', ')
                                                : 'no assignee'}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr>
                                <td colSpan={2}>
                                    <h5>Assign Testers</h5>
                                    <div>
                                        Choose a test from the dropdown menu to
                                        be assigned to the tests you have
                                        selected.
                                    </div>
                                    <Form.Control
                                        value={this.state.userDropdownSelection}
                                        onChange={this.updateTesters}
                                        as="select"
                                        custom
                                    >
                                        <option key={-2} value={-2}>
                                            Assignees
                                        </option>
                                        ;
                                        <option key={-1} value={-1}>
                                            Clear Assignees
                                        </option>
                                        ;
                                        {users.map(user => {
                                            return (
                                                <option
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.fullname}
                                                </option>
                                            );
                                        })}
                                    </Form.Control>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                )}
                {runs.length === 0 && (
                    <div>
                        To initiate runs for this example, configure assistive
                        technology and browser combinations above.
                    </div>
                )}
            </Fragment>
        );
    }
}

ConfigureRunsForExample.propTypes = {
    example: PropTypes.object,
    users: PropTypes.array,
    assignTesters: PropTypes.func,
    removeAllTestersFromRun: PropTypes.func,
    testersByRunId: PropTypes.object,
    runs: PropTypes.array
};

export default ConfigureRunsForExample;
