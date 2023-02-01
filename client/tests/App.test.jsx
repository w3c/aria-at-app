/**
 * @jest-environment jsdom
 */

import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import App from '../components/App';
import GraphQLProvider from '../components/GraphQLProvider';

Enzyme.configure({ adapter: new EnzymeAdapter() });

const setup = () => {
    const wrapper = shallow(
        <GraphQLProvider>
            <App />
        </GraphQLProvider>
    ).dive();
    return wrapper;
};

test.skip('renders without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toBeTruthy();
});
