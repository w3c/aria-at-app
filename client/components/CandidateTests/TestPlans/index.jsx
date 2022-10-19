import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import { Helmet } from 'react-helmet';
import styled from '@emotion/styled';
import { Container, Button, Dropdown, Table } from 'react-bootstrap';
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
import {
    LoadingStatus,
    useTriggerLoad
} from '@components/common/LoadingStatus';
import {
    UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION,
    UPDATE_TEST_PLAN_REPORT_RECOMMENDED_TARGET_DATE_MUTATION
} from '@components/TestQueue/queries';
import UpdateTargetDateModal from '@components/common/UpdateTargetDateModal';
import ClippedProgressBar from '@components/common/ClippedProgressBar';
import {
    convertDateToString,
    convertStringFormatToAnotherFormat
} from '@client/utils/formatter';
import { useThemedModal, THEMES } from '@client/hooks/useThemedModal';
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
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
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

const TestPlans = ({ testPlanReports, triggerPageUpdate = () => {} }) => {
    const { triggerLoad, loadingMessage } = useTriggerLoad();
    const {
        themedModal,
        showThemedModal,
        setShowThemedModal,
        setThemedModalContent
    } = useThemedModal({
        type: THEMES.WARNING,
        title: 'Error Updating Test Plan Status'
    });

    const [updateTestPlanReportStatus] = useMutation(
        UPDATE_TEST_PLAN_REPORT_STATUS_MUTATION
    );
    const [updateTestPlanReportRecommendedTargetDate] = useMutation(
        UPDATE_TEST_PLAN_REPORT_RECOMMENDED_TARGET_DATE_MUTATION
    );

    const changeTargetDateButtonRefs = useRef({});
    const focusButtonRef = useRef();

    const [atExpandTableItems, setAtExpandTableItems] = useState({
        1: true,
        2: true,
        3: true
    });
    const [showUpdateTargetDateModal, setShowUpdateTargetDateModal] = useState(
        false
    );
    const [
        updateTargetDateModalTitle,
        setUpdateTargetDateModalTitle
    ] = useState('');
    const [
        updateTargetDateModalDateText,
        setUpdateTargetDateModalDateText
    ] = useState('');
    const [testPlanReportsToUpdate, setTestPlanReportsToUpdate] = useState([]);

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

    const updateReportStatus = async (testPlanReports, status) => {
        try {
            const updateTestPlanReportPromises = testPlanReports.map(
                testPlanReport => {
                    return updateTestPlanReportStatus({
                        variables: {
                            testReportId: testPlanReport.id,
                            status
                        }
                    });
                }
            );

            await triggerLoad(async () => {
                await Promise.all(updateTestPlanReportPromises);
                await triggerPageUpdate();
            }, 'Updating Test Plan Status');
        } catch (e) {
            setShowThemedModal(true);
            setThemedModalContent(<>{e.message}</>);
        }
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
                    Ready for Review
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
        else if (isInProgressStatusExists) result = inProgressContent;
        else if (isApprovedStatusExists || issueFeedbackTypeCount) {
            if (issueFeedbackTypeCount) result = issueFeedbackContent;
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
        } else result = readyForReviewContent;

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

    const constructTableForAtById = (atId, atName) => {
        const testPlanReportsByAtId = testPlanReports.filter(
            t => t.at.id === atId
        );

        // return 'None' element if no reports exists for AT
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
            <LoadingStatus message={loadingMessage}>
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
                        <Table
                            bordered
                            responsive
                            aria-label={testPlanReportsByAtId[0].at.name}
                        >
                            <thead>
                                <tr>
                                    <th>Candidate Test Plans</th>
                                    <CenteredTh>Review Status</CenteredTh>
                                    <CenteredTh>Results Summary</CenteredTh>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(testPlanVersionsById).map(
                                    testPlanVersion => {
                                        // All testPlanReports across browsers per AT
                                        const testPlanReports = [];
                                        const allMetrics = [];

                                        let candidateStatusReachedAt;
                                        let recommendedStatusTargetDate;
                                        let testsCount = 0;

                                        Object.values(testPlanTargetsById).map(
                                            testPlanTarget => {
                                                const testPlanReport =
                                                    tabularReports[
                                                        testPlanVersion.id
                                                    ][testPlanTarget.id];

                                                if (testPlanReport) {
                                                    const metrics =
                                                        testPlanReport.metrics;
                                                    testPlanReports.push(
                                                        testPlanReport
                                                    );
                                                    allMetrics.push(metrics);

                                                    const {
                                                        candidateStatusReachedAt: testPlanReportCandidateStatusReachedAt,
                                                        recommendedStatusTargetDate: testPlanReportRecommendedStatusTargetDate
                                                    } = testPlanReport;

                                                    if (
                                                        !candidateStatusReachedAt
                                                    ) {
                                                        candidateStatusReachedAt = testPlanReportCandidateStatusReachedAt;
                                                    }
                                                    // Use earliest candidateStatusReachedAt across browser results for AT
                                                    else {
                                                        candidateStatusReachedAt =
                                                            new Date(
                                                                testPlanReportCandidateStatusReachedAt
                                                            ) <
                                                            new Date(
                                                                candidateStatusReachedAt
                                                            )
                                                                ? testPlanReportCandidateStatusReachedAt
                                                                : candidateStatusReachedAt;
                                                    }

                                                    if (
                                                        !recommendedStatusTargetDate
                                                    ) {
                                                        recommendedStatusTargetDate = testPlanReportRecommendedStatusTargetDate;
                                                    }
                                                    // Use latest recommendStatusTargetDate across browser results for AT
                                                    else {
                                                        recommendedStatusTargetDate =
                                                            new Date(
                                                                testPlanReportRecommendedStatusTargetDate
                                                            ) >
                                                            new Date(
                                                                recommendedStatusTargetDate
                                                            )
                                                                ? testPlanReportRecommendedStatusTargetDate
                                                                : recommendedStatusTargetDate;
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
                                            totalTestsFailedCount: allMetrics.reduce(
                                                (acc, obj) =>
                                                    acc + obj.testsFailedCount,
                                                0
                                            ),
                                            totalAssertionsFailedCount: allMetrics.reduce(
                                                (acc, obj) =>
                                                    acc +
                                                    obj.optionalAssertionsFailedCount +
                                                    obj.requiredAssertionsFailedCount,
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
                                        const allIssues = testPlanReports
                                            .map(testPlanReport => [
                                                ...testPlanReport.issues
                                            ])
                                            .flat();

                                        return (
                                            <tr key={testPlanVersion.id}>
                                                <td>
                                                    {/*TODO: Insert link when merged with Candidate Test Page branch*/}
                                                    <Link
                                                        to={`/candidate-test-plan/${testPlanVersion.id}/${atId}`}
                                                    >
                                                        {getTestPlanVersionTitle(
                                                            testPlanVersion
                                                        )}{' '}
                                                        ({testsCount} Tests)
                                                    </Link>
                                                    <CellSubRow>
                                                        <i>
                                                            Candidate Phase
                                                            Start Date{' '}
                                                            <b>
                                                                {convertDateToString(
                                                                    candidateStatusReachedAt,
                                                                    'MMM D, YYYY'
                                                                )}
                                                            </b>
                                                        </i>
                                                        <i>
                                                            Target Completion
                                                            Date{' '}
                                                            <b>
                                                                {convertDateToString(
                                                                    recommendedStatusTargetDate,
                                                                    'MMM D, YYYY'
                                                                )}
                                                            </b>
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
                                                                <Dropdown.Item
                                                                    role="menuitem"
                                                                    onClick={async () => {
                                                                        await updateReportStatus(
                                                                            testPlanReports,
                                                                            'DRAFT'
                                                                        );
                                                                    }}
                                                                >
                                                                    Draft
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    role="menuitem"
                                                                    onClick={async () => {
                                                                        await updateReportStatus(
                                                                            testPlanReports,
                                                                            'FINALIZED'
                                                                        );
                                                                    }}
                                                                    disabled={testPlanReports.some(
                                                                        t =>
                                                                            t.vendorReviewStatus !==
                                                                            'APPROVED'
                                                                    )}
                                                                >
                                                                    Recommended
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                        <Button
                                                            ref={changeTargetDateButtonRef =>
                                                                (changeTargetDateButtonRefs.current = {
                                                                    ...changeTargetDateButtonRefs.current,
                                                                    [`${testPlanVersion.id}-${atId}`]: changeTargetDateButtonRef
                                                                })
                                                            }
                                                            variant="secondary"
                                                            className="dropdown-btn-mark-as"
                                                            onClick={() => {
                                                                focusButtonRef.current =
                                                                    changeTargetDateButtonRefs.current[
                                                                        `${testPlanVersion.id}-${atId}`
                                                                    ];
                                                                setUpdateTargetDateModalTitle(
                                                                    `Change Target Date for ${testPlanVersion.title} for ${atName}`
                                                                );
                                                                setUpdateTargetDateModalDateText(
                                                                    recommendedStatusTargetDate
                                                                );
                                                                setShowUpdateTargetDateModal(
                                                                    true
                                                                );
                                                                setTestPlanReportsToUpdate(
                                                                    testPlanReports
                                                                );
                                                            }}
                                                        >
                                                            Change Target Date
                                                        </Button>
                                                    </CellSubRow>
                                                </td>
                                                <CenteredTd>
                                                    {getRowStatus({
                                                        issues: allIssues,
                                                        isInProgressStatusExists: testPlanReports.some(
                                                            testPlanReport =>
                                                                testPlanReport.vendorReviewStatus ===
                                                                'IN_PROGRESS'
                                                        ),
                                                        isApprovedStatusExists: testPlanReports.some(
                                                            testPlanReport =>
                                                                testPlanReport.vendorReviewStatus ===
                                                                'APPROVED'
                                                        )
                                                    })}
                                                </CenteredTd>
                                                <CenteredTd>
                                                    {/*TODO: Insert link when merged with Candidate Test Page branch*/}
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
                                        );
                                    }
                                )}
                            </tbody>
                        </Table>
                    </DisclosureContainer>
                </DisclosureParent>
            </LoadingStatus>
        );
    };

    const constructTableForResultsSummary = () => {
        if (!testPlanReports.length) return borderedNone;

        const testPlanReportsById = {};
        let testPlanTargetsById = {};
        let testPlanVersionsById = {};
        testPlanReports.forEach(testPlanReport => {
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
        testPlanReports.forEach(testPlanReport => {
            const { testPlanVersion, at, browser } = testPlanReport;

            // Construct testPlanTarget
            const testPlanTarget = { id: `${at.id}${browser.id}`, at, browser };
            tabularReports[testPlanVersion.id][
                testPlanTarget.id
            ] = testPlanReport;
        });

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
                        {Object.values(testPlanVersionsById).map(
                            testPlanVersion => {
                                const testPlanReports = [];
                                let jawsDataExists = false;
                                let nvdaDataExists = false;
                                let voDataExists = false;

                                Object.values(testPlanTargetsById).map(
                                    testPlanTarget => {
                                        const testPlanReport =
                                            tabularReports[testPlanVersion.id][
                                                testPlanTarget.id
                                            ];

                                        if (testPlanReport) {
                                            testPlanReports.push(
                                                testPlanReport
                                            );
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

                                const allIssues = testPlanReports
                                    .map(testPlanReport => [
                                        ...testPlanReport.issues
                                    ])
                                    .flat();

                                return (
                                    <tr key={testPlanVersion.id}>
                                        <td>
                                            {/*TODO: Insert link when merged with Candidate Test Page branch*/}
                                            <Link to={`/candidate-tests/`}>
                                                {getTestPlanVersionTitle(
                                                    testPlanVersion
                                                )}
                                            </Link>
                                        </td>
                                        <CenteredTd>
                                            {jawsDataExists
                                                ? getRowStatus({
                                                      issues: allIssues,
                                                      isInProgressStatusExists: testPlanReports
                                                          .filter(
                                                              t =>
                                                                  t.at.id ===
                                                                  '1'
                                                          )
                                                          .some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'IN_PROGRESS'
                                                          ),
                                                      isApprovedStatusExists: testPlanReports
                                                          .filter(
                                                              t =>
                                                                  t.at.id ===
                                                                  '1'
                                                          )
                                                          .some(
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
                                                      issues: allIssues,
                                                      isInProgressStatusExists: testPlanReports
                                                          .filter(
                                                              t =>
                                                                  t.at.id ===
                                                                  '2'
                                                          )
                                                          .some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'IN_PROGRESS'
                                                          ),
                                                      isApprovedStatusExists: testPlanReports
                                                          .filter(
                                                              t =>
                                                                  t.at.id ===
                                                                  '2'
                                                          )
                                                          .some(
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
                                                      issues: allIssues,
                                                      isInProgressStatusExists: testPlanReports
                                                          .filter(
                                                              t =>
                                                                  t.at.id ===
                                                                  '3'
                                                          )
                                                          .some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'IN_PROGRESS'
                                                          ),
                                                      isApprovedStatusExists: testPlanReports
                                                          .filter(
                                                              t =>
                                                                  t.at.id ===
                                                                  '3'
                                                          )
                                                          .some(
                                                              testPlanReport =>
                                                                  testPlanReport.vendorReviewStatus ===
                                                                  'APPROVED'
                                                          )
                                                  })
                                                : none}
                                        </CenteredTd>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </Table>
            </>
        );
    };

    const onUpdateTargetDateAction = async ({ updatedDateText }) => {
        onUpdateTargetDateModalClose();
        try {
            const updateTestPlanReportPromises = testPlanReportsToUpdate.map(
                testPlanReport => {
                    return updateTestPlanReportRecommendedTargetDate({
                        variables: {
                            testReportId: testPlanReport.id,
                            recommendedStatusTargetDate: convertStringFormatToAnotherFormat(
                                updatedDateText
                            )
                        }
                    });
                }
            );

            await triggerLoad(async () => {
                await Promise.all(updateTestPlanReportPromises);
                await triggerPageUpdate();
                if (focusButtonRef.current) focusButtonRef.current.focus();
            }, 'Updating Test Plan Recommended Target Date');
        } catch (e) {
            setShowThemedModal(true);
            setThemedModalContent(<>{e.message}</>);
        }
    };

    const onUpdateTargetDateModalClose = () => {
        setUpdateTargetDateModalDateText('');
        setShowUpdateTargetDateModal(false);
        if (focusButtonRef.current) focusButtonRef.current.focus();
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
            {constructTableForResultsSummary()}
            {showThemedModal && themedModal}
            {showUpdateTargetDateModal && (
                <UpdateTargetDateModal
                    show={showUpdateTargetDateModal}
                    title={updateTargetDateModalTitle}
                    dateText={updateTargetDateModalDateText}
                    handleAction={onUpdateTargetDateAction}
                    handleClose={onUpdateTargetDateModalClose}
                />
            )}
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
    ).isRequired,
    triggerPageUpdate: PropTypes.func
};

export default TestPlans;
