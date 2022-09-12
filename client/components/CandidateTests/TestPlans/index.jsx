import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from '@emotion/styled';
import { Container, Dropdown, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFlag,
    faCheck,
    faChevronUp,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import alphabetizeObjectBy from '@client/utils/alphabetizeObjectBy';
import {
    getTestPlanTargetTitle,
    getTestPlanVersionTitle
} from '@components/Reports/getTitles';
import getMetrics, { none } from '@components/Reports/getMetrics';

import './TestPlans.css';

const FullHeightContainer = styled(Container)`
    min-height: calc(100vh - 64px);
`;

const StatusText = styled.span`
    height: 1.625rem;
    font-size: 0.875rem;
    padding: 4px 10px;
    border-radius: 1.625rem;

    overflow: hidden;
    white-space: nowrap;

    &.ready-for-review {
        border: 2px solid #edbb1d;
    }

    &.issue {
        border: 2px solid #f87f1b;

        svg {
            color: #f87f1b;
        }
    }

    &.ok {
        border: 2px solid #309d08;

        svg {
            color: #309d08;
        }
    }

    &.dot {
        height: 10px;
        width: 10px;
        padding: 0;
        margin-right: 8px;
        border-radius: 50%;
        background: #edbb1d;
    }
`;

const DisclosureParent = styled.div`
    border: 1px solid #d3d5da;
    border-radius: 3px;
    margin-bottom: 1.25rem;

    h3 {
        margin: 0;
        padding: 0;
    }
`;

const DisclosureButton = styled.button`
    position: relative;
    width: 100%;
    margin: 0;
    padding: 1.25rem;
    text-align: left;
    font-size: 1.25rem;
    font-weight: bold;
    border: none;
    border-radius: 3px;
    background-color: transparent;

    &:hover,
    &:focus {
        padding: 1.25rem;
        border: 0 solid #005a9c;
        background-color: #def;
        cursor: pointer;
    }

    svg {
        position: absolute;
        margin: 0;
        top: 50%;
        right: 1.25rem;

        color: #969696;
        transform: translateY(-50%);
    }
`;

const DisclosureContainer = styled.div`
    display: ${({ show }) => (show ? 'flex' : 'none')};
    flex-direction: column;
    gap: 1.25rem;

    background-color: #f8f9fa;

    table {
        margin-bottom: 0;
    }
`;

const CellSubRow = styled.span`
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
`;

const TestPlans = ({ testPlanReports }) => {
    const [atExpandTableItems, setAtExpandTableItems] = useState({
        1: true
    });

    const onClickExpandAtTable = atId => {
        // { jaws/nvda/vo: boolean } ]
        if (!atExpandTableItems[atId])
            setAtExpandTableItems({ ...atExpandTableItems, [atId]: true });
        else
            setAtExpandTableItems({
                ...atExpandTableItems,
                [atId]: !atExpandTableItems[atId]
            });
    };

    if (!testPlanReports.length) {
        return (
            <FullHeightContainer id="main" as="main" tabIndex="-1">
                <Helmet>
                    <title>Candidate Tests | ARIA-AT</title>
                </Helmet>
                <h1>Candidate Tests</h1>
                <p>
                    There are no results to show just yet. Please check back
                    soon!
                </p>
            </FullHeightContainer>
        );
    }

    const getRowStatus = testPlanReport => {
        // TODO: Use some attribute on testPlanReport to determine status
        switch (testPlanReport?.magicAttribute) {
            case 1: {
                return (
                    <StatusText className="ok">
                        <FontAwesomeIcon icon={faCheck} />
                        Ok
                    </StatusText>
                );
            }
            case 2: {
                return (
                    <StatusText className="issue">
                        <FontAwesomeIcon icon={faFlag} />2 open issues
                    </StatusText>
                );
            }
            default: {
                return (
                    <StatusText className="ready-for-review">
                        <StatusText className="dot" aria-hidden={true} />
                        Ready for Review
                    </StatusText>
                );
            }
        }
    };

    const constructTableForAtById = (atId, atName) => {
        const testPlanReportsByAtId = testPlanReports.filter(
            t => t.at.id === atId
        );
        if (!testPlanReportsByAtId.length) {
            return (
                <DisclosureParent>
                    <h3>
                        <DisclosureButton
                            id={`expand-at-${atId}-button`}
                            type="button"
                            aria-expanded={!!atExpandTableItems[atId]}
                            aria-controls={`expand-at-${atId}`}
                            onClick={() => onClickExpandAtTable(atId)}
                        >
                            {atName}
                            <FontAwesomeIcon
                                icon={
                                    atExpandTableItems[atId]
                                        ? faChevronUp
                                        : faChevronDown
                                }
                            />
                        </DisclosureButton>
                    </h3>
                    <DisclosureContainer
                        role="region"
                        id={`expand-at-${atId}`}
                        aria-labelledby={`expand-at-${atId}-button`}
                        show={!!atExpandTableItems[atId]}
                    >
                        {none}
                    </DisclosureContainer>
                </DisclosureParent>
            );
        }

        const testPlanReportsById = {};
        let testPlanTargetsById = {};
        let testPlanVersionsById = {};
        testPlanReportsByAtId.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            testPlanReportsById[testPlanReport.id] = testPlanReport;
            testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
            testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
        });
        testPlanTargetsById = alphabetizeObjectBy(
            testPlanTargetsById,
            keyValue => getTestPlanTargetTitle(keyValue[1])
        );
        testPlanVersionsById = alphabetizeObjectBy(
            testPlanVersionsById,
            keyValue => getTestPlanVersionTitle(keyValue[1])
        );

        const tabularReports = {};
        Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
            tabularReports[testPlanVersionId] = {};
            Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
                tabularReports[testPlanVersionId][testPlanTargetId] = null;
            });
        });
        testPlanReportsByAtId.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            tabularReports[testPlanVersion.id][
                testPlanTarget.id
            ] = testPlanReport;
        });

        return (
            <>
                <DisclosureParent>
                    <h3>
                        <DisclosureButton
                            id={`expand-at-${atId}-button`}
                            type="button"
                            aria-expanded={!!atExpandTableItems[atId]}
                            aria-controls={`expand-at-${atId}`}
                            onClick={() => onClickExpandAtTable(atId)}
                        >
                            {atName}
                            <FontAwesomeIcon
                                icon={
                                    atExpandTableItems[atId]
                                        ? faChevronUp
                                        : faChevronDown
                                }
                            />
                        </DisclosureButton>
                    </h3>
                    <DisclosureContainer
                        role="region"
                        id={`expand-at-${atId}`}
                        aria-labelledby={`expand-at-${atId}-button`}
                        show={!!atExpandTableItems[atId]}
                    >
                        <Table
                            bordered
                            responsive
                            aria-label={testPlanReportsByAtId[0].at.name}
                        >
                            <thead>
                                <tr>
                                    <th>Candidate Test Plans</th>
                                    <th>Review Status</th>
                                    <th>Results Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(testPlanVersionsById).map(
                                    testPlanVersion => {
                                        // TODO: Evaluate metrics across tests
                                        const metrics = {
                                            supportPercent: 93
                                        };
                                        return (
                                            <tr key={testPlanVersion.id}>
                                                <td>
                                                    {/*TODO: Evaluate number of tests across ATs*/}
                                                    <Link
                                                        to={`/candidate-tests/${testPlanVersion.id}`}
                                                    >
                                                        {getTestPlanVersionTitle(
                                                            testPlanVersion
                                                        )}{' '}
                                                        (24 Tests)
                                                    </Link>
                                                    <CellSubRow>
                                                        <i>
                                                            Candidate Phase
                                                            Start Date{' '}
                                                            <b>Jul 6, 2022</b>
                                                        </i>
                                                        <i>
                                                            Target Completion
                                                            Date{' '}
                                                            <b>Jan 2, 2023</b>
                                                        </i>
                                                    </CellSubRow>
                                                    <CellSubRow>
                                                        <Dropdown className="dropdown-btn-mark-as">
                                                            <Dropdown.Toggle
                                                                variant="secondary"
                                                                aria-label="Change report status"
                                                            >
                                                                Mark as ...
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu role="menu">
                                                                <Dropdown.Item role="menuitem">
                                                                    Draft
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    role="menuitem"
                                                                    disabled
                                                                >
                                                                    Recommended
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        <Dropdown className="dropdown-btn-mark-as">
                                                            <Dropdown.Toggle variant="secondary">
                                                                Change Target
                                                                Date
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu role="menu"></Dropdown.Menu>
                                                        </Dropdown>
                                                    </CellSubRow>
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: 'center',
                                                        verticalAlign: 'middle'
                                                    }}
                                                >
                                                    {getRowStatus({})}
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: 'center',
                                                        verticalAlign: 'middle'
                                                    }}
                                                >
                                                    <Link
                                                        to={`/candidate-tests/some-id`}
                                                    >
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar bg-info"
                                                                style={{
                                                                    width: `${metrics.supportPercent}%`
                                                                }}
                                                            >
                                                                {
                                                                    metrics.supportPercent
                                                                }
                                                                %
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <CellSubRow
                                                        style={{
                                                            justifyContent:
                                                                'center'
                                                        }}
                                                    >
                                                        <i>
                                                            <b>10 assertions</b>{' '}
                                                            failed across{' '}
                                                            <b>4 tests</b> run
                                                            with{' '}
                                                            <b>2 browsers</b>
                                                        </i>
                                                    </CellSubRow>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </Table>
                    </DisclosureContainer>
                </DisclosureParent>
            </>
        );
    };

    const constructTableForResultsSummary = atId => {
        const testPlanReportsByAtId = testPlanReports.filter(
            t => t.at.id === atId
        );
        if (!testPlanReportsByAtId.length) return none;

        const testPlanReportsById = {};
        let testPlanTargetsById = {};
        let testPlanVersionsById = {};
        testPlanReportsByAtId.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            testPlanReportsById[testPlanReport.id] = testPlanReport;
            testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
            testPlanVersionsById[testPlanVersion.id] = testPlanVersion;
        });
        testPlanTargetsById = alphabetizeObjectBy(
            testPlanTargetsById,
            keyValue => getTestPlanTargetTitle(keyValue[1])
        );
        testPlanVersionsById = alphabetizeObjectBy(
            testPlanVersionsById,
            keyValue => getTestPlanVersionTitle(keyValue[1])
        );

        const tabularReports = {};
        Object.keys(testPlanVersionsById).forEach(testPlanVersionId => {
            tabularReports[testPlanVersionId] = {};
            Object.keys(testPlanTargetsById).forEach(testPlanTargetId => {
                tabularReports[testPlanVersionId][testPlanTargetId] = null;
            });
        });
        testPlanReportsByAtId.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            tabularReports[testPlanVersion.id][
                testPlanTarget.id
            ] = testPlanReport;
        });

        return (
            <>
                <Table
                    bordered
                    responsive
                    aria-label={testPlanReportsByAtId[0].at.name}
                >
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            {Object.values(testPlanTargetsById).map(
                                testPlanTarget => (
                                    <th key={testPlanTarget.id}>
                                        {testPlanTarget.browser.name}
                                    </th>
                                )
                            )}
                            <th>Review Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(testPlanVersionsById).map(
                            testPlanVersion => {
                                return (
                                    <tr key={testPlanVersion.id}>
                                        <td>
                                            <Link
                                                to={`/candidate-tests/${testPlanVersion.id}`}
                                            >
                                                {getTestPlanVersionTitle(
                                                    testPlanVersion
                                                )}
                                            </Link>
                                        </td>
                                        {Object.values(testPlanTargetsById).map(
                                            testPlanTarget => {
                                                const testPlanReport =
                                                    tabularReports[
                                                        testPlanVersion.id
                                                    ][testPlanTarget.id];
                                                if (!testPlanReport) {
                                                    return (
                                                        <td
                                                            key={`${testPlanVersion.id}-${testPlanTarget.id}`}
                                                        >
                                                            {none}
                                                        </td>
                                                    );
                                                }
                                                const metrics = getMetrics({
                                                    testPlanReport
                                                });
                                                return (
                                                    <td key={testPlanReport.id}>
                                                        <Link
                                                            to={`/candidate-tests/${testPlanVersion.id}`}
                                                        >
                                                            <div
                                                                className="progress"
                                                                aria-label={`${getTestPlanTargetTitle(
                                                                    testPlanTarget
                                                                )}, ${
                                                                    metrics.supportPercent
                                                                }% completed`}
                                                            >
                                                                <div
                                                                    className="progress-bar bg-info"
                                                                    style={{
                                                                        width: `${metrics.supportPercent}%`
                                                                    }}
                                                                >
                                                                    {
                                                                        metrics.supportPercent
                                                                    }
                                                                    %
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                );
                                            }
                                        )}
                                        <td>{getRowStatus({})}</td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </Table>
            </>
        );
    };

    return (
        <FullHeightContainer id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Candidate Tests | ARIA-AT</title>
            </Helmet>
            <h1>Candidate Tests</h1>
            <h2>Introduction</h2>
            <p>
                This page summarizes the test results for each AT and Browser
                which executed the Test Plan.
            </p>
            {constructTableForAtById('1', 'JAWS')}
            {constructTableForAtById('2', 'NVDA')}
            {constructTableForAtById('3', 'VoiceOver for macOS')}
        </FullHeightContainer>
    );
};

TestPlans.propTypes = {
    testPlanReports: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            testPlanVersion: PropTypes.shape({
                id: PropTypes.string.isRequired,
                title: PropTypes.string,
                testPlan: PropTypes.shape({
                    directory: PropTypes.string.isRequired
                }).isRequired
            }).isRequired
        })
    ).isRequired
};

export default TestPlans;
