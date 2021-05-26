import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, Table } from 'react-bootstrap';

class ConfigureRunsForExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userDropdownSelection: -2,
            runSelected: {},
        };

        this.handleRunCheck = this.handleRunCheck.bind(this);
        this.updateTesters = this.updateTesters.bind(this);
    }

    updateTesters(event) {
        const {
            assignTesters,
            removeAllTestersFromRun,
            example,
            usersById,
            runs,
        } = this.props;
        let value = parseInt(event.currentTarget.value);

        if (value === -2) {
            this.setState({
                userDropdownSelection: -2,
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
                userDropdownSelection: -2,
            });
            return;
        }

        let runIds = [];
        for (let runId of Object.keys(this.state.runSelected)) {
            if (this.state.runSelected[runId]) {
                runId = parseInt(runId);
                const run = runs.find((r) => r.id === runId);

                // Do not add to run if tester already assigned to run
                if (run.testers && run.testers.includes(value)) continue;

                // Make sure the user can be assigned to this run
                const atNameId = run.at_name_id;
                const userAts = usersById[value].configured_ats;
                if (userAts.find((ua) => ua.at_name_id === atNameId)) {
                    runIds.push(runId);
                }
            }
        }

        if (runIds.length !== 0) {
            assignTesters(example.id, runIds, value);
        }
        this.setState({
            userDropdownSelection: value,
        });
    }

    handleRunCheck(event) {
        const value = event.target.checked;
        const runIndex = parseInt(event.target.name);
        this.setState({
            runSelected: { ...this.state.runSelected, [runIndex]: value },
        });
    }

    render() {
        const { usersById, runs = [], tableId } = this.props;

        runs.sort(function (a, b) {
            if (a.at_id === b.at_id) {
                return b.browser_id - a.browser_id;
            }
            return b.at_id - a.at_id;
        });

        // If no runs are selected, disabled the assign drop down
        let disableAssignDropdown = !Object.values(this.state.runSelected).find(
            (v) => v
        );

        return (
            <Fragment>
                {runs.length !== 0 && (
                    <Table aria-labelledby={tableId} bordered>
                        <thead>
                            <tr>
                                <th>Assistive Technology and Browser</th>
                                <th>Testers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runs.map((run) => {
                                let checked = this.state.runSelected[run.id]
                                    ? true
                                    : false;

                                let names = run.testers
                                    ? run.testers.map((t) => {
                                          let user = usersById[t];
                                          return user.username;
                                      })
                                    : undefined;

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
                            <tr className="assign-testers">
                                <td colSpan={2}>
                                    <h5>Assign Testers</h5>
                                    <p>
                                        Choose a test from the dropdown menu to
                                        be assigned to the tests you have
                                        selected.
                                    </p>
                                    <Form.Control
                                        value={this.state.userDropdownSelection}
                                        onChange={this.updateTesters}
                                        as="select"
                                        disabled={disableAssignDropdown}
                                    >
                                        <option key={-2} value={-2}>
                                            Assignees
                                        </option>
                                        ;
                                        <option key={-1} value={-1}>
                                            Clear Assignees
                                        </option>
                                        ;
                                        {Object.keys(usersById).map((id) => {
                                            return (
                                                <option key={id} value={id}>
                                                    {usersById[id].username}
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
    usersById: PropTypes.object,
    assignTesters: PropTypes.func,
    removeAllTestersFromRun: PropTypes.func,
    testersByRunId: PropTypes.object,
    runs: PropTypes.array,
    tableId: PropTypes.string,
};

export default ConfigureRunsForExample;
