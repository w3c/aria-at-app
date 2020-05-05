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
            handleTechnologyRowChange
        } = this.props;

        let version = event.currentTarget.value;
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.browser_version = version;

        handleTechnologyRowChange(newRunTechnologies, index);
    }

    handleAtVersionChange(event) {
        const {
            runTechnologies,
            index,
            handleTechnologyRowChange
        } = this.props;

        let version = event.currentTarget.value;
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.at_version = version;

        handleTechnologyRowChange(newRunTechnologies, index);
    }

    handleBrowserChange(event) {
        const {
            runTechnologies,
            index,
            handleTechnologyRowChange
        } = this.props;

        let browserId = parseInt(event.currentTarget.value);
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.browser_id =
            browserId === -1 ? undefined : browserId;

        handleTechnologyRowChange(newRunTechnologies, index);
    }

    handleAtChange(event) {
        const {
            runTechnologies,
            index,
            handleTechnologyRowChange
        } = this.props;

        let atId = parseInt(event.currentTarget.value);
        let newRunTechnologies = { ...runTechnologies };
        newRunTechnologies.at_id = atId === -1 ? undefined : atId;

        handleTechnologyRowChange(newRunTechnologies, index);
    }

    render() {
        const { availableBrowsers, availableAts, runTechnologies } = this.props;

        return (
            <Row>
                <Col>
                    <Form.Control
                        aria-label={'Assistive Technology'}
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
                        aria-label={'Assistive Technology Version'}
                        value={runTechnologies.at_version || ''}
                        onChange={this.handleAtVersionChange}
                    />
                </Col>
                <Col>
                    <Form.Control
                        aria-label={'Browser'}
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
                        aria-label={'Browser version'}
                        value={runTechnologies.browser_version || ''}
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
    handleTechnologyRowChange: PropTypes.func
};

export default ConfigureTechnologyRow;
