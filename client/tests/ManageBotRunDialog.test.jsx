/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ManageBotRunDialog from '../components/ManageBotRunDialog/';
import {
    COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
    MARK_COLLECTION_JOB_AS_FINISHED
} from '../components/ManageBotRunDialog/queries';
import '@testing-library/jest-dom/extend-expect';

const mocks = [
    {
        request: {
            query: COLLECTION_JOB_ID_BY_TEST_PLAN_RUN_ID_QUERY,
            variables: {
                testPlanRunId: '1'
            }
        },
        result: {
            data: {
                collectionJobByTestPlanRunId: {
                    id: 'collection-job-1'
                }
            }
        }
    },
    {
        request: {
            query: MARK_COLLECTION_JOB_AS_FINISHED,
            variables: {
                collectionJobId: 'collection-job-1'
            }
        },
        result: {
            data: {
                collectionJob: {
                    markCollectionJobFinished: {
                        id: 'collection-job-1',
                        status: 'CANCELLED'
                    }
                }
            }
        }
    }
];

describe('FinishBotRunDialog', () => {
    test('renders without crashing', () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ManageBotRunDialog
                    testPlanRun={{
                        id: '1',
                        tester: {
                            id: 1,
                            username: 'NVDA Bot'
                        }
                    }}
                    show={true}
                    setShow={jest.fn()}
                    testers={[
                        {
                            id: 1,
                            username: 'NVDA Bot'
                        }
                    ]}
                    testPlanReportId="1"
                    onChange={jest.fn()}
                    onDelete={jest.fn()}
                />
            </MockedProvider>
        );

        expect(screen.getByText('Manage NVDA Bot Run')).toBeInTheDocument();
    });

    test('triggers correct actions when buttons are clicked', async () => {
        const mockOnChange = jest.fn();
        const mockOnDelete = jest.fn();

        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ManageBotRunDialog
                    testPlanRun={{
                        id: '1',
                        tester: {
                            id: 1,
                            username: 'NVDA Bot'
                        }
                    }}
                    show={true}
                    setShow={jest.fn()}
                    testers={[
                        {
                            id: 1,
                            username: 'NVDA Bot'
                        }
                    ]}
                    testPlanReportId="1"
                    onChange={mockOnChange}
                    onDelete={mockOnDelete}
                />
            </MockedProvider>
        );

        await waitFor(() => new Promise(resolve => setTimeout(resolve, 0)));

        const markAsFinishedButton = screen.getByText('Mark as finished');
        const deleteButton = screen.getByLabelText('Delete bot run');

        fireEvent.click(markAsFinishedButton);

        await waitFor(() => expect(mockOnChange).toHaveBeenCalled());

        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalled();
    });
});
