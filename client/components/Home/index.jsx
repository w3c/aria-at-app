import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import testManagementScreenshot from '../../assets/test-management.jpg';
import testQueueScreenshot from '../../assets/test-queue.jpg';
import testViewScreenshot from '../../assets/test-view.jpg';
import testReviewScreenshot from '../../assets/test-review.jpg';

class Home extends Component {
    render() {
        return (
            <Fragment>
                <Helmet>
                    <title>ARIA-AT App</title>
                </Helmet>
                <main>
                    <section className="about">
                        <h1>About this project</h1>
                        <p>
                            This project aims to improve how well assistive
                            technologies render web experiences. It defines and
                            runs manual tests of assistive technologies to
                            measure their support of accessibility semantics
                            using the example web components in
                            {' the '}
                            <a href="https://w3c.github.io/aria-practices/">
                                WAI-ARIA Authoring Practices
                            </a>
                            {
                                ". The tests and test results are vetted with assistive technology vendors and other stakeholders following the project's "
                            }
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
                                <Link to="/results">Review test results</Link>
                            </li>
                            <li>
                                <a href="https://github.com/w3c/aria-at/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22">
                                    Fix a good first issue
                                </a>
                            </li>
                        </ul>
                    </section>
                    <section className="app-screenshots">
                        <div className="container">
                            <div className="description">
                                <h2>Test Management</h2>
                                <p>
                                    This app allows project administrators to
                                    create Test Cycles for managing execution of
                                    tests of a collection of ARIA patterns with
                                    a specified set of assistive technology and
                                    browser combinations.
                                </p>
                            </div>
                            <div className="screenshot">
                                <img
                                    src={testManagementScreenshot}
                                    alt="This page has two main sections: test cycle configuration and test plans. From the “test cycle configuration” section, the user can define the name of the cycle, select a git commit of tests and define the assistive technology and browser combinations they want the testers to use for the test cycle. In the ”test plans” section, the user is presented with all the test plans available in the system where he can assign testers to specific test plans or assistive technology and browser combinations."
                                />
                            </div>
                        </div>
                        <div className="container">
                            <div className="description right">
                                <h2>Test Queue</h2>
                                <p>
                                    Testers can view in-progress Test Cycles and
                                    assign themselves to run a specific test
                                    plan using a given assistive technology and
                                    browser.
                                </p>
                            </div>
                            <div className="screenshot">
                                <img
                                    src={testQueueScreenshot}
                                    alt="This page displays all the test plans available to be tested grouped by assistive technology and browser. Each assistive technology and browser combination as a table with the following columns: test plan,  assigned testers, report status and actions."
                                />
                            </div>
                        </div>
                        <div className="container">
                            <div className="description">
                                <h2>Running Tests</h2>
                                <p>
                                    When running a Test Plan, the app loads the
                                    ARIA AT tests and displays instructions for
                                    how to record various assertions about the
                                    behavior of the AT and browser for a given
                                    test.
                                </p>
                            </div>
                            <div className="screenshot">
                                <img
                                    src={testViewScreenshot}
                                    alt="This page displays a test plan being ran, it has instructions for how to execute the test and record results. As part of the actions in this page, the user can: raise an issue, re-do the test, save and close, navigate to the previous and next test as well as skip it without necessarily having to record results."
                                />
                            </div>
                        </div>
                        <div className="container">
                            <div className="description right">
                                <h2>Test Review</h2>
                                <p>
                                    After multiple runs have been recorded for a
                                    particular Test Plan, users can view a
                                    summary of results, and project
                                    administrators can publish them to the
                                    public Reports page.
                                </p>
                            </div>
                            <div className="screenshot">
                                <img
                                    src={testReviewScreenshot}
                                    alt="This page displays a table with a summary of the results recorded for a test plan. As part of the actions in this page, the user can: raise an issue, re-do the test, close, and edit."
                                />
                            </div>
                        </div>
                    </section>
                </main>
            </Fragment>
        );
    }
}

export default Home;
