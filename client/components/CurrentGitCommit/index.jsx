import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

class CurrentGitCommit extends Component {
  render() {
    return (
      <Form.Group
        className="current-commit"
        controlId="testVersion"
      >
        <Form.Label data-test="configure-run-current-commit-label">
          Current Git Commit
        </Form.Label>
        <p>
          <FontAwesomeIcon
            icon={faCheck}
            aria-hidden="true"
          ></FontAwesomeIcon>
        {this.props.gitHash.slice(
          0,
          7
        ) +
          ' - ' +
          this.props.gitCommitMessage.slice(
            0,
            80
          ) +
          '...'}
        </p>
      </Form.Group>
  );
  }
}

CurrentGitCommit.propTypes = {
  gitHash: PropTypes.string,
  gitCommitMessage: PropTypes.string
};

export default CurrentGitCommit;
