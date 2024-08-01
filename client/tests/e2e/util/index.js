const text = async (page, selector, { wait = true } = {}) => {
  if (wait) await page.waitForSelector(selector);
  return page.$eval(selector, el => el.innerText);
};

const display = async (page, selector, { wait = true } = {}) => {
  if (wait) await page.waitForSelector(selector);
  return page.$eval(selector, el => {
    const styles = window.getComputedStyle(el);
    return styles.getPropertyValue('display');
  });
};

/**
 * Checks for errors on a given page
 * @param {Page} page - Puppeteer page object
 * @param {Function} action - Async function to perform actions that might trigger PropType errors
 * @param {number} [timeout=500] - Timeout in milliseconds to wait for errors
 * @returns {Promise<string[]>} - Array of error messages, if any
 */
async function checkConsoleErrors(page, action, timeout = 500) {
  let errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await action();

  await page.waitForTimeout(timeout);

  return errors;
}

module.exports = {
  text,
  display,
  checkConsoleErrors
};
