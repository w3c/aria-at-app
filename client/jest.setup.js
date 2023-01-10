const fetch = require('node-fetch');
const ResizeObserver = require('resize-observer-polyfill');

global.fetch = fetch;
global.ResizeObserver = require('resize-observer-polyfill')
