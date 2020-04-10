import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Table } from 'react-bootstrap';

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
        const { assignTesters, removeAllTestersFromRun, example } = this.props;
        let value = parseInt(event.currentTarget.value);

        if (value === -2) {
            this.setState({
                userDropdownSelection: -2
            });
            return;
        }
        if (value === -1) {
            let techIndexes = [];
            for (let techIndex in this.state.runSelected) {
                techIndexes.push(techIndex);
            }
            removeAllTestersFromRun(example.id, techIndexes);

            this.setState({
                userDropdownSelection: -2
            });
            return;
        }


        let runTechnologyIndexes = [];
        for (let runTechnologyIndex in this.state.runSelected) {
            if (this.state.runSelected[runTechnologyIndex]) {
                runTechnologyIndexes.push(runTechnologyIndex);
            }
        }

        // If there was no runs selected, then do not update dropdown
        if (runTechnologyIndexes.length === 0) {
            this.setState({
                userDropdownSelection: -2
            });
        }
        else {
            this.setState({
                userDropdownSelection: value
            });
            assignTesters(example.id, runTechnologyIndexes, value);
        }
    }

    handleRunCheck(event) {
        const value = event.target.checked;
        const runIndex = event.target.name;
        this.setState({
            runSelected: {...this.state.runSelected, [runIndex]: value}
        });
    }

    render() {
        const { example, runTechnologies, testerConfig, assignTesters, availableBrowsers, availableAts, users, runTestersByTechIndex } = this.props;
        let browserName = {};
        for (let browser of availableBrowsers) {
            browserName[browser.id] = browser.name;
        }
        let atName = {};
        for (let at of availableAts) {
            atName[at.at_id] = at.at_name;
        }

        // Do not include "unconfigured" runs that do not have either an at_id or a browser_id
        let runsToConfigure = [];
        for (let i = 0; i < runTechnologies.length; i++) {
            if (runTechnologies[i].at_id === undefined || runTechnologies[i].browser_id === undefined) {
                continue;
            }
            else {
                runsToConfigure.push({
                    techIndex: i,
                    run: runTechnologies[i]
                });
            }
        }

        runsToConfigure.sort(function(a, b) {
            if (a.run.at_id === b.run.at_id) {
                return b.run.browser_id - a.run.browser_id;
            }
            return b.run.at_id - a.run.at_id;
        });

        return (
            <Fragment>
                <h4>{example.name}</h4>
              {
                  runsToConfigure.length !== 0  &&
                      <Table bordered>
                  <thead>
                  <tr>
                  <th>
                      Assistive Technology and Browser
                    </th>
                    <th>
                      Testers
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {runsToConfigure.map((runData) => {
                      let run = runData.run;
                      let checked = this.state.runSelected[runData.techIndex] ? true : false;
                      let names = runTestersByTechIndex && runTestersByTechIndex[runData.techIndex]
                          ? runTestersByTechIndex[runData.techIndex].map((testerId) => {
                              let user = users.filter(u => u.id === testerId)[0];
                              return user.fullname;
                          })
                          : undefined;

                      return <tr>
                               <td>
                                 <label>
                                   <input type="checkbox" id={`${runData.techIndex}-configurerun`} name={runData.techIndex} checked={checked} onChange={this.handleRunCheck}></input>
                                   {`${atName[run.at_id]} and ${browserName[run.browser_id]}`}
                                 </label>

                               </td>
                               <td>
                                 {names.length ? names.join(', ') : "no assignee"}
                               </td>
                             </tr>;
                  })}
                <tr>
                  <td colSpan={2}><h5>Assign Testers</h5>
                    <div>Choose a test from the dropdown menu to be assigned to the tests you have selected.</div>
                    <Form.Control value={this.state.userDropdownSelection} onChange={this.updateTesters} as="select" custom>
                      <option key={-2} value={-2}>Assignees</option>;
                      <option key={-1} value={-1}>Clear Assignees</option>;
                      {users.map((user) => {
                          return <option key={user.id} value={user.id}>
                                   {user.fullname}
                                 </option>;
                      })}
                </Form.Control>
                  </td>
                </tr>
                </tbody>
              </Table>
              }
              {
                  runsToConfigure.length === 0 &&
                      <div>To initiate runs for this example, configure assistive technology and browser combinations above.</div>
              }
            </Fragment>
        );
    }
}



ConfigureRunsForExample.propTypes = {
    example: PropTypes.object,
    runTechnologies: PropTypes.array,
    users: PropTypes.array,
    availableAts: PropTypes.array,
    availableBrowsers: PropTypes.array,
    assignTesters: PropTypes.func,
    removeAllTestersFromRun: PropTypes.func,
    runTestersByTechIndex: PropTypes.object
};

export default ConfigureRunsForExample;
