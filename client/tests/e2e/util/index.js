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

module.exports = {
  text,
  display
};
