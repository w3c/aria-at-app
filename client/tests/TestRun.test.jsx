import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr, storeFactory } from './util';
import TestRun from '../components/TestRun';

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    // Step into the higher order connected component and step into the contents of the UserSettings component
    const wrapper = shallow(
        <TestRun store={store} match={{ params: { cycleId: 1, runId: 1 } }} />
    )
        .dive()
        .dive();
    return wrapper;
};

describe('render', () => {
    describe('loading when there are no tests', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = {};
            wrapper = setup(initialState);
        });
        test('renders not logged in text', () => {
            const component = findByTestAttr(wrapper, 'test-run-loading');
            expect(component.text()).toContain('Loading');
        });
    });
    describe('tests are loaded', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = {
                cycles: {
                    cyclesById: {
                        1: {
                            runsById: {
                                1: {
                                    apg_example_name: 'apg_example_name',
                                    at_name: 'at_name',
                                    at_version: 'at_version',
                                    browser_name: 'browser_name',
                                    browser_version: 'browser_version'
                                }
                            },
                            test_version_id: 1
                        }
                    },
                    testsByRunId: {
                        1: [{ name: 'Test 1' }]
                    },
                    testSuiteVersions: [
                        {
                            git_commit_msg: 'commit message',
                            git_hash: '123412345',
                            git_repo: 'https://github.com/foo/foo.git',
                            id: 1
                        }
                    ]
                }
            };
            wrapper = setup(initialState);
            wrapper.setState({ currentTestIndex: 1 });
        });
        test('renders testing headings', () => {
            let component = findByTestAttr(wrapper, 'test-run-h2');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('of');

            component = findByTestAttr(wrapper, 'test-run-h3');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('with');
        });
    });
});
