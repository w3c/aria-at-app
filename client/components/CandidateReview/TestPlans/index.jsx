import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from '@emotion/styled';
import { Container, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFlag,
    faCheck,
    faChevronUp,
    faChevronDown,
    faCommentAlt
} from '@fortawesome/free-solid-svg-icons';
import alphabetizeObjectBy from '@client/utils/alphabetizeObjectBy';
import {
    getTestPlanTargetTitle,
    getTestPlanVersionTitle
} from '@components/Reports/getTitles';
import ClippedProgressBar from '@components/common/ClippedProgressBar';
import { convertDateToString } from '@client/utils/formatter';
import './TestPlans.css';

const FullHeightContainer = styled(Container)`
    min-height: calc(100vh - 64px);
`;

const StatusText = styled.span`
    height: 1.625em;
    font-size: 0.875em;
    padding: 4px 10px;
    border-radius: 1.625rem;

    overflow: hidden;
    white-space: nowrap;

    &.feedback {
        border: 2px solid #b253f8;
        svg {
            color: #b253f8;
        }
    }

    &.changes-requested {
        border: 2px solid #f87f1b;
        svg {
            color: #f87f1b;
        }
    }

    &.ready-for-review {
        border: 2px solid #edbb1d;

        span.dot {
            height: 10px;
            width: 10px;
            padding: 0;
            margin-right: 8px;
            border-radius: 50%;
            background: #edbb1d;
        }
    }

    &.in-progress {
        border: 2px solid #2560ab;

        span.dot {
            height: 10px;
            width: 10px;
            padding: 0;
            margin-right: 8px;
            border-radius: 50%;
            background: #2560ab;
        }
    }

    &.approved {
        border: 2px solid #309d08;
        svg {
            color: #309d08;
        }
    }
`;

const DisclosureParent = styled.div`
    border: 1px solid #d3d5da;
    border-radius: 3px;
    margin-bottom: 3rem;

    h3 {
        margin: 0;
        padding: 0;
    }
`;

const DisclosureButton = styled.button`
    position: relative;
    width: 100%;
    margin: 0;
    padding: 0.75rem;
    text-align: left;
    font-size: 1.5rem;
    font-weight: 500;
    border: none;
    border-radius: 3px;
    background-color: transparent;

    &:hover,
    &:focus {
        padding: 0.75rem;
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
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;

    svg {
        align-self: center;
        margin: 0;
    }
`;

const CenteredTh = styled.th`
    text-align: center;
`;

const CenteredTd = styled.td`
    text-align: center;
    vertical-align: middle !important;
`;

const StyledH3 = styled.h3`
    padding: 0;
    margin: 0 0 0.75rem;
    text-align: left;
    font-size: 1.5rem;
    font-weight: 500;
`;

const None = styled.span`
    font-style: italic;
    color: #727272;
    padding: 12px;

    &.bordered {
        border-top: 1px solid #d2d5d9;
    }
`;

const TestPlans = ({ testPlanVersions }) => {
    const [atExpandTableItems, setAtExpandTableItems] = useState({
        1: true,
        2: true,
        3: true
    });

    const none = <None>None</None>;
    const borderedNone = <None className="bordered">None</None>;

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

    const testPlanReportsExist = testPlanVersions.some(
        testPlanVersion => testPlanVersion.testPlanReports.length
    );

    if (!testPlanReportsExist) {
        return (
            <FullHeightContainer id="main" as="main" tabIndex="-1">
                <Helmet>
                    <title>Candidate Review | ARIA-AT</title>
                </Helmet>
                <h1>Candidate Review</h1>
                <p>
                    There are no results to show just yet. Please check back
                    soon!
                </p>
            </FullHeightContainer>
        );
    }

    const getRowStatus = ({
        issues = [],
        isInProgressStatusExists,
        isApprovedStatusExists
    }) => {
        let issueChangesRequestedTypeCount = 0;
        let issueFeedbackTypeCount = 0;

        for (let i = 0; i < issues.length; i++) {
            if (issues[i].feedbackType === 'CHANGES_REQUESTED')
                issueChangesRequestedTypeCount++;
            else issueFeedbackTypeCount++;
        }

        const changesRequestedContent = (
            <>
                <StatusText className="changes-requested">
                    <FontAwesomeIcon icon={faFlag} />
                    Changes requested for {issueChangesRequestedTypeCount} test
                    {issueChangesRequestedTypeCount !== 1 ? 's' : ''}
                </StatusText>
            </>
        );

        const issueFeedbackContent = (
            <>
                <StatusText className="feedback">
                    <FontAwesomeIcon icon={faCommentAlt} />
                    Feedback left for {issueFeedbackTypeCount} test
                    {issueFeedbackTypeCount !== 1 ? 's' : ''}
                </StatusText>
            </>
        );

        const approvedContent = (
            <>
                <StatusText className="approved">
                    <FontAwesomeIcon icon={faCheck} />
                    Approved
                </StatusText>
            </>
        );

        const inProgressContent = (
            <>
                <StatusText className="in-progress">
                    <span className="dot" aria-hidden={true} />
                    Review in Progress
                </StatusText>
            </>
        );

        const readyForReviewContent = (
            <>
                <StatusText className="ready-for-review">
                    <span className="dot" aria-hidden={true} />
                    Ready for Review
                </StatusText>
            </>
        );

        let result = null;
        if (issueChangesRequestedTypeCount) result = changesRequestedContent;
        else if (issueFeedbackTypeCount) {
            result = issueFeedbackContent;
            if (isApprovedStatusExists)
                result = (
                    <>
                        {result && (
                            <>
                                {result}
                                <br />
                                <br />
                            </>
                        )}
                        {approvedContent}
                    </>
                );
        } else if (isInProgressStatusExists) result = inProgressContent;
        else if (isApprovedStatusExists) result = approvedContent;
        else result = readyForReviewContent;

        return result;
    };

    const evaluateTestsAssertionsMessage = ({
        totalSupportPercent,
        browsersLength,
        totalTestsFailedCount,
        totalAssertionsFailedCount
    }) => {
        if (totalSupportPercent === 100) {
            return (
                <>
                    <b>No assertions</b> failed
                </>
            );
        } else {
            return (
                <>
                    <b>
                        {totalAssertionsFailedCount} assertion
                        {totalAssertionsFailedCount !== 1 ? 's' : ''}
                    </b>{' '}
                    failed across{' '}
                    <b>
                        {totalTestsFailedCount} test
                        {totalTestsFailedCount !== 1 ? 's' : ''}
                    </b>{' '}
                    run with{' '}
                    <b>
                        {browsersLength} browser
                        {browsersLength !== 1 ? 's' : ''}
                    </b>
                </>
            );
        }
    };

    const uniqueFilter = (element, unique, key) => {
        const isDuplicate = unique.includes(element[key]);
        if (!isDuplicate) {
            unique.push(element[key]);
            return true;
        }
        return false;
    };

    const constructTableForAtById = (atId, atName) => {
        const testPlanReportsForAtExists = testPlanVersions.some(
            testPlanVersion =>
                testPlanVersion.testPlanReports.some(
                    testPlanReport => testPlanReport.at.id == atId
                )
        );

        // return 'None' element if no reports exists for AT
        if (!testPlanReportsForAtExists) {
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
                                size="xs"
                            />
                        </DisclosureButton>
                    </h3>
                    <DisclosureContainer
                        role="region"
                        id={`expand-at-${atId}`}
                        aria-labelledby={`expand-at-${atId}-button`}
                        show={!!atExpandTableItems[atId]}
                    >
                        {borderedNone}
                    </DisclosureContainer>
                </DisclosureParent>
            );
        }

        let testPlanTargetsById = {};
        testPlanVersions.forEach(testPlanVersion => {
            const { testPlanReports } = testPlanVersion;

            testPlanReports.forEach(testPlanReport => {
                const { at, browser } = testPlanReport;
                // Construct testPlanTarget
                const testPlanTarget = {
                    id: `${at.id}${browser.id}`,
                    at,
                    browser
                };
                testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
            });
        });
        testPlanTargetsById = alphabetizeObjectBy(
            testPlanTargetsById,
            keyValue => getTestPlanTargetTitle(keyValue[1])
        );

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
                            size="xs"
                        />
                    </DisclosureButton>
                </h3>
                <DisclosureContainer
                    role="region"
                    id={`expand-at-${atId}`}
                    aria-labelledby={`expand-at-${atId}-button`}
                    show={!!atExpandTableItems[atId]}
                >
                    <Table bordered responsive aria-label={atName}>
                        <thead>
                            <tr>
                                <th>Candidate Test Plans</th>
                                <CenteredTh>
                                    Candidate Phase Start Date
                                </CenteredTh>
                                <CenteredTh>Target Completion Date</CenteredTh>
                                <CenteredTh>Review Status</CenteredTh>
                                <CenteredTh>Results Summary</CenteredTh>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(testPlanVersions)
                                .sort((a, b) => (a.title < b.title ? -1 : 1))
                                .map(testPlanVersion => {
                                    const testPlanReports =
                                        testPlanVersion.testPlanReports.filter(
                                            ({ at }) => at.id === atId
                                        );
                                    const candidatePhaseReachedAt =
                                        testPlanVersion.candidatePhaseReachedAt;
                                    const recommendedPhaseTargetDate =
                                        testPlanVersion.recommendedPhaseTargetDate;

                                    const allMetrics = [];

                                    let testsCount = 0;
                                    let dataExists = false;

                                    Object.values(testPlanTargetsById).map(
                                        testPlanTarget => {
                                            const testPlanReport =
                                                testPlanReports.find(
                                                    testPlanReport =>
                                                        testPlanReport.at.id ===
                                                            testPlanTarget.at
                                                                .id &&
                                                        testPlanReport.at.id ===
                                                            atId &&
                                                        testPlanReport.browser
                                                            .id ===
                                                            testPlanTarget
                                                                .browser.id
                                                );

                                            if (testPlanReport) {
                                                const metrics =
                                                    testPlanReport.metrics;
                                                allMetrics.push(metrics);

                                                if (
                                                    !dataExists &&
                                                    testPlanReport.at.id ===
                                                        atId
                                                ) {
                                                    dataExists = true;
                                                }

                                                testsCount =
                                                    metrics.testsCount >
                                                    testsCount
                                                        ? metrics.testsCount
                                                        : testsCount;
                                            }
                                        }
                                    );

                                    const metrics = {
                                        testsCount,
                                        browsersLength: allMetrics.length,
                                        totalTestsFailedCount:
                                            allMetrics.reduce(
                                                (acc, obj) =>
                                                    acc + obj.testsFailedCount,
                                                0
                                            ),
                                        totalAssertionsFailedCount:
                                            allMetrics.reduce(
                                                (acc, obj) =>
                                                    acc +
                                                    obj.shouldAssertionsFailedCount +
                                                    obj.mustAssertionsFailedCount,
                                                0
                                            ),
                                        totalSupportPercent:
                                            Math.round(
                                                allMetrics.reduce(
                                                    (acc, obj) =>
                                                        acc +
                                                        obj.supportPercent,
                                                    0
                                                ) / allMetrics.length
                                            ) || 0
                                    };

                                    // Make sure issues are unique
                                    const uniqueLinks = [];
                                    const allIssues = testPlanReports
                                        .map(testPlanReport => [
                                            ...testPlanReport.issues
                                        ])
                                        .flat()
                                        .filter(
                                            t => t.isCandidateReview === true
                                        )
                                        .filter(t =>
                                            uniqueFilter(t, uniqueLinks, 'link')
                                        );

                                    return (
                                        dataExists && (
                                            <tr key={testPlanVersion.id}>
                                                <th>
                                                    <Link
                                                        to={`/candidate-test-plan/${testPlanVersion.id}/${atId}`}
                                                    >
                                                        {getTestPlanVersionTitle(
                                                            testPlanVersion
                                                        )}{' '}
                                                        {
                                                            testPlanVersion.versionString
                                                        }{' '}
                                                        ({testsCount} Test
                                                        {testsCount === 0 ||
                                                        testsCount > 1
                                                            ? `s`
                                                            : ''}
                                                        )
                                                    </Link>
                                                </th>
                                                <CenteredTd>
                                                    <i>
                                                        {convertDateToString(
                                                            candidatePhaseReachedAt,
                                                            'MMM D, YYYY'
                                                        )}
                                                    </i>
                                                </CenteredTd>
                                                <CenteredTd>
                                                    <i>
                                                        {convertDateToString(
                                                            recommendedPhaseTargetDate,
                                                            'MMM D, YYYY'
                                                        )}
                                                    </i>
                                                </CenteredTd>
                                                <CenteredTd>
                                                    {getRowStatus({
                                                        issues: allIssues,
                                                        isInProgressStatusExists:
                                                            testPlanReports.some(
                                                                testPlanReport =>
                                                                    testPlanReport.vendorReviewStatus ===
                                                                    'IN_PROGRESS'
                                                            ),
                                                        isApprovedStatusExists:
                                                            testPlanReports.some(
                                                                testPlanReport =>
                                                                    testPlanReport.vendorReviewStatus ===
                                                                    'APPROVED'
                                                            )
                                                    })}
                                                </CenteredTd>
                                                <CenteredTd>
                                                    <Link
                                                        to={`/candidate-test-plan/${testPlanVersion.id}/${atId}`}
                                                    >
                                                        <ClippedProgressBar
                                                            progress={
                                                                metrics.totalSupportPercent
                                                            }
                                                            label={`${metrics.totalSupportPercent}% completed`}
                                                            clipped
                                                        />
                                                    </Link>
                                                    <CellSubRow
                                                        style={{
                                                            justifyContent:
                                                                'center'
                                                        }}
                                                    >
                                                        <i>
                                                            {evaluateTestsAssertionsMessage(
                                                                metrics
                                                            )}
                                                        </i>
                                                    </CellSubRow>
                                                </CenteredTd>
                                            </tr>
                                        )
                                    );
                                })}
                        </tbody>
                    </Table>
                </DisclosureContainer>
            </DisclosureParent>
        );
    };

    const constructTableForResultsSummary = () => {
        if (!testPlanReportsExist) return borderedNone;

        let testPlanTargetsById = {};
        testPlanVersions.forEach(testPlanVersion => {
            const { testPlanReports } = testPlanVersion;

            testPlanReports.forEach(testPlanReport => {
                const { at, browser } = testPlanReport;
                // Construct testPlanTarget
                const testPlanTarget = {
                    id: `${at.id}${browser.id}`,
                    at,
                    browser
                };
                testPlanTargetsById[testPlanTarget.id] = testPlanTarget;
            });
        });
        testPlanTargetsById = alphabetizeObjectBy(
            testPlanTargetsById,
            keyValue => getTestPlanTargetTitle(keyValue[1])
        );

        return (
            <>
                <StyledH3>Review Status Summary</StyledH3>
                <Table bordered responsive>
                    <thead>
                        <tr>
                            <th>Test Plan</th>
                            <CenteredTh>JAWS</CenteredTh>
                            <CenteredTh>NVDA</CenteredTh>
                            <CenteredTh>VoiceOver for macOS</CenteredTh>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(testPlanVersions)
                            .sort((a, b) => (a.title < b.title ? -1 : 1))
                            .map(testPlanVersion => {
                                const testPlanReports =
                                    testPlanVersion.testPlanReports;

                                let jawsDataExists = false;
                                let nvdaDataExists = false;
                                let voDataExists = false;

                                Object.values(testPlanTargetsById).map(
                                    testPlanTarget => {
                                        const testPlanReport =
                                            testPlanReports.find(
                                                testPlanReport =>
                                                    testPlanReport.at.id ===
                                                        testPlanTarget.at.id &&
                                                    testPlanReport.browser
                                                        .id ===
                                                        testPlanTarget.browser
                                                            .id
                                            );

                                        if (testPlanReport) {
                                            if (
                                                !jawsDataExists &&
                                                testPlanReport.at.id === '1'
                                            ) {
                                                jawsDataExists = true;
                                            }
                                            if (
                                                !nvdaDataExists &&
                                                testPlanReport.at.id === '2'
                                            ) {
                                                nvdaDataExists = true;
                                            }
                                            if (
                                                !voDataExists &&
                                                testPlanReport.at.id === '3'
                                            ) {
                                                voDataExists = true;
                                            }
                                        }
                                    }
                                );

                                const allJawsIssues = [];
                                const allNvdaIssues = [];
                                const allVoIssues = [];

                                const jawsTestPlanReports =
                                    testPlanReports.filter(t => {
                                        if (t.at.id === '1') {
                                            allJawsIssues.push(...t.issues);
                                            return true;
                                        } else return false;
                                    });
                                const nvdaTestPlanReports =
                                    testPlanReports.filter(t => {
                                        if (t.at.id === '2') {
                                            allNvdaIssues.push(...t.issues);
                                            return true;
                                        } else return false;
                                    });
                                const voTestPlanReports =
                                    testPlanReports.filter(t => {
                                        if (t.at.id === '3') {
                                            allVoIssues.push(...t.issues);
                                            return true;
                                        } else return false;
                                    });

                                const uniqueLinks = [];
                                const jawsIssues = allJawsIssues.filter(t =>
                                    uniqueFilter(t, uniqueLinks, 'link')
                                );
                                const nvdaIssues = allNvdaIssues.filter(t =>
                                    uniqueFilter(t, uniqueLinks, 'link')
                                );
                                const voIssues = allVoIssues.filter(t =>
                                    uniqueFilter(t, uniqueLinks, 'link')
                                );

                                return (
                                    <tr key={testPlanVersion.id}>
                                        <td>
                                            {getTestPlanVersionTitle(
                                                testPlanVersion
                                            )}{' '}
                                            {testPlanVersion.versionString}
                                        </td>
                                        <CenteredTd>
                                            {jawsDataExists
                                                ? getRowStatus({
                                                      issues: jawsIssues,
                                                      isInProgressStatusExists:
                                                          jawsTestPlanReports.some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'IN_PROGRESS'
                                                          ),
                                                      isApprovedStatusExists:
                                                          jawsTestPlanReports.some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'APPROVED'
                                                          )
                                                  })
                                                : none}
                                        </CenteredTd>
                                        <CenteredTd>
                                            {nvdaDataExists
                                                ? getRowStatus({
                                                      issues: nvdaIssues,
                                                      isInProgressStatusExists:
                                                          nvdaTestPlanReports.some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'IN_PROGRESS'
                                                          ),
                                                      isApprovedStatusExists:
                                                          nvdaTestPlanReports.some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'APPROVED'
                                                          )
                                                  })
                                                : none}
                                        </CenteredTd>
                                        <CenteredTd>
                                            {voDataExists
                                                ? getRowStatus({
                                                      issues: voIssues,
                                                      isInProgressStatusExists:
                                                          voTestPlanReports.some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'IN_PROGRESS'
                                                          ),
                                                      isApprovedStatusExists:
                                                          voTestPlanReports.some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'APPROVED'
                                                          )
                                                  })
                                                : none}
                                        </CenteredTd>
                                    </tr>
                                );
                            })}
                    </tbody>
                </Table>
            </>
        );
    };

    return (
        <FullHeightContainer id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>Candidate Review | ARIA-AT</title>
            </Helmet>
            <h1>Candidate Review</h1>
            <h2>Introduction</h2>
            <p>
                This page summarizes the test results for each AT and Browser
                which executed the Test Plan.
            </p>
            {constructTableForAtById('1', 'JAWS')}
            {constructTableForAtById('2', 'NVDA')}
            {constructTableForAtById('3', 'VoiceOver for macOS')}
            {constructTableForResultsSummary()}
        </FullHeightContainer>
    );
};

TestPlans.propTypes = {
    testPlanVersions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            phase: PropTypes.string.isRequired,
            gitSha: PropTypes.string,
            testPlan: PropTypes.shape({
                directory: PropTypes.string
            }),
            metadata: PropTypes.object,
            testPlanReports: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    metrics: PropTypes.object.isRequired,
                    at: PropTypes.object.isRequired,
                    browser: PropTypes.object.isRequired
                })
            )
        })
    ).isRequired,
    triggerPageUpdate: PropTypes.func
};

export default TestPlans;
