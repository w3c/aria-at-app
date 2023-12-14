import React, { Fragment, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_REVIEW_PAGE_QUERY } from './queries';
import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageStatus from '../common/PageStatus';
import InstructionsRenderer from '../CandidateReview/CandidateTestPlanRun/InstructionsRenderer';
import FilterButtons from '../common/FilterButtons';
// import { uniq as unique } from 'lodash';
import styled from '@emotion/styled';
import { derivePhaseName } from '../../utils/aria';
import { convertDateToString } from '../../utils/formatter';
import supportJson from '../../resources/support.json';

const Ul = styled.ul`
    li {
        list-style-type: disc;
        margin-left: 20px;
    }
`;

const FilterButtonContainer = styled.div`
    padding: 0 0.75rem;
    border: 1px solid #d2d5d9;
    border-radius: 3px;
    margin-bottom: 40px;
`;

const TestReview = () => {
    const { testPlanVersionId } = useParams();

    const { loading, data, error } = useQuery(TEST_REVIEW_PAGE_QUERY, {
        variables: { testPlanVersionId },
        fetchPolicy: 'cache-and-network'
    });
    const [activeFilter, setActiveFilter] = useState('All ATs');

    if (loading) {
        return (
            <PageStatus
                title="Loading - Test Plan Version | ARIA-AT"
                heading="Test Plan Version"
            />
        );
    }
    if (error || !data?.testPlanVersion) {
        const errorMessage =
            error?.message ??
            `Failed to find a test plan version with ID ${testPlanVersionId}`;
        return (
            <PageStatus
                title="Test Plan Version | ARIA-AT"
                heading="Test Plan Version"
                message={errorMessage}
                isError
            />
        );
    }
    const testPlanVersion = data.testPlanVersion;
    const atNames = supportJson.ats.map(at => at.name);

    let filteredTests;
    if (activeFilter === 'All ATs') {
        filteredTests = testPlanVersion.tests;
    } else {
        filteredTests = testPlanVersion.tests.filter(test =>
            test.ats.find(at => at.name === activeFilter)
        );
    }

    const filterOptions = Object.fromEntries(
        ['All ATs', ...atNames].map(key => {
            let count;
            if (key === 'All ATs') {
                count = testPlanVersion.tests.length;
            } else {
                count = testPlanVersion.tests.filter(test =>
                    test.ats.find(at => at.name === key)
                ).length;
            }
            return [key, `${key} (${count})`];
        })
    );
    const isV2 = testPlanVersion.metadata.testFormatVersion === 2;
    return (
        <Container id="main" as="main" tabIndex="-1">
            <Helmet>
                <title>{`${testPlanVersion.title} Test Plan ${testPlanVersion.versionString} | ARIA-AT`}</title>
            </Helmet>
            <h1>
                {`${testPlanVersion.title} Test Plan ` +
                    `${testPlanVersion.versionString}` +
                    `${testPlanVersion.deprecatedAt ? ' (Deprecated)' : ''}`}
            </h1>
            <h2>About This Test Plan</h2>
            <ul>
                <li>
                    <strong>Phase:&nbsp;</strong>
                    {derivePhaseName(testPlanVersion.phase)}
                </li>
                <li>
                    <strong>Version:&nbsp;</strong>
                    {`${testPlanVersion.versionString} `}
                    <Link
                        to={`/data-management/${testPlanVersion.testPlan.directory}`}
                    >
                        (View all versions of this test plan)
                    </Link>
                </li>
                <li>
                    <strong>Version History:&nbsp;</strong>
                    <Ul>
                        <li>
                            {`R&D completed on ${convertDateToString(
                                testPlanVersion.updatedAt,
                                'MMM D, YYYY'
                            )}.`}
                        </li>
                        {!testPlanVersion.draftPhaseReachedAt ? null : (
                            <li>
                                {`ARIA-AT draft review process started on ` +
                                    `${convertDateToString(
                                        testPlanVersion.draftPhaseReachedAt,
                                        'MMM D, YYYY'
                                    )} ` +
                                    `for this version.`}
                            </li>
                        )}
                        {!testPlanVersion.candidatePhaseReachedAt ? null : (
                            <li>
                                {`ARIA-AT candidate review process started on ` +
                                    `${convertDateToString(
                                        testPlanVersion.candidatePhaseReachedAt,
                                        'MMM D, YYYY'
                                    )} ` +
                                    `for this version.`}
                            </li>
                        )}
                        {!testPlanVersion.recommendedPhaseReachedAt ? null : (
                            <li>
                                {`Version reached ARIA-AT recommended status on ` +
                                    `${convertDateToString(
                                        testPlanVersion.recommendedPhaseReachedAt,
                                        'MMM D, YYYY'
                                    )}.`}
                            </li>
                        )}
                        {!testPlanVersion.deprecatedAt ? null : (
                            <li>
                                {`Version deprecated on ` +
                                    `${convertDateToString(
                                        testPlanVersion.deprecatedAt,
                                        'MMM D, YYYY'
                                    )}.`}
                            </li>
                        )}
                    </Ul>
                </li>
                <li>
                    <strong>Commit:&nbsp;</strong>
                    {testPlanVersion.gitMessage}
                </li>
            </ul>
            <h2>Tests</h2>
            <FilterButtonContainer>
                <FilterButtons
                    filterLabel="Filter tests by covered AT"
                    filterOptions={filterOptions}
                    activeFilter={activeFilter}
                    onFilterChange={selectedFilter => {
                        setActiveFilter(selectedFilter);
                    }}
                />
            </FilterButtonContainer>
            <h2>Supporting Documentation</h2>
            <ul>
                {testPlanVersion.tests[0].renderableContents[0].renderableContent.info.references.map(
                    reference => {
                        if (isV2) {
                            let refValue = '';
                            let refLinkText = '';
                            if (
                                reference.refId === 'example' ||
                                reference.refId === 'designPattern' ||
                                reference.refId === 'developmentDocumentation'
                            ) {
                                refValue = reference.value;
                                refLinkText = reference.linkText;
                            }
                            return refValue ? (
                                <li key={refValue}>
                                    <a
                                        href={refValue}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        {refLinkText}
                                    </a>
                                </li>
                            ) : null;
                        } else {
                            return (
                                <li key={reference.value}>
                                    <a
                                        href={reference.value}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        {reference.refId}
                                    </a>
                                </li>
                            );
                        }
                    }
                )}
            </ul>
            {filteredTests.map((test, index) => {
                const isFirst = index === 0;

                let filteredAts;
                if (activeFilter === 'All ATs') {
                    filteredAts = test.ats;
                } else {
                    filteredAts = test.ats.filter(
                        at => at.name === activeFilter
                    );
                }
                return (
                    <Fragment key={test.id}>
                        {isFirst ? null : <hr />}
                        <h3>{`Test ${index + 1}: ${test.title}`}</h3>
                        <p>{supportJson.testPlanStrings.ariaSpecsPreface}</p>
                        <ul>
                            {test.renderableContents[0].renderableContent.info.references.map(
                                reference => {
                                    let refValue = '';
                                    let refLinkText = '';
                                    if (reference.type === 'aria') {
                                        refValue = reference.value;
                                        refLinkText = reference.linkText;
                                    }
                                    return refValue ? (
                                        <li key={refValue}>
                                            <a
                                                href={refValue}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                {refLinkText}
                                            </a>
                                        </li>
                                    ) : null;
                                }
                            )}
                        </ul>
                        {filteredAts.map(at => {
                            const renderableContent =
                                test.renderableContents.find(
                                    ({ at: renderableContentAt }) =>
                                        at.id === renderableContentAt.id
                                ).renderableContent;

                            return (
                                <Fragment key={at.id}>
                                    <h4>{at.name}</h4>
                                    <h5>Instructions</h5>
                                    <InstructionsRenderer
                                        test={{ ...test, renderableContent }}
                                        testPageUrl={
                                            testPlanVersion.testPageUrl
                                        }
                                        at={at}
                                        headingLevel={5}
                                        testFormatVersion={
                                            testPlanVersion.metadata
                                                .testFormatVersion
                                        }
                                    />
                                </Fragment>
                            );
                        })}
                    </Fragment>
                );
            })}
        </Container>
    );
};

export default TestReview;
