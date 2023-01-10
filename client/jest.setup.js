const fetch = require('node-fetch');
const textEncoder = require('util').TextEncoder;
// const ResizeObserver = require('resize-observer-polyfill');

global.fetch = fetch;
global.TextEncoder = textEncoder;
// global.ResizeObserver = require('resize-observer-polyfill')
