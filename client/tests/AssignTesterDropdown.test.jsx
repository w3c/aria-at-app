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
    { id: '1', username: 'bee', isBot: false, ats: [] },
    { id: '2', username: 'puppy', isBot: false, ats: [] },
    {
        id: '9999',
        username: 'NVDA Bot',
        isBot: true,
        ats: [{ id: '2', key: 'nvda' }]
    },
    {
        id: '9998',
        username: 'VoiceOver Bot',
        isBot: true,
        ats: [{ id: '3', key: 'voiceover_macos' }]
    }
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
import { act } from 'react-dom/test-utils';

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
const getMocks = (atKey, browserKey) => {
    const at = {
        nvda: {
            id: '2',
            name: 'NVDA',
            key: 'nvda'
        },
        jaws: {
            id: '1',
            name: 'JAWS',
            key: 'jaws'
        },
        voiceover_macos: {
            id: '3',
            name: 'VoiceOver for MacOS',
            key: 'voiceover_macos'
        }
    }[atKey];

    const browser = {
        chrome: {
            id: '2',
            name: 'Chrome',
            key: 'chrome'
        },
        safari_macos: {
            id: '3',
            name: 'Safari for MacOS',
            key: 'safari_macos'
        },
        voiceover_macos: {
            id: '3',
            name: 'VoiceOver for MacOS',
            key: 'voiceover_macos'
        }
    }[browserKey];

    if (!at) throw new Error('Unsupported AT key for mocks');
    if (!browser) throw new Error('Unsupported browser key for mocks');

    return [
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
                        at,
                        browser
                    }
                }
            }
        }
    ];
};

describe('AssignTesterDropdown', () => {
    beforeEach(() => {
        cleanup();
    });

    it('renders without crashing', () => {
        render(
            <MockedProvider mocks={getMocks('nvda', 'chrome')}>
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );
        expect(screen.getByLabelText('Assign testers')).toBeInTheDocument();
    });

    it('assigns tester correctly and calls assignTester mutation', async () => {
        render(
            <MockedProvider
                mocks={getMocks('nvda', 'chrome')}
                addTypename={false}
            >
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );

        const button = await screen.getByRole('button', {
            name: /assign testers/i
        });
        fireEvent.click(button);

        const items = await screen.findAllByText(/bee/);
        expect(items.length).toBe(2); // One for display, one for sr-only
        fireEvent.click(items[0]);

        await waitFor(async () => {
            expect(useMutation).toHaveBeenCalledWith(ASSIGN_TESTER_MUTATION);
            expect(mockProps.onChange).toHaveBeenCalledTimes(1);
            expect(mockProps.setAlertMessage).toHaveBeenCalledTimes(1);
            expect(mockProps.setAlertMessage).toHaveBeenCalledWith(
                expect.stringContaining('bee now checked')
            );
        });
    });

    it('assigns bot correctly and calls scheduleCollection mutation', async () => {
        render(
            <MockedProvider
                mocks={getMocks('nvda', 'chrome')}
                addTypename={false}
            >
                <AssignTesterDropdown {...mockProps} />
            </MockedProvider>
        );

        const button = await screen.getByRole('button', {
            name: /assign testers/i
        });
        fireEvent.click(button);

        const items = await screen.findAllByText(/NVDA Bot/);
        expect(items.length).toBe(2); // One for display, one for sr-only
        fireEvent.click(items[0]);

        await waitFor(() => {
            expect(useMutation).toHaveBeenCalledWith(
                SCHEDULE_COLLECTION_JOB_MUTATION
            );
            expect(mockProps.onChange).toHaveBeenCalledTimes(1);
        });
    });

    it('does not list bot when run does not support automation', async () => {
        await act(async () => {
            render(
                <MockedProvider
                    mocks={getMocks('jaws', 'chrome')}
                    addTypename={false}
                >
                    <AssignTesterDropdown {...mockProps} />
                </MockedProvider>
            );
        });
        let button;
        await waitFor(async () => {
            button = await screen.getByRole('button', {
                name: /assign testers/i
            });
        });

        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(async () => {
            const items = await screen.queryByText(/NVDA Bot/);
            expect(items).toBeNull();
        });
    });

    it('only lists supported bot', async () => {
        await act(async () => {
            render(
                <MockedProvider
                    mocks={getMocks('voiceover_macos', 'safari_macos')}
                    addTypename={false}
                >
                    <AssignTesterDropdown {...mockProps} />
                </MockedProvider>
            );
        });
        let button;
        await waitFor(async () => {
            button = await screen.getByRole('button', {
                name: /assign testers/i
            });
        });

        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(async () => {
            const items = await screen.queryAllByText(/NVDA Bot/);
            expect(items).toHaveLength(0);
        });

        await waitFor(async () => {
            const items = await screen.queryAllByText(/VoiceOver Bot/);
            expect(items).toHaveLength(2); // One for display, one for sr-only
        });
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
            <MockedProvider
                mocks={getMocks('nvda', 'chrome')}
                addTypename={false}
            >
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
                expect.stringContaining('bee now unchecked')
            );
        });
    });
});
