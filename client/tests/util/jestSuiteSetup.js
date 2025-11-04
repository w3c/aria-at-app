const fetch = require('node-fetch');
const textEncoder = require('util').TextEncoder;

global.fetch = fetch;
global.TextEncoder = textEncoder;

afterEach(async () => {
  if (global.browser) {
    const pages = await global.browser.pages();
    for (let i = 1; i < pages.length; i++) {
      try {
        await pages[i].close();
      } catch (error) {
        console.error('Error closing page', error);
      }
    }
  }
});
