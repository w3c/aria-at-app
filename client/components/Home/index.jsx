import React, { Component, Fragment } from 'react';

class Home extends Component {
    render() {
        return (
            <Fragment>
                <h1>About this project</h1>
                <p>
                    ARIA AT aims to improve interoperability between different
                    Assistive Technologies (ATs) in how they render ARIA
                    patterns. This is achieved through running manual tests and
                    presenting test results to AT vendors. The tests are based
                    {' on examples from '}
                    <a href="https://w3c.github.io/aria-practices/">
                        WAI-ARIA Authoring Practices
                    </a>
                    {', and are vetted with stakeholders following the '}
                    <a href="https://github.com/w3c/aria-at/wiki/Working-Mode">
                        Working Mode
                    </a>
                    {' process.'}
                </p>

                <h2>Get involved</h2>
                <ul>
                    <li>
                        <a href="https://www.w3.org/community/aria-at/">
                            Join the community group
                        </a>
                        {' (see '}
                        <a href="https://www.w3.org/community/about/faq/#how-do-i-join-a-group">
                            how to join a W3C community group
                        </a>
                        )
                    </li>
                    <li>
                        <a href="https://github.com/w3c/aria-at/issues/162">
                            Sign up as a tester
                        </a>
                        {' for the Pilot Test (May 27 - June 2)'}
                    </li>
                    <li>
                        <a href="https://github.com/w3c/aria-at/wiki/How-to-contribute-tests">
                            Write more tests
                        </a>
                    </li>
                    <li>
                        <a href="https://w3c.github.io/aria-at/review-test-plans/">
                            Review the assertions of existing test plans
                        </a>
                    </li>
                    <li>
                        <a href="https://w3c.github.io/aria-at/results/">
                            Review test results
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/w3c/aria-at/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22">
                            Fix a good first issue
                        </a>
                    </li>
                </ul>
            </Fragment>
        );
    }
}

export default Home;
