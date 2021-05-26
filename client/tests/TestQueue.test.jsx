import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr, storeFactory } from './util';
import TestQueue from '../components/TestQueue';

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    const wrapper = shallow(
        <TestQueue store={store} match={{ params: { runId: 1 } }} />
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
                runs: {
                    activeRunsById: {
                        1: {
                            id: 1,
                            apg_example_name: 'apg_example_name',
                            at_name: 'at_name',
                            at_version: 'at_version',
                            browser_name: 'browser_name',
                            browser_version: 'browser_version',
                        },
                    },
                },
                user: {
                    email: 'jane@maine.com',
                    fullname: 'Jane Rain',
                    id: 10,
                    isSignedIn: true,
                    loadedUserData: true,
                    roles: ['tester'],
                    username: 'jane',
                },
                users: {
                    usersById: {
                        10: {
                            configured_ats: [],
                            email: 'jane@maine.com',
                            fullname: 'Jane Rain',
                            id: 10,
                            username: 'jane',
                        },
                    },
                },
            };
            wrapper = setup(initialState);
            wrapper.setState({ currentTestIndex: 1 });
        });
        test('renders notice to configure ATs, as a tester', () => {
            let component = findByTestAttr(wrapper, 'test-queue-no-ats-h2');
            expect(component.length).toBe(1);
            expect(component.text()).toContain(
                'There are no Test Plans available'
            );

            component = findByTestAttr(wrapper, 'test-queue-no-ats-p');
            expect(component.length).toBe(1);
            expect(component.text()).toContain(
                'Please configure your preferred Assistive Technologies in the Settings page.'
            );
        });
    });
});
