import React from 'react';
import { Container } from 'react-bootstrap';

const TestPlanVersionUpdater = () => {
    return (
        <Container id="main" as="main" tabIndex="-1">
            <h1>Test Plan Version Updater</h1>
            <p>
                This tool updates the version of the test plan associated with a
                report.
            </p>
            <h2>Selected Report</h2>
            <p>
                JAWS 1 with Chrome 1 Disclosure Navigation Menu Example
                Published
            </p>
            <h2>Pick a Version</h2>
            <p>Current version is from Nov 18, 2021 at 11:38:39 pm UTC</p>
            <select>
                <option>
                    Nov 18, 2021 at 11:38:39 pm UTC Metric Updates (#578)
                    (da10a20)
                </option>
            </select>
            <h2>Create the New Report</h2>
            <p>1 test result will be deleted. 33 tests will be copied.</p>
            <button>Create updated report</button>
            <h2>Delete the Old Report</h2>
            <button>Delete old report</button>
        </Container>
    );
};

export default TestPlanVersionUpdater;
