import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BugLinkingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BugLinking Error:', error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger mt-3" role="alert">
          <h5>Something went wrong</h5>
          <p className="mb-3">
            There was an error while managing bug links. Please try again or
            contact support if the problem persists.
          </p>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={this.handleRetry}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

BugLinkingErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default BugLinkingErrorBoundary;
