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
    describe('user is not logged in', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = { login: { isLoggedIn: false } };
            wrapper = setup(initialState);
        });
        test('renders component without error', () => {
            const component = findByTestAttr(
                wrapper,
                'component-user-settings'
            );
            expect(component.length).toBe(1);
        });
        test('renders not logged in text', () => {
            const component = findByTestAttr(
                wrapper,
                'user-settings-unauthorized'
            );
            expect(component.length).toBe(1);
        });
    });
    describe('user is logged in', () => {
        let wrapper;
        beforeEach(() => {
            const initialState = {
                login: { isLoggedIn: true, loadedUserData: true, username: 'foobar', name: 'Foo Bar' }
            };
            wrapper = setup(initialState);
        });
        test('renders component without error', () => {
            const component = findByTestAttr(
                wrapper,
                'component-user-settings'
            );
            expect(component.length).toBe(1);
        });
        test('renders username', () => {
            const component = findByTestAttr(
                wrapper,
                'user-settings-authorized'
            );
            expect(component.length).toBe(1);
            expect(component.text()).toContain('USER DETAILS');
        });
    });
});
