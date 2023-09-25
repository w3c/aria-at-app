import React, { useRef, useState } from 'react';
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
import { uniqBy as uniqueBy } from 'lodash';
import DisclosureComponentUnstyled from '../common/DisclosureComponent';
//section:
const DisclosureContainer = styled.div`
    // Following directives are related to the ManageTestQueue component
    > span {
        display: block;
        margin-bottom: 1rem;
    }

    // Add Test Plan to Test Queue button
    > button {
        display: flex;
        padding: 0.5rem 1rem;
        margin-top: 1rem;
        margin-left: auto;
        margin-right: 0;
    }

    .disclosure-row-manage-ats {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;

        .ats-container {
            grid-column: 1 / span 2;
        }

        .at-versions-container {
            display: flex;
            flex-direction: column;
            grid-column: 3 / span 3;
        }

        .disclosure-buttons-row {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;

            > button {
                margin: 0;
                padding: 0;
                color: #275caa;
                border: none;
                background-color: transparent;

                &:nth-of-type(2) {
                    margin-left: auto;
                }

                // remove button
                &:nth-of-type(3) {
                    margin-left: 1rem;
                    color: #ce1b4c;
                }
            }
        }
    }

    .disclosure-row-test-plans {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;
    }

    .disclosure-form-label {
        font-weight: bold;
        font-size: 1rem;
    }
`;

const DisclosureComponent = styled(DisclosureComponentUnstyled)`
    & h2 {
        padding: 0;
        margin: 0;
        font-size: 1.25em;

        button {
            font-size: unset;
            font-weight: unset;
        }
    }
`;

// const H2 = styled.h2`
//     font-size: 1.25em;
//     padding-top: 3rem;
//     padding-bottom: 15px;
//     border-bottom: solid 1px #d2d5d9;
//     margin-bottom: 2rem !important;
// `;
// const H2 = styled.h2`
//     font-size: 1.25em;
//     padding-top: 3rem;
//     padding-bottom: 15px;
//     margin-bottom: 2rem !important;
// `;
const H2 = styled.h2`
    // font-size: 1.25em;
    // padding-top: 3rem;
    // padding-bottom: 15px;
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

// https://stackoverflow.com/a/53215514
const useForceUpdate = () => {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    return forceUpdate;
};

const TestPlanVersionsPage = () => {
    const { testPlanDirectory } = useParams();

    const { loading, data, error } = useQuery(TEST_PLAN_VERSIONS_PAGE_QUERY, {
        variables: { testPlanDirectory },
        fetchPolicy: 'cache-and-network'
    });
    //section:
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

    const ats = data.ats;

    const testPlanVersions = data.testPlan.testPlanVersions
        .slice()
        .sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    const issues = uniqueBy(
        testPlanVersions.flatMap(testPlanVersion =>
            testPlanVersion.testPlanReports.flatMap(testPlanReport =>
                testPlanReport.issues.map(issue => ({
                    ...issue,
                    at: testPlanReport.at
                }))
            )
        ),
        item => item.link
    );
    //section:
    // console.log('rendering', expandedVersionSections.current);
    if (!expandedVersionSections.current) {
        expandedVersionSections.current = [];
        toggleVersionSections.current = [];

        for (let i = 0; i < testPlanVersions.length; i += 1) {
            expandedVersionSections.current[i] = false;
            toggleVersionSections.current[i] = () => {
                expandedVersionSections.current[i] =
                    !expandedVersionSections.current[i];
                // console.log('toggled', i);
                forceUpdate();
            };
        }
        // expandedVersionSections.current = new Array(
        //     testPlanVersions.length
        // ).fill(false);
        // toggleVersionSections.current = expandedVersionSections.current.map((_, index) => {

        // });
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
                                    <td>
                                        <VersionString
                                            date={testPlanVersion.updatedAt}
                                            iconColor={getIconColor(
                                                testPlanVersion
                                            )}
                                            autoWidth={false}
                                        />
                                    </td>
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

                                                return (
                                                    <>
                                                        {deprecatedPill} during{' '}
                                                        {phasePill} review
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
                                    <td>{issue.at.name}</td>
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
                    {testPlanVersions.map(testPlanVersion => {
                        const versionString = (
                            <VersionString
                                date={testPlanVersion.updatedAt}
                                iconColor={getIconColor(testPlanVersion)}
                                fullWidth={false}
                                autoWidth={false}
                            />
                        );

                        const eventBody = getEventBody(testPlanVersion.phase);

                        return (
                            <tr key={testPlanVersion.id}>
                                <td>{getEventDate(testPlanVersion)}</td>
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
                //section:
                componentId="versionHistory"
                // title={['Title One', 'Title Two']}
                title={testPlanVersions.map(testPlanVersion => {
                    return (
                        <span
                            key={testPlanVersion.id}
                            aria-label={`${
                                'V' +
                                convertDateToString(
                                    testPlanVersion.updatedAt,
                                    'YY.MM.DD'
                                )
                            } ${derivePhaseName(
                                testPlanVersion.phase
                            )} on ${getEventDate(testPlanVersion)}`}
                        >
                            <VersionString
                                circleCheckIcon={false}
                                date={testPlanVersion.updatedAt}
                                iconColor={getIconColor(testPlanVersion)}
                                fullWidth={false}
                                autoWidth={false}
                            />
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
                        const vString = `V${convertDateToString(
                            testPlanVersion.updatedAt,
                            'YY.MM.DD'
                        )}`;

                        // Gets the derived phase even if deprecated by checking
                        // the known dates on the testPlanVersion object
                        const derivedDeprecatedAtPhase =
                            deriveDeprecatedDuringPhase(testPlanVersion);

                        const hasFinalReports =
                            (derivedDeprecatedAtPhase === 'CANDIDATE' ||
                                derivedDeprecatedAtPhase === 'RECOMMENDED') &&
                            !!testPlanVersion.testPlanReports.filter(
                                report => report.isFinal
                            ).length;

                        return (
                            <div key={testPlanVersion.id}>
                                <DisclosureContainer
                                    key={`manage-test-queue-at-section`}
                                >
                                    {/* <H2
                                    aria-label={`${
                                        'V' +
                                        convertDateToString(
                                            testPlanVersion.updatedAt,
                                            'YY.MM.DD'
                                        )
                                    } ${derivePhaseName(
                                        testPlanVersion.phase
                                    )} on ${getEventDate(testPlanVersion)}`}
                                >
                                    <VersionString
                                        date={testPlanVersion.updatedAt}
                                        iconColor={getIconColor(
                                            testPlanVersion
                                        )}
                                        fullWidth={false}
                                        autoWidth={false}
                                    />
                                    &nbsp;
                                    <PhasePill fullWidth={false}>
                                        {testPlanVersion.phase}
                                    </PhasePill>
                                    &nbsp;on&nbsp;
                                    {getEventDate(testPlanVersion)}
                                </H2> */}
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
                                                target="_blank"
                                                rel="noreferrer"
                                                href={`/test-review/${testPlanVersion.gitSha}/${testPlanDirectory}`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        faArrowUpRightFromSquare
                                                    }
                                                    size="xs"
                                                    color="#818F98"
                                                />
                                                View tests in {vString}
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
                                                    {vString}
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
                                        id={`timeline-for-${vString}`}
                                    >
                                        Timeline for {vString}
                                    </ThemeTableHeader>
                                    <ThemeTable
                                        bordered
                                        responsive
                                        aria-labelledby={`timeline-for-${vString}`}
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
                                                            <td>
                                                                {convertDateToString(
                                                                    date,
                                                                    'MMM D, YYYY'
                                                                )}
                                                            </td>
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
