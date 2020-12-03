import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr, storeFactory } from './util';
import ConfigureActiveRuns from '../components/ConfigureActiveRuns';

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    const wrapper = shallow(
        <ConfigureActiveRuns store={store} match={{ params: { runId: 1 } }} />
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
            const component = findByTestAttr(wrapper, 'configure-run-loading');
            expect(component.text()).toContain('Loading');
        });
    });
    describe('tests are loaded', () => {
        let wrapper;
        let testVersion = {
            date: '2020-05-06T04:00:00.000Z',
            git_commit_msg:
                'Checkbox: Test navigating through group with arrows',
            git_hash: 'ff1ed8a347dfc5ca7be47fa8620cfac681af0439',
            git_repo: 'https://github.com/w3c/aria-at.git',
            git_tag: null,
            id: 1,
            apg_examples: [
                {
                    directory: 'checkbox',
                    id: 1,
                    name: 'Checkbox Example (Two State)'
                }
            ],
            supported_ats: [
                {
                    at_id: 1,
                    at_key: 'vader-voice',
                    at_name: 'Vader Voice',
                    at_name_id: 1
                }
            ]
        };
        let testVersion2 = {
            date: '2020-05-07T04:00:00.000Z',
            git_commit_msg:
                'Checkbox 2: Test navigating through group with arrows',
            git_hash: '12345',
            git_repo: 'https://github.com/w3c/aria-at.git',
            git_tag: null,
            id: 1,
            apg_examples: [
                {
                    directory: 'checkbox',
                    id: 1,
                    name: 'Checkbox Example (Two State)'
                }
            ],
            supported_ats: [
                {
                    at_id: 1,
                    at_key: 'vader-voice',
                    at_name: 'Vader Voice',
                    at_name_id: 1
                }
            ]
        };
        beforeEach(() => {
            const initialState = {
                ats: [{ id: 1, name: 'Vader Voice' }],
                runs: {
                    testVersions: [testVersion, testVersion2],
                    activeRunConfiguration: {
                        active_test_version: testVersion,
                        active_at_browser_pairs: [],
                        active_apg_examples: [],
                        browsers: [
                            {
                                id: 1,
                                name: 'Firefox'
                            }
                        ]
                    }
                }
            };
            wrapper = setup(initialState);
            wrapper.setState({ currentTestIndex: 1 });
        });
        test('renders component ui sections with an existing active test version', () => {
            let component = findByTestAttr(wrapper, 'configure-run-h2');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Configure Active Runs');

            component = findByTestAttr(wrapper, 'configure-run-h3');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Update Versions');

            component = findByTestAttr(
                wrapper,
                'configure-run-current-commit-label'
            );
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Current Git Commit');

            component = findByTestAttr(wrapper, 'configure-run-commit-select');
            expect(component.length).toBe(1);
            expect(component.text()).toContain(
                'May 7th 2020 - Checkbox 2: Test navigating'
            );

            component = findByTestAttr(wrapper, 'configure-run-commit-label');
            expect(component.text()).toContain('Select a different commit');
        });
    });
});
