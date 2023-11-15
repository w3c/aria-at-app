/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
    render,
    fireEvent,
    waitFor,
    screen,
    cleanup
} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import AssignTesterDropdown from '../components/TestQueue/AssignTesterDropdown';
import {
    ASSIGN_TESTER_MUTATION,
    REMOVE_TESTER_MUTATION,
    TEST_PLAN_REPORT_AT_BROWSER_QUERY
} from '../components/TestQueue/queries';
import { SCHEDULE_COLLECTION_JOB_MUTATION } from '../components/AddTestToQueueWithConfirmation/queries';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@apollo/client', () => {
    const original = jest.requireActual('@apollo/client');
    return {
        ...original,
        useMutation: jest.fn()
    };
});

const mockPossibleTesters = [
    { id: '1', username: 'bee' },
    { id: '2', username: 'puppy' },
    { id: '3', username: 'NVDA Bot' }
];

const mockProps = {
    testPlanReportId: 'report1',
    possibleTesters: mockPossibleTesters,
    onChange: jest.fn(),
    testPlanRun: null,
    draftTestPlanRuns: [],
    label: 'Assign testers',
    setAlertMessage: jest.fn()
};

import { useMutation } from '@apollo/client';

// Mock useMutation hook
useMutation.mockImplementation(mutation => {
    let response;

    if (mutation === ASSIGN_TESTER_MUTATION) {
        response = 'ASSIGN';
    } else if (mutation === REMOVE_TESTER_MUTATION) {
        response = 'REMOVE';
    } else if (mutation === SCHEDULE_COLLECTION_JOB_MUTATION) {
        response = 'SCHEDULE';
    }

    return [jest.fn(() => response), { loading: false, error: null }];
});

// Mocked GraphQL responses
const mocks = [
    {
        request: {
            query: ASSIGN_TESTER_MUTATION,
            variables: {
                testReportId: 'report1',
                testerId: '1'
            }
        },
        result: {
            data: {
                testPlanReport: {
                    assignTester: {
                        testPlanReport: {
                            draftTestPlanRuns: [
                                {
                                    initiatedByAutomation: false,
                                    tester: {
                                        id: '1',
                                        username: 'bee'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    },
    {
        request: {
            query: REMOVE_TESTER_MUTATION,
            variables: {
                testReportId: 'report1',
                testerId: '1'
            }
        },
        result: {
            data: {
                testPlanReport: {
                    deleteTestPlanRun: {
                        testPlanReport: {
                            draftTestPlanRuns: []
                        }
                    }
                }
            }
        }
    },
    {
        request: {
            query: SCHEDULE_COLLECTION_JOB_MUTATION,
            variables: {
                testPlanReportId: 'report1'
            }
        },
        result: {
            data: {
                scheduleCollectionJob: {
                    id: 'some-job-id',
                    status: 'pending'
                }
            }
        }
    },
    {
        request: {
            query: TEST_PLAN_REPORT_AT_BROWSER_QUERY,
            variables: {
                testPlanReportId: 'report1'
            }
        },
        result: {
            data: {
                testPlanReport: {
                    id: 'report1',
                    at: {
                        id: 2,
                        name: 'NVDA'
                    },
                    browser: {
                        id: 1,
                        name: 'Chrome'
                    }
                }
            }
        }
    }
];

describe('AssignTesterDropdown', () => {
    beforeEach(() => {
        cleanup();
    });

    it('renders without crashing', () => {
        render(
            <MockedProvider mocks={mocks}>
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );
        expect(screen.getByLabelText('Assign testers')).toBeInTheDocument();
    });

    it('assigns tester correctly and calls assignTester mutation', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );

        const button = await screen.getByRole('button', {
            name: /assign testers/i
        });
        fireEvent.click(button);

        const items = await screen.findAllByText(/bee/);
        expect(items.length).toBe(1);
        fireEvent.click(items[0]);

        await waitFor(async () => {
            expect(useMutation).toHaveBeenCalledWith(ASSIGN_TESTER_MUTATION);
            expect(mockProps.onChange).toHaveBeenCalledTimes(1);
            expect(mockProps.setAlertMessage).toHaveBeenCalledTimes(1);
            expect(mockProps.setAlertMessage).toHaveBeenCalledWith(
                expect.stringContaining(
                    'bee has been assigned to this test run'
                )
            );
        });
    });

    it('assigns bot correctly and calls scheduleCollection mutation', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );

        const button = await screen.getByRole('button', {
            name: /assign testers/i
        });
        fireEvent.click(button);

        const items = await screen.findAllByText(/NVDA Bot/);
        expect(items.length).toBe(1);
        fireEvent.click(items[0]);

        await waitFor(() => {
            expect(useMutation).toHaveBeenCalledWith(
                SCHEDULE_COLLECTION_JOB_MUTATION
            );
            expect(mockProps.onChange).toHaveBeenCalledTimes(1);
        });
    });

    it('does not list bot when run does not support automation', async () => {
        const jawsMock = [...mocks];
        jawsMock[3].result.data.testPlanReport.at.name = 'JAWS';

        render(
            <MockedProvider mocks={jawsMock} addTypename={false}>
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );

        const button = await screen.getByRole('button', {
            name: /assign testers/i
        });
        fireEvent.click(button);

        const items = await screen.queryByText(/NVDA Bot/);
        expect(items).not.toBeInTheDocument();
    });

    it('removes tester correctly and calls removeTester mutation', async () => {
        mockProps.draftTestPlanRuns = [
            {
                initiatedByAutomation: false,
                tester: {
                    id: '1',
                    username: 'bee'
                }
            }
        ];

        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );

        const button = await screen.getByRole('button', {
            name: /assign testers/i
        });
        fireEvent.click(button);

        const items = await screen.findAllByText(/bee/);
        fireEvent.click(items[0]);

        await waitFor(() => {
            expect(useMutation).toHaveBeenCalledWith(REMOVE_TESTER_MUTATION);
            expect(mockProps.setAlertMessage).toHaveBeenCalledWith(
                expect.stringContaining(
                    'bee has been removed from this test run'
                )
            );
        });
    });
});
