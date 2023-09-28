import { useMemo, useState } from 'react';
import {
    DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS,
    getVersionData
} from './utils';
import { TEST_PLAN_VERSION_PHASES } from '../../utils/constants';
import { TABLE_SORT_ORDERS } from '../common/SortableTableHeader';

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

export const useDerivedOverallPhaseByTestPlanId = (
    testPlans,
    testPlanVersions
) => {
    const { testPlanVersionsByPhase } =
        useTestPlanVersionsByPhase(testPlanVersions);

    const getVersionDataByDirectory = (directory, phaseKey, phaseTimeKey) => {
        if (
            testPlanVersionsByPhase[phaseKey].some(
                testPlanVersion =>
                    testPlanVersion.testPlan.directory === directory
            )
        ) {
            const { earliestVersion, latestVersion } = getVersionData(
                testPlanVersionsByPhase[phaseKey],
                phaseTimeKey
            );
            return phaseTimeKey ? earliestVersion?.phase : latestVersion?.phase;
        }
        return undefined;
    };

    const derivedOverallPhaseByTestPlanId = useMemo(() => {
        const derivedOverallPhaseByTestPlanId = {};
        const phases = [
            {
                phase: TEST_PLAN_VERSION_PHASES.RECOMMENDED,
                timeKey: 'recommendedPhaseReachedAt'
            },
            {
                phase: TEST_PLAN_VERSION_PHASES.CANDIDATE,
                timeKey: 'candidatePhaseReachedAt'
            },
            {
                phase: TEST_PLAN_VERSION_PHASES.DRAFT,
                timeKey: 'draftPhaseReachedAt'
            },
            { phase: TEST_PLAN_VERSION_PHASES.RD }
        ];
        for (const testPlan of testPlans) {
            for (const { phase, timeKey } of phases) {
                const derivedPhase = getVersionDataByDirectory(
                    testPlan.directory,
                    phase,
                    timeKey
                );
                if (derivedPhase) {
                    derivedOverallPhaseByTestPlanId[testPlan.id] = derivedPhase;
                    break;
                }
            }
        }
        return derivedOverallPhaseByTestPlanId;
    }, [testPlans, testPlanVersions]);

    return { derivedOverallPhaseByTestPlanId };
};

export const useTestPlansByPhase = (testPlans, testPlanVersions) => {
    const { derivedOverallPhaseByTestPlanId } =
        useDerivedOverallPhaseByTestPlanId(testPlans, testPlanVersions);

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
    ats,
    initialSortDirection = TABLE_SORT_ORDERS.ASC
) => {
    const [activeSort, setActiveSort] = useState({
        key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE,
        direction: initialSortDirection
    });

    const { derivedOverallPhaseByTestPlanId } =
        useDerivedOverallPhaseByTestPlanId(testPlans, testPlanVersions);

    const sortedTestPlans = useMemo(() => {
        // Ascending and descending interpreted differently for statuses
        // (ascending = earlier phase first, descending = later phase first)
        const phaseOrder = {
            NOT_STARTED: 4,
            RD: 3,
            DRAFT: 2,
            CANDIDATE: 1,
            RECOMMENDED: 0
        };
        const directionMod =
            activeSort.direction === TABLE_SORT_ORDERS.ASC ? -1 : 1;

        const sortByName = (a, b, dir = directionMod) =>
            dir * (a.title < b.title ? 1 : -1);

        const sortByAts = (a, b) => {
            const countA = ats.length; // Stubs based on current rendering in DataManagementRow
            const countB = ats.length;
            if (countA === countB) return sortByName(a, b, -1);
            return directionMod * (countA - countB);
        };

        const sortByPhase = (a, b) => {
            const testPlanVersionOverallA =
                derivedOverallPhaseByTestPlanId[a.id] ?? 'NOT_STARTED';
            const testPlanVersionOverallB =
                derivedOverallPhaseByTestPlanId[b.id] ?? 'NOT_STARTED';
            if (testPlanVersionOverallA === testPlanVersionOverallB) {
                return sortByName(a, b, -1);
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
