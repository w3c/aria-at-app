import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { findByTestAttr } from './util';
import UserSettings from '../components/UserSettings';

const setup = () => {
    // Step into the higher order connected component and step into the contents of the UserSettings component
    const wrapper = shallow(<UserSettings />)
        .dive()
        .dive();
    return wrapper;
};

describe.skip('render', () => {
    describe('user is not signed in', () => {
        let wrapper;
        beforeEach(() => {
            wrapper = setup();
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
            wrapper = setup();
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
