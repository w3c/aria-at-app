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
    REMOVE_TESTER_MUTATION
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
    { id: '1', username: 'john' },
    { id: '2', username: 'jane' },
    { id: '3', username: 'bot' }
];

const mockProps = {
    testPlanReportId: 'report1',
    possibleTesters: mockPossibleTesters,
    onChange: jest.fn(),
    testPlanRun: null,
    draftTestPlanRuns: [],
    label: 'Assign testers'
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
                                        username: 'john'
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

        const items = await screen.findAllByText(/john/);
        fireEvent.click(items[0]);

        await waitFor(() => {
            expect(useMutation).toHaveBeenCalledWith(ASSIGN_TESTER_MUTATION);
            expect(mockProps.onChange).toHaveBeenCalledTimes(1);
        });
    });

    it('removes tester correctly and calls removeTester mutation', async () => {
        mockProps.draftTestPlanRuns = [
            {
                initiatedByAutomation: false,
                tester: {
                    id: '1',
                    username: 'john'
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

        const items = await screen.findAllByText(/john/);
        fireEvent.click(items[0]);

        await waitFor(() => {
            expect(useMutation).toHaveBeenCalledWith(REMOVE_TESTER_MUTATION);
        });
    });
});
