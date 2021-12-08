import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { differenceBy } from 'lodash';
import getMetrics from './getMetrics';
import { getTestPlanTargetTitle, getTestPlanVersionTitle } from './getTitles';
import { Breadcrumb, Button, Container, Table, Modal } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import styled from '@emotion/styled';
import DisclaimerInfo from '../DisclaimerInfo';

const FullHeightContainer = styled(Container)`
    min-height: calc(100vh - 64px);
`;

const SummarizeTestPlanVersion = ({ testPlanVersion, testPlanReports }) => {
    const { exampleUrl, designPatternUrl } = testPlanVersion.metadata;
    function Example(props) {
        const [show, setShow] = useState(false);
      
        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);
      
        return (
          <>
            <Button variant="primary" onClick={handleShow}>
              Embed
            </Button>
      
            <Modal
              show={show}
              onHide={handleClose}
              backdrop="static"
              keyboard={false}
              dialogClassName="modal-90w"
            >
              <Modal.Header closeButton>
                <Modal.Title>Modal title</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <iframe width="560" height="315" src={props.url}></iframe>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary">Understood</Button>
              </Modal.Footer>
            </Modal>
          </>
        );
      }
    return (
        <FullHeightContainer id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>
                    {getTestPlanVersionTitle(testPlanVersion)} | ARIA-AT Reports
                </title>
            </Helmet>
            <h1>{getTestPlanVersionTitle(testPlanVersion)}</h1>
            <Breadcrumb>
                <LinkContainer to="/reports">
                    <Breadcrumb.Item>
                        <FontAwesomeIcon icon={faHome} />
                        Test Reports
                    </Breadcrumb.Item>
                </LinkContainer>
                <Breadcrumb.Item active>
                    {getTestPlanVersionTitle(testPlanVersion)}
                </Breadcrumb.Item>
            </Breadcrumb>
            <h2>Introduction</h2>
            <DisclaimerInfo />
            <p>
                This page summarizes the test results for each AT and Browser
                which executed the Test Plan.
            </p>
            <h2>Metadata</h2>
            <ul>
                {exampleUrl ? (
                    <li>
                        <a href={exampleUrl} target="_blank" rel="noreferrer">
                            Example Under Test
                        </a>
                    </li>
                ) : null}
                {designPatternUrl ? (
                    <li>
                        <a
                            href={designPatternUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Design Pattern
                        </a>
                    </li>
                ) : null}
            </ul>
            <Example url={`/reports/${testPlanVersion.id}`} />

            {testPlanReports.map(testPlanReport => {
                const skippedTests = differenceBy(
                    testPlanReport.runnableTests,
                    testPlanReport.finalizedTestResults,
                    testOrTestResult =>
                        testOrTestResult.test?.id ?? testOrTestResult.id
                );
                const overallMetrics = getMetrics({ testPlanReport });

                const { testPlanTarget } = testPlanReport;

                return (
                    <Fragment key={testPlanReport.id}>
                        <h2>{getTestPlanTargetTitle(testPlanTarget)}</h2>
                        <DisclaimerInfo />
                        <LinkContainer
                            to={
                                `/reports/${testPlanVersion.id}` +
                                `/targets/${testPlanReport.id}`
                            }
                        >
                            <Button variant="secondary" className="mr-3">
                                View Complete Results
                            </Button>
                        </LinkContainer>
                        <Example url={`/reports/${testPlanVersion.id}/targets/${testPlanReport.id}`} />
                        {skippedTests.length ? (
                            <Link
                                to={
                                    `/reports/${testPlanVersion.id}` +
                                    `/targets/${testPlanReport.id}` +
                                    `#skipped-tests`
                                }
                            >
                                {skippedTests.length} Tests Were Skipped
                            </Link>
                        ) : null}
                        <Table
                            className="mt-3"
                            bordered
                            responsive
                            aria-label={
                                `Results for ` +
                                `${getTestPlanTargetTitle(testPlanTarget)}`
                            }
                        >
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Required Assertions</th>
                                    <th>Optional Assertions</th>
                                    <th>Unexpected Behaviors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testPlanReport.finalizedTestResults.map(
                                    testResult => {
                                        const {
                                            requiredFormatted,
                                            optionalFormatted,
                                            unexpectedBehaviorsFormatted
                                        } = getMetrics({
                                            testResult
                                        });
                                        return (
                                            <tr key={testResult.id}>
                                                <td>
                                                    <Link
                                                        to={
                                                            `/reports/${testPlanVersion.id}` +
                                                            `/targets/${testPlanReport.id}` +
                                                            `#result-${testResult.id}`
                                                        }
                                                    >
                                                        {testResult.test.title}
                                                    </Link>
                                                </td>
                                                <td>{requiredFormatted}</td>
                                                <td>{optionalFormatted}</td>
                                                <td>
                                                    {
                                                        unexpectedBehaviorsFormatted
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                                <tr>
                                    <td>All Tests</td>
                                    <td>{overallMetrics.requiredFormatted}</td>
                                    <td>{overallMetrics.optionalFormatted}</td>
                                    <td>
                                        {
                                            overallMetrics.unexpectedBehaviorsFormatted
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Fragment>
                );
            })}
        </FullHeightContainer>
    );
};

SummarizeTestPlanVersion.propTypes = {
    testPlanVersion: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        metadata: PropTypes.shape({
            exampleUrl: PropTypes.string.isRequired,
            designPatternUrl: PropTypes.string
        }).isRequired
    }).isRequired,
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            runnableTests: PropTypes.arrayOf(PropTypes.object).isRequired,
            finalizedTestResults: PropTypes.arrayOf(PropTypes.object).isRequired
        }).isRequired
    ).isRequired
};

export default SummarizeTestPlanVersion;
