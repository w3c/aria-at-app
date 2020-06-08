import React, { Component, Fragment } from 'react';
import testManagementScreenshot from '../../assets/test-management.jpg';
import testQueueScreenshot from '../../assets/test-queue.jpg';
import testViewScreenshot from '../../assets/test-view.jpg';
import testReviewScreenshot from '../../assets/test-review.jpg';

class Home extends Component {
    render() {
        return (
            <Fragment>
                <main>
                    <section class="about">
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
                    </section>
                    <section class="app-screenshots">
                        <div class="container">
                            <div class="description">
                                <h2>Test Management</h2>
                                <p>This app allows users to create Test Cycles which assign ARIA AT tests at a specific version to testers who will run the tests with different AT and browser combinations and record the results.</p>
                            </div>
                            <div class="screenshot">
                                <img src={testManagementScreenshot} alt="Screenshot of the test management page, where a user is configuring a new Test Cycle"/>
                            </div>
                        </div>
                        <div class="container">
                            <div class="screenshot">
                                <img src={testQueueScreenshot} alt="Screenshot of the test queue page. This queue displays test plans to be executed with JAWS in Chrome"/>
                            </div>
                            <div class="description">
                                <h2>Test Queue</h2>
                                <p>Users can view in-progress Test Cycles and assign themselves to help test a particular Test Plan for a given AT and browser combo.</p>
                            </div>
                        </div>
                        <div class="container">
                            <div class="description">
                                <h2>Running Tests</h2>
                                <p>When running a Test Plan, the app loads the ARIA AT tests and displays instructions for how to record various assertions about the behavior of the AT and browser for a given test.</p>
                            </div>
                            <div class="screenshot">
                                <img src={testViewScreenshot} alt="Screenshot of the test view page. This view displayes instructions for how to execute a test"/>
                            </div>
                        </div>
                        <div class="container">
                            <div class="screenshot">
                                <img src={testReviewScreenshot} alt="Screenshot of the test review page. This view shows the results of a test plan that has been completed"/>
                            </div>
                            <div class="description">
                                <h2>Test Review</h2>
                                <p>After multiple runs have been recorded for a particular Test Plan, users can view a summary of results and publish them to the public Reports page.</p>
                            </div>
                        </div>
                    </section>
                </main>
            </Fragment>
        );
    }
}

export default Home;
