import { useMemo, useState } from 'react';
import {
    DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
    DATA_MANAGEMENT_TABLE_SORT_OPTIONS,
    TABLE_SORT_ORDERS
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
    const [
        rdTestPlans,
        draftTestPlans,
        candidateTestPlans,
        recommendedTestPlans
    ] = useMemo(() => {
        return testPlans.reduce(
            (acc, testPlan) => {
                const testPlanVersion = testPlanVersions.find(
                    ({ testPlan: { directory } }) =>
                        directory === testPlan.directory
                );
                if (!testPlanVersion) return acc;
                const phase = testPlanVersion.phase;
                switch (phase) {
                    case 'RD':
                        acc[0].push(testPlan);
                        break;
                    case 'DRAFT':
                        acc[1].push(testPlan);
                        break;
                    case 'CANDIDATE':
                        acc[2].push(testPlan);
                        break;
                    case 'RECOMMENDED':
                        acc[3].push(testPlan);
                        break;
                    default:
                        break;
                }
                return acc;
            },
            [[], [], [], []]
        );
    }, [testPlans, testPlanVersions]);

    const filteredTestPlans = useMemo(() => {
        switch (filter) {
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD:
                return rdTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT:
                return draftTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE:
                return candidateTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED:
                return recommendedTestPlans;
            case DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL:
            default:
                return testPlans;
        }
    }, [
        filter,
        rdTestPlans,
        draftTestPlans,
        candidateTestPlans,
        recommendedTestPlans,
        testPlans
    ]);

    const filterLabels = {
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD]: `R&D Complete (${rdTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT]: `In Draft Review (${draftTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE]: `In Candidate Review (${candidateTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED]: `Recommended Plans (${recommendedTestPlans.length})`,
        [DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL]: `All Plans (${testPlans.length})`
    };

    return { filteredTestPlans, filterLabels };
};
