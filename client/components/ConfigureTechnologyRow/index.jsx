import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './ConfigureTechnologyRow.css';

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
        this.undoDelete = this.undoDelete.bind(this);

        this.newRowRef = React.createRef();
        this.deleteRef = React.createRef();
        this.undoRef = React.createRef();
    }

    componentDidMount() {
        const { editable } = this.props;
        if (editable) {
            this.newRowRef.current.focus();
        }
    }

    componentDidUpdate(prevProps) {
        if (
            !this.props.editable
        ) {
            if (this.props.deleted && !prevProps.deleted) {
                this.undoRef.current.focus();
            }
            else if (!this.props.deleted && prevProps.deleted) {
                this.deleteRef.current.focus();
            }
        }
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

    undoDelete() {
        const { undoDeleteTechnologyRow, index } = this.props;
        undoDeleteTechnologyRow(index);
    }

    render() {
        const {
            availableBrowsers,
            availableAts,
            runTechnologies,
            index,
            editable,
            deleted
        } = this.props;

        return !editable ? (
            <tr>
                <td>
                    {
                        availableAts.find(
                            at => at.at_id === runTechnologies.at_id
                        ).at_name
                    }
                </td>
                <td>{runTechnologies.at_version}</td>
                <td>
                    {
                        availableBrowsers.find(
                            browser => browser.id === runTechnologies.browser_id
                        ).name
                    }
                </td>
                <td>{runTechnologies.browser_version}</td>
                <td>
                    <Row>
                        <Col md={9} >
                            <Button
                                className="remove-at-browser"
                                variant="danger"
                                aria-label={`Delete at/browser combination ${index +
                                    1}`}
                                onClick={this.deleteRun}
                                disabled={deleted === true}
                                ref={this.deleteRef}
                            >
                                <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                                Remove
                            </Button>
                        </Col>
                        <Col md={3} >
                            <Button
                                className="undo btn-tertiary"
                                disabled={deleted === false}
                                onClick={this.undoDelete}
                                aria-label="Undo delete"
                                ref={this.undoRef}
                            >
                                <FontAwesomeIcon icon={faUndo}></FontAwesomeIcon>
                            </Button>
                        </Col>
                    </Row>
                </td>
            </tr>
        ) : (
            <tr>
                <td>
                    <Form.Control
                        aria-label={`AT ${index + 1}`}
                        value={
                            runTechnologies.at_id ? runTechnologies.at_id : -1
                        }
                        onChange={this.handleAtChange}
                        as="select"
                        ref={this.newRowRef}
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
                        <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                        Remove
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
    deleteTechnologyRow: PropTypes.func,
    editable: PropTypes.bool,
    deleted: PropTypes.bool,
    undoDeleteTechnologyRow: PropTypes.func
};

export default ConfigureTechnologyRow;
