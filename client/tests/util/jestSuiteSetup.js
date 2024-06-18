const fetch = require('node-fetch');
const textEncoder = require('util').TextEncoder;

global.fetch = fetch;
global.TextEncoder = textEncoder;
