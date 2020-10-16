import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr, storeFactory } from './util';
import TestQueue from '../components/TestQueue';

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    const wrapper = shallow(
        <TestQueue store={store} match={{ params: { cycleId: 1, runId: 1 } }} />
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
            const component = findByTestAttr(wrapper, 'test-queue-loading');
            expect(component.text()).toContain('Loading');
        });
    });
    describe('tests are loaded, no ATs', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = {
                ats: [],
                cycles: {
                    testsByRunId: {
                        1: {
                            tests: [{ name: 'Test 1' }]
                        }
                    },
                    testSuiteVersions: [
                        {
                            date: '2020-05-06T04:00:00.000Z',
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
                runs: {
                    activeRunsById: {
                        1: {
                            apg_example_name: 'apg_example_name',
                            at_name: 'at_name',
                            at_version: 'at_version',
                            browser_name: 'browser_name',
                            browser_version: 'browser_version'
                        }
                    }
                },
                user: {
                    email: 'jane@maine.com',
                    fullname: 'Jane Rain',
                    id: 10,
                    isSignedIn: true,
                    loadedUserData: true,
                    roles: ['admin', 'tester'],
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
        test('renders notice to configure ATs', () => {
            let component = findByTestAttr(wrapper, 'test-queue-no-ats-h2');
            expect(component.length).toBe(1);
            expect(component.text()).toContain(
                'No Assistive Technologies Configured'
            );

            component = findByTestAttr(wrapper, 'test-queue-no-ats-p');
            expect(component.length).toBe(1);
            expect(component.text()).toContain(
                'To contribute tests, please configure the relevant Assistive Technologies in Settings'
            );
        });
    });
});
