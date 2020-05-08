import React, { Component, Fragment } from 'react';
import nextId from 'react-id-generator';

import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

class TestResult extends Component {
    renderOutcomeList(outcomes) {
        if (!outcomes.length) {
            outcomes.push('None.');
        }
        return (
            <ul>
                {outcomes.map(outcome => (
                    <li key={nextId()}>{outcome}</li>
                ))}
            </ul>
        );
    }

    render() {
        const { testResult } = this.props;
        const keys = ['pass', 'fail'];
        const commandReports = testResult.result.details.commands.map(
            command => {
                let [passing, failing] = command.assertions.reduce(
                    (accum, a) =>
                        accum.map((assertions, index) =>
                            assertions.concat(
                                a[keys[index]] !== undefined
                                    ? [`${a[keys[index]]}: ${a.assertion}`]
                                    : []
                            )
                        ),
                    [[], []]
                );
                return {
                    command,
                    passing,
                    failing
                };
            }
        );
        return (
            <Fragment>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Command</th>
                            <th>Support</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commandReports.map(report => {
                            const {
                                command: {
                                    command,
                                    output,
                                    support,
                                    unexpected_behaviors
                                },
                                passing,
                                failing
                            } = report;
                            return (
                                <tr key={nextId()}>
                                    <td>{command}</td>
                                    <td>{support}</td>
                                    <td>
                                        <p>Output: {output}</p>
                                        <p>Passing Assertions:</p>
                                        {this.renderOutcomeList(passing)}
                                        <p>Failing Assertions:</p>{' '}
                                        {this.renderOutcomeList(failing)}
                                        <p>Unexpected Behaviors:</p>{' '}
                                        {this.renderOutcomeList(
                                            unexpected_behaviors
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Fragment>
        );
    }
}

TestResult.propTypes = {
    testResult: PropTypes.object
};

export default TestResult;
