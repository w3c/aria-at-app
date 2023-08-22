import { useMemo, useState } from 'react';
import {
    DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS,
    TABLE_SORT_ORDERS,
    TEST_PLAN_VERSION_PHASES
} from '../../utils/constants';

export const useDataManagementTableSorting = (
    testPlans,
    testPlanVersions,
    ats
) => {
    const [activeSort, setActiveSort] = useState({
        key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.PHASE,
        direction: TABLE_SORT_ORDERS.ASC
    });

    const sortedTestPlans = useMemo(() => {
        const phaseOrder = {
            RD: 0,
            DRAFT: 1,
            CANDIDATE: 2,
            RECOMMENDED: 3
        };
        const directionMod =
            activeSort.direction === TABLE_SORT_ORDERS.ASC ? -1 : 1;

        const getTestPlanVersionOverallPhase = t => {
            return (
                Object.keys(phaseOrder).find(phaseKey =>
                    testPlanVersions.some(
                        ({ phase, testPlan }) =>
                            testPlan.directory === t.directory &&
                            phase === phaseKey
                    )
                ) || 'RD'
            );
        };

        const sortByName = (a, b, dir = directionMod) =>
            dir * (a.title < b.title ? -1 : 1);

        const sortByAts = (a, b) => {
            const countA = ats.length; // Stubs based on current rendering in DataManagementRow
            const countB = ats.length;
            if (countA === countB) return sortByName(a, b);
            return directionMod * (countA - countB);
        };

        const sortByPhase = (a, b) => {
            const testPlanVersionOverallA = getTestPlanVersionOverallPhase(a);
            const testPlanVersionOverallB = getTestPlanVersionOverallPhase(b);
            if (testPlanVersionOverallA === testPlanVersionOverallB)
                return sortByName(a, b, 1);
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

export const useDataManagementTableFiltering = (
    testPlans,
    testPlanVersions,
    filter
) => {
    const phaseGroups = useMemo(() => {
        const phaseGroups = {
            [TEST_PLAN_VERSION_PHASES.RD]: [],
            [TEST_PLAN_VERSION_PHASES.DRAFT]: [],
            [TEST_PLAN_VERSION_PHASES.CANDIDATE]: [],
            [TEST_PLAN_VERSION_PHASES.RECOMMENDED]: []
        };

        testPlans.forEach(testPlan => {
            const matchingTestPlanVersions = testPlanVersions.filter(
                ({ testPlan: { directory } }) =>
                    directory === testPlan.directory
            );

            if (matchingTestPlanVersions.length === 0) return;

            matchingTestPlanVersions.forEach(testPlanVersion => {
                const phase = testPlanVersion.phase;
                phaseGroups[phase].push(testPlan);
            });
        });

        return phaseGroups;
    }, [testPlans, testPlanVersions]);

    const filteredTestPlans = useMemo(() => {
        if (!filter || filter === DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL) {
            return testPlans;
        } else {
            return phaseGroups[filter];
        }
    }, [filter, phaseGroups, testPlans]);

    const filterLabels = {
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL]: `All Plans (${testPlans.length})`
    };

    if (phaseGroups[TEST_PLAN_VERSION_PHASES.RD].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD
        ] = `R&D Complete (${phaseGroups[TEST_PLAN_VERSION_PHASES.RD].length})`;
    }

    if (phaseGroups[TEST_PLAN_VERSION_PHASES.DRAFT].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT
        ] = `In Draft Review (${
            phaseGroups[TEST_PLAN_VERSION_PHASES.DRAFT].length
        })`;
    }

    if (phaseGroups[TEST_PLAN_VERSION_PHASES.CANDIDATE].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE
        ] = `In Candidate Review (${
            phaseGroups[TEST_PLAN_VERSION_PHASES.CANDIDATE].length
        })`;
    }

    if (phaseGroups[TEST_PLAN_VERSION_PHASES.RECOMMENDED].length > 0) {
        filterLabels[
            DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED
        ] = `Recommended Plans (${
            phaseGroups[TEST_PLAN_VERSION_PHASES.RECOMMENDED].length
        })`;
    }

    return { filteredTestPlans, filterLabels };
};
