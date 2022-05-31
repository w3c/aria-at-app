import React from 'react';
import {
    render,
    // screen,
    waitFor,
    // fireEvent,
    act
} from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import TestQueue from '../components/TestQueue';

// eslint-disable-next-line jest/no-mocks-import
import {
    TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_ADMIN,
    TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_TESTER,
    TEST_QUEUE_PAGE_POPULATED_MOCK_ADMIN,
    TEST_QUEUE_PAGE_POPULATED_MOCK_TESTER
} from './__mocks__/GraphQLMocks';

const setup = (mocks = []) => {
    return render(
        <BrowserRouter>
            <MockedProvider
                mocks={mocks}
                cache={new InMemoryCache({ addTypename: false })}
            >
                <TestQueue />
            </MockedProvider>
        </BrowserRouter>
    );
};

describe('Render TestQueue/index.jsx', () => {
    let wrapper;

    describe('[NOT ADMIN] when no test plan reports exist', () => {
        beforeEach(() => {
            wrapper = setup(TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_TESTER);
        });

        it('renders loading state on initialization', async () => {
            const { getByTestId } = wrapper;
            const element = getByTestId('page-status');

            expect(element).toBeTruthy();
            expect(element).toHaveTextContent('Loading');
        });

        it('renders Test Queue page instructions', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));

                const { queryByTestId, getByTestId } = wrapper;
                const loadingElement = queryByTestId('page-status');
                const element = getByTestId('test-queue-no-test-plans-p');

                expect(loadingElement).not.toBeInTheDocument();
                expect(element).toBeTruthy();
                expect(element).toHaveTextContent(
                    /Please configure your preferred Assistive Technologies in/gi
                );
            });
        });

        it('renders no AT-specific sections', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryAllByText } = wrapper;
            const nvdaElements = queryAllByText(/nvda/gi);
            const jawsElements = queryAllByText(/jaws/gi);
            const voiceOverElements = queryAllByText(/voiceover/gi);

            expect(nvdaElements.length).toEqual(0);
            expect(jawsElements.length).toEqual(0);
            expect(voiceOverElements.length).toEqual(0);
        });

        it('does not render add test plan modal button', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryByTestId } = wrapper;
            const button = queryByTestId(
                'test-queue-add-test-plan-to-queue-button'
            );

            expect(button).not.toBeTruthy();
        });
    });

    describe('[NOT ADMIN] when test plan reports exist', () => {
        beforeEach(() => {
            wrapper = setup(TEST_QUEUE_PAGE_POPULATED_MOCK_TESTER);
        });

        it('renders loading state on initialization', async () => {
            const { getByTestId } = wrapper;
            const element = getByTestId('page-status');

            expect(element).toBeTruthy();
            expect(element).toHaveTextContent('Loading');
        });

        it('renders Test Queue page instructions', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryByTestId, getByTestId } = wrapper;
            const loadingElement = queryByTestId('page-status');
            const element = getByTestId('test-queue-instructions');

            expect(loadingElement).not.toBeInTheDocument();
            expect(element).toBeTruthy();
            expect(element).toHaveTextContent(
                'Assign yourself a test plan or start executing one that is already assigned to you.'
            );
        });

        it('renders AT-specific sections', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryAllByText } = wrapper;
            const nvdaElements = queryAllByText(/nvda/gi);
            const jawsElements = queryAllByText(/jaws/gi);
            const voiceOverElements = queryAllByText(/voiceover/gi);

            expect(nvdaElements.length).toBeGreaterThanOrEqual(1);
            expect(jawsElements.length).toBeGreaterThanOrEqual(1);
            expect(voiceOverElements.length).toBeGreaterThanOrEqual(1);
        });

        it('renders testers are assigned to Test Plans', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryAllByText } = wrapper;
            const userAAssignedElements = queryAllByText(/foo-bar/gi);
            const userBAssignedElements = queryAllByText(/bar-foo/gi);
            const userCAssignedElements = queryAllByText(/boo-far/gi);
            const assignedTestsElements = queryAllByText(
                /\d+ of \d+ tests complete/gi
            );

            expect(userAAssignedElements.length).toBeGreaterThanOrEqual(1);
            expect(userBAssignedElements.length).toBeGreaterThanOrEqual(1);
            expect(userCAssignedElements.length).toBeGreaterThanOrEqual(1);
            expect(assignedTestsElements.length).toBeGreaterThanOrEqual(1);
        });

        it('does not render add test plan modal button', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryByTestId } = wrapper;
            const button = queryByTestId(
                'test-queue-add-test-plan-to-queue-button'
            );

            expect(button).not.toBeTruthy();
        });
    });

    describe('[IS ADMIN] when no test plan reports exist', () => {
        beforeEach(() => {
            wrapper = setup(TEST_QUEUE_PAGE_NOT_POPULATED_MOCK_ADMIN);
        });

        it('renders loading state on initialization', async () => {
            const { getByTestId } = wrapper;
            const element = getByTestId('page-status');

            expect(element).toBeTruthy();
            expect(element).toHaveTextContent('Loading');
        });

        it('renders Test Queue page instructions', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryByTestId, getByTestId } = wrapper;
            const loadingElement = queryByTestId('page-status');
            const element = getByTestId('test-queue-no-test-plans-p');

            expect(loadingElement).not.toBeInTheDocument();
            expect(element).toBeTruthy();
            expect(element).toHaveTextContent(/Add a Test Plan to the Queue/gi);
        });

        it('renders no AT-specific sections', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryAllByText } = wrapper;
            const nvdaElements = queryAllByText(/nvda/gi);
            const jawsElements = queryAllByText(/jaws/gi);
            const voiceOverElements = queryAllByText(/voiceover/gi);

            expect(nvdaElements.length).toEqual(0);
            expect(jawsElements.length).toEqual(0);
            expect(voiceOverElements.length).toEqual(0);
        });

        // it('renders add test plan modal on button click', async () => {
        //     // allow page time to load
        //     await act(async () => {
        //         await waitFor(() => new Promise(res => setTimeout(res, 0)));
        //
        //         const { queryByTestId } = wrapper;
        //         const button = queryByTestId(
        //             'test-queue-add-test-plan-to-queue-button'
        //         );
        //
        //         expect(button).toBeTruthy();
        //
        //         // opens modal
        //         fireEvent.click(button);
        //
        //         expect(
        //             screen.getByText('Select an AT and Version')
        //         ).toBeInTheDocument();
        //         expect(
        //             screen.getByText('Select a Browser and Version')
        //         ).toBeInTheDocument();
        //         expect(
        //             screen.getByText('Select a Test Plan and Version')
        //         ).toBeInTheDocument();
        //     });
        // });
    });

    describe('[IS ADMIN] when test plan reports exist', () => {
        beforeEach(() => {
            wrapper = setup(TEST_QUEUE_PAGE_POPULATED_MOCK_ADMIN);
        });

        it('renders loading state on initialization', async () => {
            const { getByTestId } = wrapper;
            const element = getByTestId('page-status');

            expect(element).toBeTruthy();
            expect(element).toHaveTextContent('Loading');
        });

        it('renders Test Queue page instructions', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryByTestId, getByTestId } = wrapper;
            const loadingElement = queryByTestId('page-status');
            const element = getByTestId('test-queue-instructions');

            expect(loadingElement).not.toBeInTheDocument();
            expect(element).toBeTruthy();
            expect(element).toHaveTextContent(
                'Assign yourself a test plan or start executing one that is already assigned to you.'
            );
        });

        it('renders AT-specific sections', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryAllByText } = wrapper;
            const nvdaElements = queryAllByText(/nvda/gi);
            const jawsElements = queryAllByText(/jaws/gi);
            const voiceOverElements = queryAllByText(/voiceover/gi);

            expect(nvdaElements.length).toBeGreaterThanOrEqual(1);
            expect(jawsElements.length).toBeGreaterThanOrEqual(1);
            expect(voiceOverElements.length).toBeGreaterThanOrEqual(1);
        });

        it('renders testers are assigned to Test Plans', async () => {
            // allow page time to load
            await act(async () => {
                await waitFor(() => new Promise(res => setTimeout(res, 0)));
            });

            const { queryAllByText } = wrapper;
            const userAAssignedElements = queryAllByText(/esmeralda-baggins/gi);
            const userBAssignedElements = queryAllByText(/tom-proudfeet/gi);
            const assignedTestsElements = queryAllByText(
                /\d+ of \d+ tests complete/gi
            );

            expect(userAAssignedElements.length).toBeGreaterThanOrEqual(1);
            expect(userBAssignedElements.length).toBeGreaterThanOrEqual(1);
            expect(assignedTestsElements.length).toBeGreaterThanOrEqual(1);
        });

        // it('renders add test plan modal on button click', async () => {
        //     // allow page time to load
        //     await act(async () => {
        //         await waitFor(() => new Promise(res => setTimeout(res, 0)));
        //
        //         const { queryByTestId } = wrapper;
        //         const button = queryByTestId(
        //             'test-queue-add-test-plan-to-queue-button'
        //         );
        //
        //         expect(button).toBeTruthy();
        //
        //         // opens modal
        //         fireEvent.click(button);
        //
        //         expect(
        //             screen.getByText('Select an AT and Version')
        //         ).toBeInTheDocument();
        //         expect(
        //             screen.getByText('Select a Browser and Version')
        //         ).toBeInTheDocument();
        //         expect(
        //             screen.getByText('Select a Test Plan and Version')
        //         ).toBeInTheDocument();
        //     });
        // });
    });
});
