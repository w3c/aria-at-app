import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr, storeFactory } from './util';
import UserSettings from '../components/UserSettings';

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    // Step into the higher order connected component and step into the contents of the UserSettings component
    const wrapper = shallow(<UserSettings store={store} />)
        .dive()
        .dive();
    return wrapper;
};

describe('render', () => {
    describe('user is not signed in', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = { user: { isSignedIn: false } };
            wrapper = setup(initialState);
        });
        test('renders component without error', () => {
            const component = findByTestAttr(wrapper, 'user-settings-contents');
            expect(component.length).toBe(1);
        });
        test('renders not signed in text', () => {
            const component = findByTestAttr(
                wrapper,
                'user-settings-unauthorized'
            );
            expect(component.length).toBe(1);
        });
    });
    describe('user is signed in', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = {
                user: {
                    isSignedIn: true,
                    loadedUserData: true,
                    username: 'foobar',
                    name: 'Foo Bar',
                },
            };
            wrapper = setup(initialState);
        });
        test('renders component without error', () => {
            const component = findByTestAttr(wrapper, 'user-settings-contents');
            expect(component.length).toBe(1);
        });
        test('renders username', () => {
            const component = findByTestAttr(
                wrapper,
                'user-settings-authorized'
            );
            expect(component.length).toBe(1);
            expect(component.text()).toContain('User Details');
            expect(component.find('a').at(0).props().href).toContain(
                'https://github.com'
            );
        });
    });
});
