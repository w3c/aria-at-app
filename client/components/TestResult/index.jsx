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
            <dd>
                <ul>
                    {outcomes.map(outcome => (
                        <li key={nextId()}>{outcome}</li>
                    ))}
                </ul>
            </dd>
        );
    }

    render() {
        const { testResult, label } = this.props;
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
                <Table striped bordered hover aria-labelledby={label}>
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
                                        <dl>
                                            <dt>Output:</dt>
                                            <dd>{output}</dd>
                                            <dt>Passing Assertions:</dt>
                                            {this.renderOutcomeList(passing)}
                                            <dt>Failing Assertions: </dt>
                                            {this.renderOutcomeList(failing)}
                                            <dt>Unexpected Behaviors: </dt>
                                            {this.renderOutcomeList([
                                                ...unexpected_behaviors
                                            ])}
                                        </dl>
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
    testResult: PropTypes.object,
    label: PropTypes.string
};

export default TestResult;
