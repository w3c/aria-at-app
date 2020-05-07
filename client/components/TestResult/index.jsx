import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

class TestResult extends Component {
    renderPassingAssertions(assertions) {
        if (assertions.length === 0) {
            return (
                <ul>
                    <li>No passing assertions.</li>
                </ul>
            );
        }
        return (
            <ul>
                {assertions.map((a, index) => (
                    <li key={index}>{`${a.pass}: ${a.assertion}`}</li>
                ))}
            </ul>
        );
    }

    renderFailingAssertions(assertions) {
        if (assertions.length === 0) {
            return (
                <ul>
                    <li>No failing assertions.</li>
                </ul>
            );
        }
        return (
            <ul>
                {assertions.map((a, index) => (
                    <li key={index}>{`${a.fail}: ${a.assertion}`}</li>
                ))}
            </ul>
        );
    }

    renderUnexpected(unexpecteds) {
        if (unexpecteds.length === 0) {
            return (
                <ul>
                    <li>No unexpected behavior.</li>
                </ul>
            );
        }
        return (
            <ul>
                {unexpecteds.map((u, index) => (
                    <li key={index}>{u}</li>
                ))}
            </ul>
        );
    }

    render() {
        const { testResult } = this.props;

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
                        {testResult.result.details.commands.map(
                            (command, index) => {
                                let passing = command.assertions.filter(
                                    a => a.pass !== undefined
                                );
                                let failing = command.assertions.filter(
                                    a => a.fail !== undefined
                                );

                                return (
                                    <tr key={index}>
                                        <td>{command.command}</td>
                                        <td>{command.support}</td>
                                        <td>
                                            <p>Output: {command.output}</p>
                                            <p>Passing Assertions:</p>
                                            {this.renderPassingAssertions(
                                                passing
                                            )}
                                            <p>Failing Assertions:</p>{' '}
                                            {this.renderFailingAssertions(
                                                failing
                                            )}
                                            <p>Unexpected Behaviors:</p>{' '}
                                            {this.renderUnexpected(
                                                command.unexpected_behaviors
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        )}
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
