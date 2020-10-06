import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr, storeFactory } from './util';
import ConfigureActiveRuns from '../components/ConfigureActiveRuns';

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    const wrapper = shallow(
        <ConfigureActiveRuns
            store={store}
            match={{ params: { cycleId: 1, runId: 1 } }}
        />
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
            const component = findByTestAttr(wrapper, 'initiate-cycle-loading');
            expect(component.text()).toContain('Loading');
        });
    });
    describe('tests are loaded', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = {
                ats: [{ id: 1, name: 'Vader Voice' }],
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
                        1: {
                            tests: [{ name: 'Test 1' }]
                        }
                    },
                    testSuiteVersions: [
                        {
                            datetime: '2020-05-06T04:00:00.000Z',
                            git_commit_msg:
                                'Checkbox: Test navigating through group with arrows',
                            git_hash:
                                'ff1ed8a347dfc5ca7be47fa8620cfac681af0439',
                            git_repo: 'https://github.com/w3c/aria-at.git',
                            git_tag: null,
                            id: 1,
                            supported_ats: [
                                {
                                    at_id: 1,
                                    at_key: 'vader-voice',
                                    at_name: 'Vader Voice',
                                    at_name_id: 1
                                }
                            ],
                            apg_examples: [
                                {
                                    directory: 'checkbox',
                                    id: 1,
                                    name: 'Checkbox Example (Two State)'
                                }
                            ],
                            browsers: [
                                {
                                    id: 1,
                                    name: 'Firefox'
                                }
                            ]
                        }
                    ]
                },
                user: {
                    email: 'jane@maine.com',
                    fullname: 'Jane Rain',
                    id: 10,
                    isSignedIn: true,
                    loadedUserData: true,
                    roles: (2)[('admin', 'tester')],
                    username: 'jane'
                },
                users: {
                    usersById: {
                        10: {
                            configured_ats: [],
                            email: 'jane@maine.com',
                            fullname: 'Jane Rain',
                            id: 10,
                            username: 'jane'
                        }
                    }
                }
            };
            wrapper = setup(initialState);
            wrapper.setState({ currentTestIndex: 1 });
        });
        test('renders component ui sections', () => {
            let component = findByTestAttr(wrapper, 'initiate-cycle-h2');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Initiate a Test Cycle');

            component = findByTestAttr(wrapper, 'initiate-cycle-h3');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Test Cycle Configuration');

            component = findByTestAttr(wrapper, 'initiate-cycle-name-label');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Test Cycle Name');

            component = findByTestAttr(wrapper, 'initiate-cycle-name-input');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('');

            component = findByTestAttr(wrapper, 'initiate-cycle-commit-label');
            expect(component.length).toBe(1);
            expect(component.text()).toContain('Git Commit of Tests');

            component = findByTestAttr(wrapper, 'initiate-cycle-commit-select');
            expect(component.length).toBe(1);
            expect(component.text()).toContain(
                'ff1ed8a - Checkbox: Test navigating thro...'
            );
        });
    });
});
