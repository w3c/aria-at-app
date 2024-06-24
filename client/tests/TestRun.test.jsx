/**
 * @jest-environment jsdom
 */

import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr } from './util';
import TestRun from '../components/TestRun';

const setup = () => {
  // Step into the higher order connected component and step into the contents of the UserSettings component
  const wrapper = shallow(
    <TestRun match={{ params: { runId: 1 } }} location={{}} />
  )
    .dive()
    .dive();
  return wrapper;
};

describe.skip('render', () => {
  describe('loading when there are no tests', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = setup();
    });
    test('renders not logged in text', () => {
      const component = findByTestAttr(wrapper, 'test-run-page-status');
      expect(component.text()).toContain('Loading');
    });
  });
  describe('tests are loaded', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = setup();
      wrapper.setState({ currentTestIndex: 1 });
    });
    test('renders testing headings', () => {
      let component = findByTestAttr(wrapper, 'apg-example-name');
      expect(component.length).toBe(1);
      expect(component.text()).toContain('Test Plan');

      component = findByTestAttr(wrapper, 'at-browser');
      expect(component.length).toBe(1);
      expect(component.text()).toContain('with');
    });
  });
});
