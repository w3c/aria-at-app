import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container } from 'react-bootstrap';
import iconJoinCommunity from '../../assets/join-community.jpg';
import iconWriteTests from '../../assets/write-tests.jpg';
import iconReviewTests from '../../assets/review-tests.jpg';
import iconReviewAssertions from '../../assets/review-assertion.jpg';
// Icon which is no longer used
// import iconFixIssue from '../../assets/fix-issue.jpg';

const Home = () => {
    return (
        <Container className="home-page" id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Home | ARIA-AT</title>
            </Helmet>
            <section className="hero-section">
                <h1>
                    Enabling Interoperability for Assistive Technology Users
                </h1>
                <div className="hero-copy-and-video">
                    <div className="hero-copy">
                        <p className="w3c-authorization-message">
                            <i aria-hidden="true">✨</i>
                            <em>
                                <strong>Note:</strong> The{' '}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://github.com/w3c/aria-at"
                                >
                                    ARIA-AT Project
                                </a>{' '}
                                is managed by the{' '}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://www.w3.org/community/aria-at/"
                                >
                                    ARIA-AT Community Group
                                </a>{' '}
                                in coordination with the{' '}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://www.w3.org/WAI/ARIA/task-forces/practices/"
                                >
                                    Authoring Practices Task Force
                                </a>{' '}
                                of the{' '}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://www.w3.org/WAI/ARIA/"
                                >
                                    ARIA Working Group
                                </a>
                                . The W3C staff contact is{' '}
                                <a href="mailto:dmontalvo@w3.org">
                                    Daniel Montalvo
                                </a>
                                .
                            </em>
                        </p>
                        <p>
                            Today, different screen readers often yield
                            conflicting experiences when presenting a web page,
                            disadvantaging or even excluding some users. These
                            differences also create accessibility design and
                            test barriers for web developers.
                        </p>
                        <p>
                            On the other hand, browsers are interoperable for
                            people who do not use assistive technologies. That
                            is, different browsers provide equivalent
                            experiences. Browser interoperability facilitates an
                            inclusive web.
                        </p>
                        <p>
                            Assistive technology users deserve equal inclusion.
                            The ARIA-AT project aims to empower equal inclusion
                            by realizing interoperability for AT users.
                        </p>
                        <p>
                            <a
                                className="hero-link"
                                href="https://github.com/w3c/aria-at/wiki/How-Gaps-in-Assistive-Technology-Interoperability-Hinder-Inclusion"
                            >
                                Read more about how the AT interoperability gap
                                hinders inclusion on the web for people with
                                disabilities.
                            </a>
                        </p>
                    </div>
                    <div className="hero-video">
                        <iframe
                            src="https://player.vimeo.com/video/651279608?h=45aefd646f&byline=false&dnt=true&portrait=false"
                            width="640"
                            height="340"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="ARIA-AT Video"
                        />
                    </div>
                </div>
            </section>
            <section className="improvements">
                <div className="improvements-container">
                    <h2>How are we improving interoperability?</h2>
                    <ul className="improvement-list">
                        <li>
                            <img src={iconWriteTests} alt="" />
                            <h3>Proposing expectations for ATs</h3>
                            <p>
                                We have written initial drafts for more than a
                                thousand tests that articulate expected screen
                                reader behaviors for 40 examples of common web
                                design patterns. View the{' '}
                                <a href="https://github.com/w3c/aria-at/blob/master/metrics/coverage.md">
                                    Test Writing Progress Report
                                </a>{' '}
                                and{' '}
                                <a href="https://aria-at.netlify.app">
                                    view the draft test plans
                                </a>{' '}
                                preview.
                            </p>
                        </li>
                        <li>
                            <img src={iconReviewTests} alt="" />
                            <h3>Testing proposed expectations</h3>
                            <p>
                                This website enables us to manage test data, run
                                tests with multiple testers, review results, and
                                publish reports. View our progress on the{' '}
                                <Link to="/test-queue">test queue</Link> page.
                            </p>
                        </li>
                        <li>
                            <img src={iconJoinCommunity} alt="" />
                            <h3>Building industry consensus</h3>
                            <p>
                                Once a pattern has a reviewed test plan with
                                results data, a candidate report is published
                                and the process of building consensus around the
                                plan begins. View reports generated from
                                candidate test plans on the{' '}
                                <Link to="/reports">reports</Link> page.
                            </p>
                        </li>
                        <li>
                            <img src={iconReviewAssertions} alt="" />
                            <h3>Enabling scalable automated testing</h3>
                            <p>
                                In order to regularly collect test results at
                                scale for multiple web design patterns,
                                browsers, and ATs, we are developing an industry
                                standard for automating assistive technology.
                                Read the{' '}
                                <a href="https://github.com/bocoup/aria-at-automation">
                                    explainer for a draft AT automation standard
                                </a>{' '}
                                and{' '}
                                <a href="https://github.com/bocoup/at-automation-experiment">
                                    explore the code repository
                                </a>{' '}
                                where experimental drivers are being developed.
                            </p>
                        </li>
                    </ul>
                </div>
            </section>
            <section className="get-involved">
                <div className="container">
                    <h2>Get Involved</h2>
                    <p>
                        Enabling AT interoperability is a large, ongoing
                        endeavor that requires industry-wide collaboration and
                        support. The W3C ARIA-AT Community Group is currently
                        focusing on a stable and mature test suite for five
                        screen readers. In the future, we plan to test
                        additional screen readers and other kinds of assistive
                        technologies with a broader set of web design patterns
                        and test material.
                    </p>
                    <p>Learn how you can help by:</p>
                    <ol>
                        <li>
                            <a href="https://github.com/w3c/aria-at/wiki/Contributing-to-the-ARIA-and-Assistive-Technologies-Project">
                                Reading more about the project and spreading
                                awareness of its mission
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/w3c/aria-at/wiki/Frequently-Asked-Questions">
                                Browsing the ARIA-AT Frequently Asked Questions
                                (FAQ)
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/w3c/aria-at/wiki/How-to-Join-the-ARIA-AT-Community-Group">
                                Joining the community group
                            </a>{' '}
                            to participate in our mailing list and conference
                            calls
                        </li>
                    </ol>
                </div>
            </section>
        </Container>
    );
};

export default Home;
