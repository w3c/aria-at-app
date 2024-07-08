/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import TestQueue from '../components/TestQueue2';

// eslint-disable-next-line jest/no-mocks-import
import {
  TEST_QUEUE_PAGE_ADMIN_NOT_POPULATED_MOCK_DATA,
  TEST_QUEUE_PAGE_TESTER_NOT_POPULATED_MOCK_DATA,
  TEST_QUEUE_PAGE_BASE_MOCK_DATA
} from './__mocks__/GraphQLMocks';
import { AriaLiveRegionProvider } from '../components/providers/AriaLiveRegionProvider';

const setup = (mocks = []) => {
  const mergedMocks = [...TEST_QUEUE_PAGE_BASE_MOCK_DATA, ...mocks];
  return render(
    <BrowserRouter>
      <AriaLiveRegionProvider>
        <MockedProvider
          mocks={mergedMocks}
          cache={new InMemoryCache({ addTypename: false })}
        >
          <TestQueue />
        </MockedProvider>
      </AriaLiveRegionProvider>
    </BrowserRouter>
  );
};

describe('Render TestQueue/index.jsx', () => {
  let wrapper;

  describe('not admin when no test plan reports exist', () => {
    beforeEach(() => {
      wrapper = setup(TEST_QUEUE_PAGE_TESTER_NOT_POPULATED_MOCK_DATA);
    });

    it('renders loading state on initialization', async () => {
      const { queryByTestId } = wrapper;
      const element = queryByTestId('page-status');

      expect(element).toBeTruthy();
      expect(element).toHaveTextContent('Loading');
    });

    it('renders Test Queue page instructions', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryByTestId } = wrapper;
      const loadingElement = queryByTestId('page-status');
      const noTestPlansMessageElement = queryByTestId('no-test-plans');
      const addTestPlanToQueueMessageElement = queryByTestId(
        'add-test-plans-queue'
      );

      expect(loadingElement).not.toBeInTheDocument();
      expect(noTestPlansMessageElement).toBeTruthy();
      expect(noTestPlansMessageElement).toHaveTextContent(
        /There are currently no test plan reports available/i
      );
      expect(addTestPlanToQueueMessageElement).not.toBeTruthy();
    });

    it('renders no AT-specific sections', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryAllByText } = wrapper;
      const nvdaElements = queryAllByText(/nvda/i);
      const jawsElements = queryAllByText(/jaws/i);
      const voiceOverElements = queryAllByText(/voiceover/i);

      expect(nvdaElements.length).toEqual(0);
      expect(jawsElements.length).toEqual(0);
      expect(voiceOverElements.length).toEqual(0);
    });

    it('does not render ManageTestQueue component', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryByText } = wrapper;
      expect(
        queryByText('Manage Assistive Technology Versions')
      ).not.toBeInTheDocument();
      expect(
        queryByText('Add Test Plans to the Test Queue')
      ).not.toBeInTheDocument();
    });
  });

  describe('is admin when no test plan reports exist', () => {
    beforeEach(() => {
      wrapper = setup(TEST_QUEUE_PAGE_ADMIN_NOT_POPULATED_MOCK_DATA);
    });

    it('renders loading state on initialization', async () => {
      const { queryByTestId } = wrapper;
      const element = queryByTestId('page-status');

      expect(element).toBeTruthy();
      expect(element).toHaveTextContent('Loading');
    });

    it('renders Test Queue page instructions', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryByTestId } = wrapper;
      const loadingElement = queryByTestId('page-status');
      const noTestPlansMessageElement = queryByTestId('no-test-plans');
      const addTestPlanToQueueMessageElement = queryByTestId(
        'add-test-plans-queue'
      );

      expect(loadingElement).not.toBeInTheDocument();
      expect(noTestPlansMessageElement).toBeTruthy();
      expect(noTestPlansMessageElement).toHaveTextContent(
        /There are currently no test plan reports available/i
      );
      expect(addTestPlanToQueueMessageElement).toHaveTextContent(
        /Add a Test Plan to the Queue/i
      );
    });

    it('renders no AT-specific sections', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryAllByText } = wrapper;
      const nvdaElements = queryAllByText(/nvda/i);
      const jawsElements = queryAllByText(/jaws/i);
      const voiceOverElements = queryAllByText(/voiceover/i);

      expect(nvdaElements.length).toEqual(0);
      expect(jawsElements.length).toEqual(0);
      expect(voiceOverElements.length).toEqual(0);
    });

    it('renders ManageTestQueue component', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryByText } = wrapper;
      expect(
        queryByText('Manage Assistive Technology Versions')
      ).toBeInTheDocument();
      expect(
        queryByText('Add Test Plans to the Test Queue')
      ).toBeInTheDocument();
    });

    it('renders add test plan modal on button click', async () => {
      // allow page time to load
      await waitFor(() => new Promise(res => setTimeout(res, 0)));

      const { queryByRole, queryByText } = wrapper;
      const manageAssistiveTechnologyVersionsButton = queryByRole('button', {
        name: 'Manage Assistive Technology Versions'
      });
      const addTestPlansToTestQueueButton = queryByRole('button', {
        name: 'Add Test Plans to the Test Queue'
      });

      fireEvent.click(manageAssistiveTechnologyVersionsButton);
      fireEvent.click(addTestPlansToTestQueueButton);

      expect(
        queryByText(
          'Select an assistive technology and manage its versions in the ARIA-AT App'
        )
      ).toBeVisible();
      expect(
        queryByText(
          'Select a test plan, assistive technology and browser to add a new test plan report to the test queue.'
        )
      ).toBeVisible();
    });
  });
});
