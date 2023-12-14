import React, { Fragment, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TEST_REVIEW_PAGE_QUERY } from './queries';
import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageStatus from '../common/PageStatus';
import InstructionsRenderer from '../CandidateReview/CandidateTestPlanRun/InstructionsRenderer';
import FilterButtons from '../common/FilterButtons';
import { uniq as unique } from 'lodash';
import styled from '@emotion/styled';
import { derivePhaseName } from '../../utils/aria';
import { convertDateToString } from '../../utils/formatter';

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
    const atNames = unique(
        testPlanVersion.tests.flatMap(test => test.ats.map(at => at.name))
    );

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
                    filterLabel="Filter tests by AT"
                    filterOptions={filterOptions}
                    activeFilter={activeFilter}
                    onFilterChange={selectedFilter => {
                        setActiveFilter(selectedFilter);
                    }}
                />
            </FilterButtonContainer>
            {filteredTests.map((test, index) => {
                const isFirst = index === 0;

                const atMode =
                    test.atMode.substring(0, 1) +
                    test.atMode.toLowerCase().substring(1);

                const specifications =
                    test.renderableContents[0].renderableContent.info.references.map(
                        ({ refId, value }) => [refId, value]
                    );

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
                        <h3>{`Test ${test.rowNumber}: ${test.title}`}</h3>
                        <ul>
                            <li>
                                <strong>Mode:&nbsp;</strong>
                                {atMode}
                            </li>
                            <li>
                                <strong>Assistive technologies:&nbsp;</strong>
                                {test.ats.map(at => at.name).join(', ')}
                            </li>
                            <li>
                                <strong>Relevant specifications:&nbsp;</strong>
                                {specifications.map(([title, link], index) => {
                                    const isLast =
                                        index === specifications.length - 1;
                                    return (
                                        <Fragment key={title}>
                                            <a
                                                href={link}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                {title}
                                            </a>
                                            {isLast ? '' : ', '}
                                        </Fragment>
                                    );
                                })}
                            </li>
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
                                    <InstructionsRenderer
                                        test={{ ...test, renderableContent }}
                                        testPageUrl={
                                            testPlanVersion.testPageUrl
                                        }
                                        at={at}
                                        headingLevel={5}
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
