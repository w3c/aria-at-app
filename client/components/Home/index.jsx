import React, { Component, Fragment } from 'react';
import test_management from '../../assets/test_management.jpg';
import test_queue from '../../assets/test-queue.jpg';
import test_view from '../../assets/test-view.jpg';
import test_review from '../../assets/test-review.jpg';

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
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus posuere porttitor erat, nec vulputate ipsum efficitur eget. Praesent imperdiet finibus efficitur. Morbi vulputate eu ex et ullamcorper. Donec et egestas libero, vitae commodo leo.</p>
                            </div>
                            <div class="screenshot">
                                <img src={test_management} alt="Screenshot of the test management page, where a user is configuring a new Test Cycle"/>
                            </div>
                        </div>
                        <div class="container">
                            <div class="screenshot">
                                <img src={test_queue} alt="Screenshot of the test queue page. This queue displays test plans to be executed with JAWS in Chrome"/>
                            </div>
                            <div class="description">
                                <h2>Test Queue</h2>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus posuere porttitor erat, nec vulputate ipsum efficitur eget. Praesent imperdiet finibus efficitur. Morbi vulputate eu ex et ullamcorper. Donec et egestas libero, vitae commodo leo.</p>
                            </div>
                        </div>
                        <div class="container">
                            <div class="description">
                                <h2>Test View</h2>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus posuere porttitor erat, nec vulputate ipsum efficitur eget. Praesent imperdiet finibus efficitur. Morbi vulputate eu ex et ullamcorper. Donec et egestas libero, vitae commodo leo.</p>
                            </div>
                            <div class="screenshot">
                                <img src={test_view} alt="Screenshot of the test view page. This view displayes instructions for how to execute a test"/>
                            </div>
                        </div>
                        <div class="container">
                            <div class="screenshot">
                                <img src={test_review} alt="Screenshot of the test review page. This view shows the results of a test plan that has been completed"/>
                            </div>
                            <div class="description">
                                <h2>Test Review</h2>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus posuere porttitor erat, nec vulputate ipsum efficitur eget. Praesent imperdiet finibus efficitur. Morbi vulputate eu ex et ullamcorper. Donec et egestas libero, vitae commodo leo.</p>
                            </div>
                        </div>
                    </section>
                </main>
            </Fragment>
        );
    }
}

export default Home;
