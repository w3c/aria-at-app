import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { serialize, hydrate } from '../../utils/formSerialization';

class TestIframe extends Component {
    constructor(props) {
        super(props);

        this.handleResultsMessage = this.handleResultsMessage.bind(this);

        this.iframeEl = React.createRef();
    }

    // validate that postMessage comes from the same origin,
    // validate that message has expected shape,
    // and test if message type matches given type
    validateMessage(message, type) {
        if (window.location.origin !== message.origin) {
            return false;
        }
        if (!message.data || typeof message.data !== 'object') {
            return false;
        }
        if (message.data.type !== type) {
            return false;
        }
        return true;
    }

    handleResultsMessage(message) {
        if (!this.validateMessage(message, 'results')) return;

        const { data } = message.data;
        this.processResults(data);
    }

    async processResults(results) {
        // stop listening for additional results
        window.removeEventListener('message', this.handleResultsMessage);

        // capture serialized form state from the iframe
        const documentEl = this.iframeEl.current.contentDocument;
        const resultsEl = documentEl.querySelector('#record-results');
        const serializedForm = serialize(resultsEl);

        const { onResults } = this.props;
        // Trigger saving of partial results on the parent
        await onResults({
            results,
            serializedForm
        });
    }

    triggerSubmit() {
        this.iframeEl.current.contentWindow.postMessage(
            {
                type: 'submit'
            },
            window.location.origin
        );
    }

    // if aria-at test harness has not loaded
    // we have to attach a one-time event handler
    // to listen for the custom 'loaded' postMessage
    // message since DOMContentLoaded is called
    // before the harness dynamically sets up the
    // test html
    async waitForTestHarnessReload() {
        return new Promise(resolve => {
            const handleLoadMessage = message => {
                if (!this.validateMessage(message, 'loaded')) return;
                window.removeEventListener('message', handleLoadMessage);
                resolve();
            };
            window.addEventListener('message', handleLoadMessage);
            // trigger reload
            this.iframeEl.current.src = this.iframeEl.current.src; // eslint-disable-line no-self-assign
        });
    }

    async reloadAndClear() {
        await this.waitForTestHarnessReload();
    }

    async reloadAndHydrate(serialized) {
        await this.waitForTestHarnessReload();

        // perform the hydration from serialized form state
        const documentEl = this.iframeEl.current.contentDocument;
        const resultsEl = documentEl.querySelector('#record-results');
        hydrate(serialized, resultsEl);
    }

    async componentDidMount() {
        // listen for 'results' postMessage from child iframe
        // which is sent when the "Review Results" button is clicked
        // inside the iframe
        window.addEventListener('message', this.handleResultsMessage);

        // Load partial results
        const { serializedForm } = this.props;
        if (serializedForm) {
            this.reloadAndHydrate(serializedForm);
        }
    }

    componentWillUnmount() {
        // stop listening for results if we haven't already above
        window.removeEventListener('message', this.handleResultsMessage);
    }

    render() {
        const { git_hash, file, at_key } = this.props;

        return (
            <iframe
                src={`/aria-at/${git_hash}/${file}?at=${at_key}&showResults=false&showSubmitButton=false`}
                id="test-iframe"
                ref={this.iframeEl}
            ></iframe>
        );
    }
}

export default TestIframe;

TestIframe.propTypes = {
    onResults: PropTypes.func,
    git_hash: PropTypes.string,
    file: PropTypes.string,
    at_key: PropTypes.string,
    serializedForm: PropTypes.array
};
