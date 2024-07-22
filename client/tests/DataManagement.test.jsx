/**
 * @jest-environment jsdom
 */

import { act } from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  useDataManagementTableFiltering,
  useDataManagementTableSorting,
  useDerivedActivePhasesByTestPlanId,
  useTestPlanVersionsByPhase,
  useTestPlansByPhase
} from '../components/DataManagement/filterSortHooks';
import {
  DATA_MANAGEMENT_TABLE_FILTER_OPTIONS,
  DATA_MANAGEMENT_TABLE_SORT_OPTIONS
} from '../components/DataManagement/utils';
import { TABLE_SORT_ORDERS } from '../components/common/SortableTableHeader';

const testPlans = [
  { title: 'Test A', directory: 'dirA', id: '1' },
  { title: 'Test B', directory: 'dirB', id: '2' },
  { title: 'Test C', directory: 'dirC', id: '3' },
  { title: 'Test D', directory: 'dirD', id: '4' }
];

const testPlanVersions = [
  {
    phase: 'RD',
    id: '101',
    testPlan: { directory: 'dirA' },
    updatedAt: '2022-03-17T18:34:51.000Z'
  },
  {
    phase: 'DRAFT',
    id: '102',
    testPlan: { directory: 'dirB' },
    draftStatusReachedAt: '2022-05-18T20:51:40.000Z'
  },
  {
    phase: 'CANDIDATE',
    id: '103',
    testPlan: { directory: 'dirC' },
    candidatePhaseReachedAt: '2022-04-10T00:00:00.000Z'
  },
  {
    phase: 'RD',
    id: '104',
    testPlan: { directory: 'dirD' },
    updatedAt: '2022-03-18T18:34:51.000Z'
  },
  {
    phase: 'RECOMMENDED',
    id: '105',
    testPlan: { directory: 'dirD' },
    recommendedPhaseReachedAt: '2022-05-18T20:51:40.000Z'
  },
  {
    phase: 'DRAFT',
    id: '106',
    testPlan: { directory: 'dirD' },
    draftStatusReachedAt: '2024-01-08T20:51:40.000Z'
  }
];

const ats = []; // ATs are stubbed until this model is defined

describe('useDataManagementTableSorting hook', () => {
  it('sorts by phase by default', () => {
    const { result } = renderHook(() =>
      useDataManagementTableSorting(
        testPlans,
        testPlanVersions,
        ats,
        TABLE_SORT_ORDERS.DESC
      )
    );
    expect(result.current.sortedTestPlans).toEqual([
      testPlans[3], // RECOMMENDED
      testPlans[2], // CANDIDATE
      testPlans[1], // DRAFT
      testPlans[0] // RD
    ]);
  });

  it('can sort by name', () => {
    const { result } = renderHook(() =>
      useDataManagementTableSorting(testPlans, testPlanVersions, ats)
    );
    act(() =>
      result.current.updateSort({
        key: DATA_MANAGEMENT_TABLE_SORT_OPTIONS.NAME,
        direction: TABLE_SORT_ORDERS.ASC
      })
    );
    expect(result.current.sortedTestPlans).toEqual(testPlans);
  });
});

describe('useDataManagementTableFiltering hook', () => {
  it('shows all plans by default', () => {
    const { result } = renderHook(() =>
      useDataManagementTableFiltering(
        testPlans,
        testPlanVersions,
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL
      )
    );
    expect(result.current.filteredTestPlans).toEqual(testPlans);
    expect(
      result.current.filterLabels[DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.ALL]
    ).toEqual(`All Plans (${testPlans.length})`);
  });

  it('can filter by RD phase', () => {
    const { result } = renderHook(() =>
      useDataManagementTableFiltering(
        testPlans,
        testPlanVersions,
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD
      )
    );
    expect(result.current.filteredTestPlans).toEqual([
      testPlans[0], // RD
      testPlans[3]
    ]);
    expect(
      result.current.filterLabels[DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RD]
    ).toEqual(`R&D Complete (2)`);
  });

  it('can filter by DRAFT phase', () => {
    const { result } = renderHook(() =>
      useDataManagementTableFiltering(
        testPlans,
        testPlanVersions,
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT
      )
    );
    expect(result.current.filteredTestPlans).toEqual([
      testPlans[1], // DRAFT
      testPlans[3] // DRAFT
    ]);
    expect(
      result.current.filterLabels[DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.DRAFT]
    ).toEqual(`In Draft Review (2)`); // Test plan 106 is in DRAFT while the overall plan is RECOMMENDED
  });

  it('can filter by CANDIDATE phase', () => {
    const { result } = renderHook(() =>
      useDataManagementTableFiltering(
        testPlans,
        testPlanVersions,
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE
      )
    );
    expect(result.current.filteredTestPlans).toEqual([
      testPlans[2] // CANDIDATE
    ]);
    expect(
      result.current.filterLabels[
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.CANDIDATE
      ]
    ).toEqual(`In Candidate Review (1)`);
  });

  it('can filter by RECOMMENDED phase', () => {
    const { result } = renderHook(() =>
      useDataManagementTableFiltering(
        testPlans,
        testPlanVersions,
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED
      )
    );
    expect(result.current.filteredTestPlans).toEqual([
      testPlans[3] // RECOMMENDED
    ]);
    expect(
      result.current.filterLabels[
        DATA_MANAGEMENT_TABLE_FILTER_OPTIONS.RECOMMENDED
      ]
    ).toEqual(`Recommended Plans (1)`);
  });
});

describe('useTestPlanVersionsByPhase hook', () => {
  it('returns an object with test plan versions grouped by phase', () => {
    const { result } = renderHook(() =>
      useTestPlanVersionsByPhase(testPlanVersions)
    );
    const { testPlanVersionsByPhase } = result.current;
    expect(testPlanVersionsByPhase).toEqual({
      RD: [testPlanVersions[0], testPlanVersions[3]],
      DRAFT: [testPlanVersions[1], testPlanVersions[5]],
      CANDIDATE: [testPlanVersions[2]],
      RECOMMENDED: [testPlanVersions[4]]
    });
  });
});

describe('useDerivedTestPlanOverallPhase hook', () => {
  it('returns an object with the active phases mapped to each test plan id', () => {
    const { result } = renderHook(() =>
      useDerivedActivePhasesByTestPlanId(testPlans, testPlanVersions)
    );
    const { derivedActivePhasesByTestPlanId } = result.current;
    expect(derivedActivePhasesByTestPlanId).toEqual({
      1: ['RD'],
      2: ['DRAFT'],
      3: ['CANDIDATE'],
      4: ['RECOMMENDED', 'DRAFT', 'RD']
    });
  });
});

describe('useTestPlansByPhase hook', () => {
  it('returns an object with test plans with an array of active Test Plan Versions', () => {
    const { result } = renderHook(() =>
      useTestPlansByPhase(testPlans, testPlanVersions)
    );
    const { testPlansByPhase } = result.current;
    expect(testPlansByPhase).toEqual({
      RD: [testPlans[0], testPlans[3]],
      DRAFT: [testPlans[1], testPlans[3]],
      CANDIDATE: [testPlans[2]],
      RECOMMENDED: [testPlans[3]]
    });
  });
});
