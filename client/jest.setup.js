import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new EnzymeAdapter() });

const fetch = require('node-fetch');

global.fetch = fetch;
