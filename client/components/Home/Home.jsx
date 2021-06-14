import React from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Helmet } from 'react-helmet';
import { Button, Container } from 'react-bootstrap';
import testConfigurationScreenshot from '../../assets/home-page/config-test.jpg';
import testQueueScreenshot from '../../assets/home-page/test-queue.jpg';
import testViewScreenshot from '../../assets/home-page/test-run.jpg';
import testReviewScreenshot from '../../assets/home-page/test-report.jpg';
import iconReviewAssertions from '../../assets/review-assertion.jpg';
import iconJoinCommunity from '../../assets/join-community.jpg';
import iconWriteTests from '../../assets/write-tests.jpg';
import iconReviewTests from '../../assets/review-tests.jpg';
import iconFixIssue from '../../assets/fix-issue.jpg';
import heroImage from '../../assets/hero-illustration.png';
import useSigninUrl from '../App/useSigninUrl';

const HOME_QUERY = gql`
    query {
        me {
            username
        }
    }
`;

const Home = () => {
    const { loading, data } = useQuery(HOME_QUERY);
    const signinUrl = useSigninUrl();

    if (loading) return null;

    const isSignedIn = !!(data && data.me && data.me.username);

    return (
        <Container className="home-page" as="main">
            <Helmet>
                <title>ARIA-AT App</title>
            </Helmet>
            <section className="hero-section about">
                <div className="hero-copy">
                    <h1>
                        Assistive technologies should render the web
                        consistently for all users
                    </h1>
                    <p>
                        ARIA-AT is an interoperability testing project for
                        assistive technologies like screen readers. The tests
                        are based on design patterns from the W3C ARIA Authoring
                        Practices Guide. By specifying the expected output given
                        a specific user interaction, we can evaluate how
                        consistently different ATs render user interface code.
                    </p>
                    <p>
                        This app collects test data, hosts the latest test
                        results reports, and provides an interface for manual
                        testers to record results.
                    </p>
                    <div className="hero-buttons">
                        {isSignedIn ? (
                            <></>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() =>
                                    (window.location.href = signinUrl)
                                }
                            >
                                Sign Up to Run Tests
                            </Button>
                        )}
                        <Link className="btn-secondary btn" to="/reports">
                            Browse Test Reports
                        </Link>
                    </div>
                </div>
                <div className="hero-illustration">
                    <img
                        src={heroImage}
                        alt="An illustration of a computer where a test is being performed"
                    />
                </div>
            </section>
            <section className="get-involved">
                <div className="get-involved-container">
                    <h2>Get Involved</h2>
                    <div className="resources">
                        <article>
                            <img src={iconJoinCommunity} alt="" />
                            <a href="https://www.w3.org/community/aria-at/">
                                Join the community group
                            </a>
                        </article>
                        <article>
                            <img src={iconWriteTests} alt="" />
                            <a href="https://github.com/w3c/aria-at/wiki/How-to-contribute-tests">
                                Help write more tests
                            </a>
                        </article>
                        <article>
                            <img src={iconReviewAssertions} alt="" />
                            <a href="https://w3c.github.io/aria-at/">
                                Review existing test plans
                            </a>
                        </article>
                        <article>
                            <img src={iconReviewTests} alt="" />
                            <Link to="/reports">Review test results</Link>
                        </article>
                        <article>
                            <img src={iconFixIssue} alt="" />
                            <a href="https://github.com/w3c/aria-at/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22">
                                Fix a good first issue
                            </a>
                        </article>
                    </div>
                </div>
            </section>
            <section className="app-screenshots">
                <div className="container">
                    <div className="description">
                        <h2>Reviewing Test Reports</h2>
                        <p>
                            After multiple runs have been recorded for a
                            particular Test Plan, users can view a summary of
                            results, and project administrators can publish them
                            to the public Reports page.
                        </p>
                    </div>
                    <div className="screenshot">
                        <img
                            src={testReviewScreenshot}
                            alt="A table with a summary of the results recorded for a test plan."
                        />
                    </div>
                </div>
                <div className="container">
                    <div className="description">
                        <h2>Browsing the Test Queue</h2>
                        <p>
                            Testers can view in-progress Test Runs and assign
                            themselves to run a specific test plan using a given
                            assistive technology and browser.
                        </p>
                    </div>
                    <div className="screenshot">
                        <img
                            src={testQueueScreenshot}
                            alt="A Table displaying the Editor Menu bar example and the Checkbox two state example. Both under JAWS with Chrome."
                        />
                    </div>
                </div>
                <div className="container">
                    <div className="description">
                        <h2>Running Tests</h2>
                        <p>
                            When running a Test Plan, the app loads the ARIA AT
                            tests and displays instructions for how to record
                            various assertions about the behavior of the AT and
                            browser for a given test.
                        </p>
                    </div>
                    <div className="screenshot">
                        <img
                            src={testViewScreenshot}
                            alt="A test plan being ran, where the test navigator with the list of tasks is highlighted."
                        />
                    </div>
                </div>
                <div className="container">
                    <div className="description">
                        <h2>Updating Test Configuration</h2>
                        <p>
                            This app allows project administrators to create
                            Test Runs for managing execution of tests of a
                            collection of ARIA patterns with a specified set of
                            assistive technology and browser combinations.
                        </p>
                    </div>
                    <div className="screenshot">
                        <img
                            src={testConfigurationScreenshot}
                            alt="The current git commit for a Test run and the option to select a different one from a dropdown menu"
                        />
                    </div>
                </div>
            </section>
        </Container>
    );
};

export default Home;
