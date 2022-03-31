import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import nodeFetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import jsdom from 'jsdom';
import createGlobalJSDOM from 'jsdom-global';

Enzyme.configure({ adapter: new EnzymeAdapter() });

const cookieJar = new jsdom.CookieJar();

createGlobalJSDOM(``, { cookieJar });

const fetch = fetchCookie(nodeFetch, cookieJar);

global.fetch = fetch;
