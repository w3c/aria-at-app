import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col } from 'react-bootstrap';

class ConfigureTechnologyRow extends Component {
    constructor(props) {
        super(props);

        this.handleBrowserVersionChange = this.handleBrowserVersionChange.bind(
            this
        );
        this.handleAtVersionChange = this.handleAtVersionChange.bind(this);
        this.handleBrowserChange = this.handleBrowserChange.bind(this);
        this.handleAtChange = this.handleAtChange.bind(this);
    }

    handleBrowserVersionChange(event) {
        const {
            runTechnologies,
            index,
            handleRunTechnologiesChange
        } = this.props;
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.browser_version =
            event.currentTarget.value === -1
                ? undefined
                : event.currentTarget.value;

        handleRunTechnologiesChange(newRunTechnologies, index);
    }

    handleAtVersionChange(event) {
        const {
            runTechnologies,
            index,
            handleRunTechnologiesChange
        } = this.props;
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.at_version =
            event.currentTarget.value === -1
                ? undefined
                : event.currentTarget.value;

        handleRunTechnologiesChange(newRunTechnologies, index);
    }

    handleBrowserChange(event) {
        const {
            runTechnologies,
            index,
            handleRunTechnologiesChange
        } = this.props;
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.browser_id =
            event.currentTarget.value === -1
                ? undefined
                : event.currentTarget.value;

        handleRunTechnologiesChange(newRunTechnologies, index);
    }

    handleAtChange(event) {
        const {
            runTechnologies,
            index,
            handleRunTechnologiesChange
        } = this.props;
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.at_id =
            event.currentTarget.value === -1
                ? undefined
                : event.currentTarget.value;

        handleRunTechnologiesChange(newRunTechnologies, index);
    }

    render() {
        const {
            availableBrowsers,
            availableAts,
            runTechnologies,
            index
        } = this.props;

        return (
            <Row>
                <Col>
                    <Form.Control
                        value={
                            runTechnologies.at_id ? runTechnologies.at_id : -1
                        }
                        onChange={this.handleAtChange}
                        as="select"
                        custom
                    >
                        <option key={-1} value={-1}></option>;
                        {availableAts.map((at, index) => {
                            return (
                                <option key={index} value={at.at_id}>
                                    {at.at_name}
                                </option>
                            );
                        })}
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Control
                        value={runTechnologies.at_version}
                        onChange={this.handleAtVersionChange}
                    />
                </Col>
                <Col>
                    <Form.Control
                        value={
                            runTechnologies.browser_id
                                ? runTechnologies.browser_id
                                : -1
                        }
                        onChange={this.handleBrowserChange}
                        as="select"
                        custom
                    >
                        <option key={-1} value={-1}></option>;
                        {availableBrowsers.map((browser, index) => {
                            return (
                                <option key={index} value={browser.id}>
                                    {browser.name}
                                </option>
                            );
                        })}
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Control
                        value={runTechnologies.browser_version}
                        onChange={this.handleBrowserVersionChange}
                    />
                </Col>
            </Row>
        );
    }
}

ConfigureTechnologyRow.propTypes = {
    runTechnologies: PropTypes.object,
    index: PropTypes.number,
    availableAts: PropTypes.array,
    availableBrowsers: PropTypes.array,
    handleRunTechnologiesChange: PropTypes.func
};

export default ConfigureTechnologyRow;
