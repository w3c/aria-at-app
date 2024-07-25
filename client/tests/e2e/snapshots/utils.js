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

  // Remove elements with ready for review and in progress statuses
  // These can change on multiple viewings
  await page.evaluate(() => {
    function removeElements(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (
          text.includes('Ready for Review') ||
          text.includes('Review in Progress')
        ) {
          el.remove();
        }
      });
    }

    removeElements('.ready-for-review, .in-progress');
  });

  const content = await page.content();

  // Strip out "Previously Viewed" badges and other dynamic content
  let cleanedContent = content.replace(
    /<span[^>]*class="[^"]*viewed-badge[^"]*"[^>]*>Previously Viewed<\/span>/g,
    ''
  );

  // Strip out randomly generated IDs
  cleanedContent = cleanedContent.replace(
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
