import { useMemo, useState } from 'react';
import {
    DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS,
    TABLE_SORT_ORDERS,
    TEST_PLAN_VERSION_PHASES
} from '../../utils/constants';
import { getVersionData } from './utils';

export const useTestPlanVersionsByPhase = testPlanVersions => {
    const testPlanVersionsByPhase = useMemo(() => {
        const initialPhases = Object.keys(TEST_PLAN_VERSION_PHASES).reduce(
            (acc, key) => {
                acc[TEST_PLAN_VERSION_PHASES[key]] = [];
                return acc;
            },
            {}
        );

        return testPlanVersions.reduce((acc, testPlanVersion) => {
            acc[testPlanVersion.phase].push(testPlanVersion);
            return acc;
        }, initialPhases);
    }, [testPlanVersions]);

    return { testPlanVersionsByPhase };
};

export const useDerivedTestPlanOverallPhase = (testPlans, testPlanVersions) => {
    const { testPlanVersionsByPhase } =
        useTestPlanVersionsByPhase(testPlanVersions);

    const derivedOverallPhaseByTestPlanId = useMemo(() => {
        const derivedOverallPhaseByTestPlanId = {};
        for (const testPlan of testPlans) {
            if (
                testPlanVersionsByPhase[
                    TEST_PLAN_VERSION_PHASES.RECOMMENDED
                ].some(
                    testPlanVersion =>
                        testPlanVersion.testPlan.directory ===
                        testPlan.directory
                )
            ) {
                const { earliestVersion } = getVersionData(
                    testPlanVersionsByPhase[
                        TEST_PLAN_VERSION_PHASES.RECOMMENDED
                    ],
                    'recommendedPhaseReachedAt'
                );

                const { phase } = earliestVersion;
                derivedOverallPhaseByTestPlanId[testPlan.id] = phase;
                continue;
            }

            if (
                testPlanVersionsByPhase[
                    TEST_PLAN_VERSION_PHASES.CANDIDATE
                ].some(
                    testPlanVersion =>
                        testPlanVersion.testPlan.directory ===
                        testPlan.directory
                )
            ) {
                const { earliestVersion } = getVersionData(
                    testPlanVersionsByPhase[TEST_PLAN_VERSION_PHASES.CANDIDATE],
                    'candidatePhaseReachedAt'
                );
                const { phase } = earliestVersion;
                derivedOverallPhaseByTestPlanId[testPlan.id] = phase;
                continue;
            }

            if (
                testPlanVersionsByPhase[TEST_PLAN_VERSION_PHASES.DRAFT].some(
                    testPlanVersion =>
                        testPlanVersion.testPlan.directory ===
                        testPlan.directory
                )
            ) {
                const { earliestVersion } = getVersionData(
                    testPlanVersionsByPhase[TEST_PLAN_VERSION_PHASES.DRAFT],
                    'draftPhaseReachedAt'
                );
                const { phase } = earliestVersion;
                derivedOverallPhaseByTestPlanId[testPlan.id] = phase;
                continue;
            }

            if (
                testPlanVersionsByPhase[TEST_PLAN_VERSION_PHASES.RD].some(
                    testPlanVersion =>
                        testPlanVersion.testPlan.directory ===
                        testPlan.directory
                )
            ) {
                const { latestVersion } = getVersionData(
                    testPlanVersionsByPhase[TEST_PLAN_VERSION_PHASES.RD]
                );
                const { phase } = latestVersion;
                derivedOverallPhaseByTestPlanId[testPlan.id] = phase;
                continue;
            }
        }
        return derivedOverallPhaseByTestPlanId;
    }, [testPlans, testPlanVersions]);

    return { derivedOverallPhaseByTestPlanId };
};

export const useTestPlansByPhase = (testPlans, testPlanVersions) => {
    const { derivedOverallPhaseByTestPlanId } = useDerivedTestPlanOverallPhase(
        testPlans,
        testPlanVersions
    );

    const testPlansByPhase = useMemo(() => {
        const testPlansByPhase = {};
        for (const key of Object.keys(TEST_PLAN_VERSION_PHASES)) {
            testPlansByPhase[TEST_PLAN_VERSION_PHASES[key]] = [];
        }
        for (const testPlan of testPlans) {
            testPlansByPhase[
                derivedOverallPhaseByTestPlanId[testPlan.id]
            ]?.push(testPlan);
        }
        return testPlansByPhase;
    }, [derivedOverallPhaseByTestPlanId]);

    return { testPlansByPhase };
};

export const useDataManagementTableFiltering = (
    testPlans,
    testPlanVersions,
    filter
) => {
    const { testPlansByPhase } = useTestPlansByPhase(
        testPlans,
        testPlanVersions
    );

    const filteredTestPlans = useMemo(() => {
        if (!filter || filter === DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL) {
            return testPlans;
        } else {
            return testPlansByPhase[filter];
        }
    }, [filter, testPlansByPhase, testPlans]);

    const filterLabels = {
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL]: `All Plans (${testPlans.length})`
    };

    if (testPlansByPhase[TEST_PLAN_VERSION_PHASES.RD].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD
        ] = `R&D Complete (${
            testPlansByPhase[TEST_PLAN_VERSION_PHASES.RD].length
        })`;
    }

    if (testPlansByPhase[TEST_PLAN_VERSION_PHASES.DRAFT].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT
        ] = `In Draft Review (${
            testPlansByPhase[TEST_PLAN_VERSION_PHASES.DRAFT].length
        })`;
    }

    if (testPlansByPhase[TEST_PLAN_VERSION_PHASES.CANDIDATE].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE
        ] = `In Candidate Review (${
            testPlansByPhase[TEST_PLAN_VERSION_PHASES.CANDIDATE].length
        })`;
    }

    if (testPlansByPhase[TEST_PLAN_VERSION_PHASES.RECOMMENDED].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED
        ] = `Recommended Plans (${
            testPlansByPhase[TEST_PLAN_VERSION_PHASES.RECOMMENDED].length
        })`;
    }

    return { filteredTestPlans, filterLabels };
};

export const useDataManagementTableSorting = (
    testPlans,
    testPlanVersions,
    ats
) => {
    const [activeSort, setActiveSort] = useState({
        key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE,
        direction: TABLE_SORT_ORDERS.ASC
    });

    const { derivedOverallPhaseByTestPlanId } = useDerivedTestPlanOverallPhase(
        testPlans,
        testPlanVersions
    );

    const sortedTestPlans = useMemo(() => {
        const phaseOrder = {
            NOT_STARTED: -1,
            RD: 0,
            DRAFT: 1,
            CANDIDATE: 2,
            RECOMMENDED: 3
        };
        const directionMod =
            activeSort.direction === TABLE_SORT_ORDERS.ASC ? -1 : 1;

        const sortByName = (a, b, dir = directionMod) =>
            dir * (a.title < b.title ? -1 : 1);

        const sortByAts = (a, b) => {
            const countA = ats.length; // Stubs based on current rendering in DataManagementRow
            const countB = ats.length;
            if (countA === countB) return sortByName(a, b);
            return directionMod * (countA - countB);
        };

        const sortByPhase = (a, b) => {
            const testPlanVersionOverallA =
                derivedOverallPhaseByTestPlanId[a.id] ?? 'NOT_STARTED';
            const testPlanVersionOverallB =
                derivedOverallPhaseByTestPlanId[b.id] ?? 'NOT_STARTED';
            if (testPlanVersionOverallA === testPlanVersionOverallB) {
                return sortByName(a, b, directionMod * -1);
            }
            return (
                directionMod *
                (phaseOrder[testPlanVersionOverallA] -
                    phaseOrder[testPlanVersionOverallB])
            );
        };

        const sortFunctions = {
            NAME: sortByName,
            ATS: sortByAts,
            PHASE: sortByPhase
        };

        return testPlans.slice().sort(sortFunctions[activeSort.key]);
    }, [activeSort, testPlans]);

    const updateSort = ({ key, direction }) => {
        setActiveSort({ key, direction });
    };

    return {
        sortedTestPlans,
        updateSort,
        activeSort
    };
};
