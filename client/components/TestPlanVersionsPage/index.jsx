import React, { useRef } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_PLAN_VERSIONS_PAGE_QUERY } from './queries';
import PageStatus from '../common/PageStatus';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container } from 'react-bootstrap';
import {
    ThemeTable,
    ThemeTableUnavailable,
    ThemeTableHeaderH3 as UnstyledThemeTableHeader
} from '../common/ThemeTable';
import VersionString from '../common/VersionString';
import PhasePill from '../common/PhasePill';
import { convertDateToString } from '../../utils/formatter';
import { derivePhaseName } from '../../utils/aria';
import styled from '@emotion/styled';
import {
    faArrowUpRightFromSquare,
    faCodeCommit
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DisclosureComponentUnstyled from '../common/DisclosureComponent';
import useForceUpdate from '../../hooks/useForceUpdate';

const DisclosureContainer = styled.div`
    .timeline-for-version-table {
        padding: 0.5rem 1rem;
    }
`;

const DisclosureComponent = styled(DisclosureComponentUnstyled)`
    h2 {
        font-size: 1.25em;

        button {
            font-size: unset;
            font-weight: unset;
        }
    }
`;

const NoneText = styled.span`
    font-style: italic;
    color: #6a7989;
`;

const PageCommitHistory = styled.div`
    padding: 1.5rem 0 1.5rem;
`;

const PageUl = styled.ul`
    margin-bottom: 2rem;

    li:not(:last-of-type) {
        margin-bottom: 8px;
    }
`;

const PageSpacer = styled.div`
    height: 3rem;
`;

const CoveredAtDl = styled.dl`
    margin-bottom: 2rem;

    dt {
        margin-bottom: 8px;
    }
    li:not(:last-of-type) {
        margin-bottom: 8px;
    }
`;

const ThemeTableHeader = styled(UnstyledThemeTableHeader)`
    margin: 0 !important;
`;

const TestPlanVersionsPage = () => {
    const { testPlanDirectory } = useParams();

    const { loading, data, error } = useQuery(TEST_PLAN_VERSIONS_PAGE_QUERY, {
        variables: { testPlanDirectory },
        fetchPolicy: 'cache-and-network'
    });
    const forceUpdate = useForceUpdate();

    const expandedVersionSections = useRef();
    const toggleVersionSections = useRef();

    if (error) {
        return (
            <PageStatus
                title="Test Plan Versions | ARIA-AT"
                heading="Test Plan Versions"
                message={error.message}
                isError
            />
        );
    }

    if (loading) {
        return (
            <PageStatus
                title="Loading - Test Plan Versions | ARIA-AT"
                heading="Test Plan Versions"
            />
        );
    }

    if (!data) return null;

    const getPhaseChangeDate = testPlanVersion => {
        let date;
        switch (testPlanVersion.phase) {
            case 'DRAFT':
                date = testPlanVersion.draftPhaseReachedAt;
                break;
            case 'CANDIDATE':
                date = testPlanVersion.candidatePhaseReachedAt;
                break;
            case 'RECOMMENDED':
                date = testPlanVersion.recommendedPhaseReachedAt;
                break;
            case 'RD':
                date = testPlanVersion.updatedAt;
                break;
            case 'DEPRECATED':
                date = testPlanVersion.deprecatedAt;
                break;
            default:
                throw new Error('Unexpected case');
        }
        return convertDateToString(date, 'MMM D, YYYY');
    };

    const getIconColor = testPlanVersion => {
        return testPlanVersion.phase === 'DEPRECATED' ||
            testPlanVersion.phase === 'RD'
            ? '#818F98'
            : '#2BA51C';
    };

    const getEventDate = testPlanVersion => {
        return convertDateToString(
            (() => {
                if (testPlanVersion.deprecatedAt) {
                    return testPlanVersion.deprecatedAt;
                }
                switch (testPlanVersion.phase) {
                    case 'RD':
                        return testPlanVersion.updatedAt;
                    case 'DRAFT':
                        return testPlanVersion.draftPhaseReachedAt;
                    case 'CANDIDATE':
                        return testPlanVersion.candidatePhaseReachedAt;
                    case 'RECOMMENDED':
                        return testPlanVersion.recommendedPhaseReachedAt;
                    case 'DEPRECATED':
                        return testPlanVersion.deprecatedAt;
                }
            })(),
            'MMM D, YYYY'
        );
    };

    const getEventBody = phase => {
        const phasePill = <PhasePill fullWidth={false}>{phase}</PhasePill>;

        switch (phase) {
            case 'RD':
                return <>{phasePill} Complete</>;
            case 'DRAFT':
            case 'CANDIDATE':
                return <>{phasePill} Review Started</>;
            case 'RECOMMENDED':
                return <>{phasePill} Approved</>;
            case 'DEPRECATED':
                return <>{phasePill}</>;
        }
    };

    const deriveDeprecatedDuringPhase = testPlanVersion => {
        let derivedPhaseDeprecatedDuring = 'RD';
        if (testPlanVersion.recommendedPhaseReachedAt)
            derivedPhaseDeprecatedDuring = 'RECOMMENDED';
        else if (testPlanVersion.candidatePhaseReachedAt)
            derivedPhaseDeprecatedDuring = 'CANDIDATE';
        else if (testPlanVersion.draftPhaseReachedAt)
            derivedPhaseDeprecatedDuring = 'DRAFT';

        return derivedPhaseDeprecatedDuring;
    };

    const testPlan = data.testPlan;

    // GraphQL results are read only so they need to be cloned before sorting
    const issues = [...testPlan.issues].sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt);
        const bCreatedAt = new Date(b.createdAt);
        return bCreatedAt - aCreatedAt;
    });

    const ats = data.ats;

    const testPlanVersions = data.testPlan.testPlanVersions
        .slice()
        .sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    const timelineForAllVersions = [];

    testPlanVersions.forEach(testPlanVersion => {
        const event = {
            id: testPlanVersion.id,
            updatedAt: testPlanVersion.updatedAt,
            versionString: testPlanVersion.versionString
        };
        timelineForAllVersions.push({ ...event, phase: 'RD' });

        if (testPlanVersion.draftPhaseReachedAt)
            timelineForAllVersions.push({
                ...event,
                phase: 'DRAFT',
                draftPhaseReachedAt: testPlanVersion.draftPhaseReachedAt
            });
        if (testPlanVersion.candidatePhaseReachedAt)
            timelineForAllVersions.push({
                ...event,
                phase: 'CANDIDATE',
                candidatePhaseReachedAt: testPlanVersion.candidatePhaseReachedAt
            });
        if (testPlanVersion.recommendedPhaseReachedAt)
            timelineForAllVersions.push({
                ...event,
                phase: 'RECOMMENDED',
                recommendedPhaseReachedAt:
                    testPlanVersion.recommendedPhaseReachedAt
            });
        if (testPlanVersion.deprecatedAt)
            timelineForAllVersions.push({
                ...event,
                phase: 'DEPRECATED',
                deprecatedAt: testPlanVersion.deprecatedAt
            });
    });

    const phaseOrder = {
        RD: 0,
        DRAFT: 1,
        CANDIDATE: 2,
        RECOMMENDED: 3,
        DEPRECATED: 4
    };

    timelineForAllVersions.sort((a, b) => {
        const dateA =
            a.recommendedPhaseReachedAt ||
            a.candidatePhaseReachedAt ||
            a.draftPhaseReachedAt ||
            a.deprecatedAt ||
            a.updatedAt;
        const dateB =
            b.recommendedPhaseReachedAt ||
            b.candidatePhaseReachedAt ||
            b.draftPhaseReachedAt ||
            b.deprecatedAt ||
            b.updatedAt;

        // If dates are the same, compare phases
        if (dateA === dateB) return phaseOrder[a.phase] - phaseOrder[b.phase];
        return new Date(dateA) - new Date(dateB);
    });

    if (!expandedVersionSections.current) {
        expandedVersionSections.current = [];
        toggleVersionSections.current = [];

        for (let i = 0; i < testPlanVersions.length; i += 1) {
            expandedVersionSections.current[i] = false;
            toggleVersionSections.current[i] = () => {
                expandedVersionSections.current[i] =
                    !expandedVersionSections.current[i];
                forceUpdate();
            };
        }
    }

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>{testPlan.title} Test Plan Versions | ARIA-AT</title>
            </Helmet>
            <h1>{testPlan.title} Test Plan Versions</h1>
            <PageCommitHistory>
                <FontAwesomeIcon
                    icon={faCodeCommit}
                    color="#818F98"
                    size="xs"
                />
                <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://github.com/w3c/aria-at/commits/master/tests/${testPlanDirectory}`}
                >
                    Commit History for aria-at/tests/{testPlanDirectory}
                </a>
            </PageCommitHistory>
            {!testPlanVersions.length ? null : (
                <>
                    <ThemeTableHeader id="version-summary">
                        Version Summary
                    </ThemeTableHeader>
                    <ThemeTable
                        bordered
                        responsive
                        aria-labelledby="version-summary"
                    >
                        <thead>
                            <tr>
                                <th>Version</th>
                                <th>Latest Phase</th>
                                <th>Phase Change Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testPlanVersions.map(testPlanVersion => (
                                <tr key={testPlanVersion.id}>
                                    <th>
                                        <VersionString
                                            iconColor={getIconColor(
                                                testPlanVersion
                                            )}
                                            autoWidth={false}
                                            linkHref={`/test-review/${testPlanVersion.id}`}
                                        >
                                            {testPlanVersion.versionString}
                                        </VersionString>
                                    </th>
                                    <td>
                                        {(() => {
                                            // Gets the derived phase even if deprecated by checking
                                            // the known dates on the testPlanVersion object
                                            const derivedDeprecatedAtPhase =
                                                deriveDeprecatedDuringPhase(
                                                    testPlanVersion
                                                );

                                            const phasePill = (
                                                <PhasePill fullWidth={false}>
                                                    {derivedDeprecatedAtPhase}
                                                </PhasePill>
                                            );

                                            if (testPlanVersion.deprecatedAt) {
                                                const deprecatedPill = (
                                                    <PhasePill
                                                        fullWidth={false}
                                                    >
                                                        DEPRECATED
                                                    </PhasePill>
                                                );

                                                const draftPill = (
                                                    <PhasePill
                                                        fullWidth={false}
                                                    >
                                                        DRAFT
                                                    </PhasePill>
                                                );

                                                if (
                                                    derivedDeprecatedAtPhase ===
                                                    'RD'
                                                ) {
                                                    return (
                                                        <>
                                                            {deprecatedPill}
                                                            {` before `}
                                                            {draftPill}
                                                            {` review `}
                                                        </>
                                                    );
                                                }

                                                if (
                                                    derivedDeprecatedAtPhase ===
                                                    'RECOMMENDED'
                                                ) {
                                                    return (
                                                        <>
                                                            {deprecatedPill}
                                                            {` after being approved as `}
                                                            {phasePill}
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        {deprecatedPill}
                                                        {` during `}
                                                        {phasePill}
                                                        {` review `}
                                                    </>
                                                );
                                            }
                                            return phasePill;
                                        })()}
                                    </td>
                                    <td>
                                        {getPhaseChangeDate(testPlanVersion)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </ThemeTable>
                    <PageSpacer />
                </>
            )}
            <ThemeTableHeader id="github-issues">
                GitHub Issues
            </ThemeTableHeader>
            {!issues.length ? (
                <ThemeTableUnavailable aria-labelledby="github-issues">
                    No GitHub Issues
                </ThemeTableUnavailable>
            ) : (
                <ThemeTable bordered responsive aria-labelledby="github-issues">
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Issue</th>
                            <th>Status</th>
                            <th>AT</th>
                            <th>Created On</th>
                            <th>Closed On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map(issue => {
                            return (
                                <tr key={issue.link}>
                                    <td>
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={`https://github.com/${issue.author}`}
                                        >
                                            {issue.author}
                                        </a>
                                    </td>
                                    <td>
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={issue.link}
                                        >
                                            {issue.title}
                                        </a>
                                    </td>
                                    <td>{issue.isOpen ? 'Open' : 'Closed'}</td>
                                    <td>
                                        {issue.at?.name ?? 'AT not specified'}
                                    </td>
                                    <td>
                                        {convertDateToString(
                                            issue.createdAt,
                                            'MMM D, YYYY'
                                        )}
                                    </td>
                                    <td>
                                        {!issue.closedAt ? (
                                            <NoneText>N/A</NoneText>
                                        ) : (
                                            convertDateToString(
                                                issue.closedAt,
                                                'MMM D, YYYY'
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </ThemeTable>
            )}
            <PageSpacer />
            <ThemeTableHeader id="timeline-for-all-versions">
                Timeline for All Versions
            </ThemeTableHeader>
            <ThemeTable
                bordered
                responsive
                aria-labelledby="timeline-for-all-versions"
            >
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Event</th>
                    </tr>
                </thead>
                <tbody>
                    {timelineForAllVersions.map(testPlanVersion => {
                        const versionString = (
                            <VersionString
                                iconColor={getIconColor(testPlanVersion)}
                                fullWidth={false}
                                autoWidth={false}
                            >
                                {testPlanVersion.versionString}
                            </VersionString>
                        );

                        const eventBody = getEventBody(testPlanVersion.phase);

                        return (
                            <tr
                                key={`${testPlanVersion.id}-${testPlanVersion.phase}`}
                            >
                                <th>{getEventDate(testPlanVersion)}</th>
                                <td>
                                    {versionString}&nbsp;{eventBody}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </ThemeTable>
            <PageSpacer />
            <DisclosureComponent
                componentId="versionHistory"
                title={testPlanVersions.map(testPlanVersion => {
                    return (
                        <span
                            key={testPlanVersion.id}
                            aria-label={`${
                                testPlanVersion.versionString
                            } ${derivePhaseName(
                                testPlanVersion.phase
                            )} on ${getEventDate(testPlanVersion)}`}
                        >
                            <VersionString
                                iconColor={getIconColor(testPlanVersion)}
                                fullWidth={false}
                                autoWidth={false}
                            >
                                {testPlanVersion.versionString}
                            </VersionString>
                            &nbsp;
                            <PhasePill fullWidth={false}>
                                {testPlanVersion.phase}
                            </PhasePill>
                            &nbsp;on&nbsp;
                            {getEventDate(testPlanVersion)}
                        </span>
                    );
                })}
                disclosureContainerView={testPlanVersions.map(
                    testPlanVersion => {
                        const hasFinalReports =
                            testPlanVersion.testPlanReports.some(
                                testPlanReport => testPlanReport.isFinal
                            );

                        return (
                            <div key={testPlanVersion.id}>
                                <DisclosureContainer
                                    key={`manage-test-queue-at-section`}
                                >
                                    <PageUl>
                                        <li>
                                            <FontAwesomeIcon
                                                icon={faCodeCommit}
                                                color="#818F98"
                                                size="xs"
                                            />
                                            <a
                                                target="_blank"
                                                rel="noreferrer"
                                                href={`https://github.com/w3c/aria-at/commit/${testPlanVersion.gitSha}`}
                                            >
                                                Commit{' '}
                                                {testPlanVersion.gitSha.substr(
                                                    0,
                                                    7
                                                )}
                                                : {testPlanVersion.gitMessage}
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href={`/test-review/${testPlanVersion.id}`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        faArrowUpRightFromSquare
                                                    }
                                                    size="xs"
                                                    color="#818F98"
                                                />
                                                View tests in{' '}
                                                {testPlanVersion.versionString}
                                            </a>
                                        </li>
                                        {!hasFinalReports ? null : (
                                            <li>
                                                <a
                                                    href={`/report/${testPlanVersion.id}`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faArrowUpRightFromSquare
                                                        }
                                                        size="xs"
                                                        color="#818F98"
                                                    />
                                                    View reports generated from{' '}
                                                    {
                                                        testPlanVersion.versionString
                                                    }
                                                </a>
                                            </li>
                                        )}
                                    </PageUl>
                                    <CoveredAtDl>
                                        <dt>Covered AT</dt>
                                        <dd>
                                            <ul>
                                                {ats.map(at => (
                                                    <li key={at.id}>
                                                        {at.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </CoveredAtDl>
                                    <ThemeTableHeader
                                        id={`timeline-for-${testPlanVersion.versionString}`}
                                        className="timeline-for-version-table"
                                    >
                                        Timeline for{' '}
                                        {testPlanVersion.versionString}
                                    </ThemeTableHeader>
                                    <ThemeTable
                                        bordered
                                        responsive
                                        aria-labelledby={`timeline-for-${testPlanVersion.versionString}`}
                                    >
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Event</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                let events = [
                                                    [
                                                        'RD',
                                                        testPlanVersion.updatedAt
                                                    ],
                                                    [
                                                        'DRAFT',
                                                        testPlanVersion.draftPhaseReachedAt
                                                    ],
                                                    [
                                                        'CANDIDATE',
                                                        testPlanVersion.candidatePhaseReachedAt
                                                    ],
                                                    [
                                                        'RECOMMENDED',
                                                        testPlanVersion.recommendedPhaseReachedAt
                                                    ],
                                                    [
                                                        'DEPRECATED',
                                                        testPlanVersion.deprecatedAt
                                                    ]
                                                ]
                                                    .filter(event => event[1])
                                                    .sort((a, b) => {
                                                        const dateSort =
                                                            new Date(a[1]) -
                                                            new Date(b[1]);
                                                        if (dateSort === 0)
                                                            return 1; // maintain order above
                                                        return dateSort;
                                                    });

                                                return events.map(
                                                    ([phase, date]) => (
                                                        <tr key={phase}>
                                                            <th>
                                                                {convertDateToString(
                                                                    date,
                                                                    'MMM D, YYYY'
                                                                )}
                                                            </th>
                                                            <td>
                                                                {getEventBody(
                                                                    phase
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                );
                                            })()}
                                        </tbody>
                                    </ThemeTable>
                                </DisclosureContainer>
                            </div>
                        );
                    }
                )}
                onClick={toggleVersionSections.current}
                expanded={expandedVersionSections.current}
                stacked={true}
                headingLevel="2"
            />
        </Container>
    );
};

export default TestPlanVersionsPage;
