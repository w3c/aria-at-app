const prettier = require('prettier');

const snapshotRoutes = [
  '/',
  '/signup-instructions',
  '/account/settings',
  '/test-queue',
  '/reports',
  '/candidate-review',
  '/data-management',
  '/404',
  '/test-plan-report/1',
  '/test-review/8',
  '/run/2',
  '/data-management/meter',
  '/candidate-test-plan/24/1'
];

async function cleanAndNormalizeSnapshot(page) {
  // Remove all <style> and <link rel="stylesheet"> elements
  await page.evaluate(() => {
    const stylesToRemove = document.querySelectorAll(
      'style, link[rel="stylesheet"]'
    );
    stylesToRemove.forEach(el => el.remove());
  });

  const content = await page.content();

  // Strip out randomly generated ids, "id=react-aria*"
  const cleanedContent = content.replace(
    /id="react-aria\d+-:r[0-9a-z]+:"/g,
    ''
  );

  // Prettify the HTML
  const prettifiedHtml = await prettier.format(cleanedContent, {
    parser: 'html',
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    singleQuote: false,
    bracketSameLine: true
  });

  return prettifiedHtml;
}

const routeToSnapshotFilename = route => {
  return `${route.replace(/\//g, '_')}.html`;
};

module.exports = {
  snapshotRoutes,
  cleanAndNormalizeSnapshot,
  routeToSnapshotFilename
};
