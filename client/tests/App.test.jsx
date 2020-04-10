import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import { storeFactory } from './util';

import App from '../components/App';
import routes from '../routes';

Enzyme.configure({ adapter: new EnzymeAdapter() });

const setup = (initialState = {}) => {
    const store = storeFactory(initialState);
    // Step into the higher order connected component and step into the contents of the UserSettings component
    const wrapper = shallow(<App route={{ routes }} store={store} />).dive();
    return wrapper;
};

test('renders without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toBeTruthy();
});
