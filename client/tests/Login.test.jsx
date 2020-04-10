import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

import Login from '../components/Login';
import { storeFactory } from './util';

Enzyme.configure({ adapter: new EnzymeAdapter() });

test('renders without crashing', () => {
    const store = storeFactory();
    const wrapper = shallow(<Login store={store} />);
    expect(wrapper).toBeTruthy();
});
