import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

class ConfigureTechnologyRow extends Component {
    constructor(props) {
        super(props);

        this.handleBrowserVersionChange = this.handleBrowserVersionChange.bind(
            this
        );
        this.handleAtVersionChange = this.handleAtVersionChange.bind(this);
        this.handleBrowserChange = this.handleBrowserChange.bind(this);
        this.handleAtChange = this.handleAtChange.bind(this);
        this.deleteRun = this.deleteRun.bind(this);
    }

    handleBrowserVersionChange(event) {
        const {
            runTechnologies,
            index,
            handleTechnologyRowChange
        } = this.props;

        let version = event.currentTarget.value.trim();
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

        let version = event.currentTarget.value.trim();
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

    deleteRun() {
        const { index, deleteTechnologyRow } = this.props;

        deleteTechnologyRow(index);
    }

    render() {
        const {
            availableBrowsers,
            availableAts,
            runTechnologies,
            index
        } = this.props;

        return (
            <tr>
                <td>
                    <Form.Control
                        aria-label={`AT ${index + 1}`}
                        value={
                            runTechnologies.at_id ? runTechnologies.at_id : -1
                        }
                        onChange={this.handleAtChange}
                        as="select"
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
                </td>
                <td>
                    <Form.Control
                        aria-label={`AT ${index + 1} Version`}
                        value={runTechnologies.at_version || ''}
                        onChange={this.handleAtVersionChange}
                    />
                </td>
                <td>
                    <Form.Control
                        aria-label={`Browser ${index + 1}`}
                        value={
                            runTechnologies.browser_id
                                ? runTechnologies.browser_id
                                : -1
                        }
                        onChange={this.handleBrowserChange}
                        as="select"
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
                </td>
                <td>
                    <Form.Control
                        aria-label={`Browser ${index + 1} version`}
                        value={runTechnologies.browser_version || ''}
                        onChange={this.handleBrowserVersionChange}
                    />
                </td>
                <td>
                    <Button
                        variant="danger"
                        aria-label={`Delete at/browser combination ${index +
                            1}`}
                        onClick={this.deleteRun}
                    >
                        Delete
                    </Button>
                </td>
            </tr>
        );
    }
}

ConfigureTechnologyRow.propTypes = {
    runTechnologies: PropTypes.object,
    index: PropTypes.number,
    availableAts: PropTypes.array,
    availableBrowsers: PropTypes.array,
    handleTechnologyRowChange: PropTypes.func,
    deleteTechnologyRow: PropTypes.func
};

export default ConfigureTechnologyRow;
