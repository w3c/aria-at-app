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
        // stop listening for additional results if we are saving results
        window.removeEventListener('message', this.handleResultsMessage);

        // capture serialized form state from the iframe
        const serializedForm = this.serializeForm();

        const { saveTestResultOrProgress } = this.props;
        await saveTestResultOrProgress({
            results,
            serializedForm
        });
    }

    serializeForm() {
        const documentEl = this.iframeEl.current.contentDocument;
        const resultsEl = documentEl.querySelector('#record-results');
        return serialize(resultsEl);
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

    async reloadAndHydrate(serialized) {
        // perform the hydration from serialized form state
        const documentEl = this.iframeEl.current.contentDocument;
        const resultsEl = documentEl.querySelector('#record-results');
        hydrate(serialized, resultsEl);
    }

    /* Public function called by test runner when existing incomplete test */
    async saveTestProgress() {
        // capture serialized form state from the iframe
        const serializedForm = this.serializeForm();

        // Only save if there are partial results to save
        if (JSON.stringify(serializedForm) !== this.emptyForm) {
            const { saveTestResultOrProgress } = this.props;
            await saveTestResultOrProgress({
                serializedForm
            });
        }
    }

    /* Public function called by test runner when intending to save complete result */
    triggerSubmit() {
        this.iframeEl.current.contentWindow.postMessage(
            {
                type: 'submit'
            },
            window.location.origin
        );
    }

    /* Public function for deleting partial or complete results */
    async reloadAndClear() {
        await this.waitForTestHarnessReload();
    }

    async componentDidMount() {
        // listen for 'results' postMessage from child iframe
        // which is sent when the "Review Results" button is clicked
        // inside the iframe
        window.addEventListener('message', this.handleResultsMessage);

        // Before hydrating, save local copy of serialized state with no results
        // This is a short cut to tell whether the form has been edited
        await this.waitForTestHarnessReload();
        this.emptyForm = JSON.stringify(this.serializeForm());

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

    async componentDidUpdate(prevProps) {
        // If the test we are looking at changes
        if (prevProps.file !== this.props.file) {
            // Before hydrating, save local copy of serialized state with no results
            // This is a short cut to tell whether the form has been edited
            await this.waitForTestHarnessReload();
            this.emptyForm = JSON.stringify(this.serializeForm());

            // Load partial results
            const { serializedForm } = this.props;
            if (serializedForm) {
                this.reloadAndHydrate(serializedForm);
            }
        }
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
    saveTestResultOrProgress: PropTypes.func,
    git_hash: PropTypes.string,
    file: PropTypes.string,
    at_key: PropTypes.string,
    serializedForm: PropTypes.array
};
