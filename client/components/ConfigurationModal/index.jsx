import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

class ConfigurationModal extends Component {
    render() {
        const {
            show,
            handleClose,
            saveRunConfiguration,
            configurationChanges,
        } = this.props;
        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Active Test Runs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <React.Fragment>
                        <p>
                            <b>
                                The draft and in review results for the
                                following test plans will be lost:
                            </b>
                        </p>
                        <ul>
                            {configurationChanges.map((runDeleted) => (
                                <li
                                    key={runDeleted.id}
                                >{`${runDeleted.apg_example_name} - ${runDeleted.at_name} ${runDeleted.at_version} with ${runDeleted.browser_name} ${runDeleted.browser_version}`}</li>
                            ))}
                        </ul>
                    </React.Fragment>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveRunConfiguration}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ConfigurationModal.propTypes = {
    show: PropTypes.bool,
    handleClose: PropTypes.func,
    saveRunConfiguration: PropTypes.func,
    configurationChanges: PropTypes.array,
    resultsDeleted: PropTypes.bool,
};

export default ConfigurationModal;
