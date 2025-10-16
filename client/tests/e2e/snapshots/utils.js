const prettier = require('prettier');

const snapshotRoutes = [
  { route: '/', waitForSelectors: ['p[data-test-id=keyMetrics]'] },
  { route: '/signup-instructions' },
  { route: '/account/settings' },
  { route: '/test-queue' },
  { route: '/reports', waitForSelectors: ['p[data-test-id=keyMetrics]'] },
  { route: '/candidate-review' },
  { route: '/data-management' },
  { route: '/404' },
  { route: '/test-plan-report/1' },
  { route: '/test-review/8' },
  { route: '/run/2' },
  { route: '/data-management/meter' },
  { route: '/candidate-test-plan/24/1' },
  { route: '/candidate-test-plan/24/1#summary-failures' },
  { route: '/test-queue/2/conflicts' },
  { route: '/report/67/targets/20' }
];

async function cleanAndNormalizeSnapshot(page) {
  // Remove all <style> and <link rel="stylesheet"> elements
  await page.evaluate(() => {
    const stylesToRemove = document.querySelectorAll(
      'style, link[rel="stylesheet"]'
    );
    stylesToRemove.forEach(el => el.remove());
  });

  // TODO: Investigate why "Ready for Review" and "Review in Progress" status
  // is not rolled back by transaction management system in e2e testing,
  // for now we will strip out the associated elements
  await page.evaluate(() => {
    function removeElements(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (
          text.includes('Review status by') ||
          text.includes('Ready for Review') ||
          text.includes('Review in Progress') ||
          (text.includes('Days') &&
            (text.includes('Past') || text.includes('Away')))
        ) {
          el.remove();
        }

        // Confirm text is from Run History component
        if (
          text.includes('Tested with') &&
          text.includes('and') &&
          text.includes('by') &&
          text.includes('on')
        ) {
          el.innerHTML = el.innerHTML.replace(/on [^<]*$/, '');
        }
      });
    }

    removeElements(
      '.ready-for-review, .in-progress, .target-days-container button, .review-status, .run-history-item'
    );
  });

  const content = await page.content();

  // TODO: Investigate why "Previously Viewed" status is not rolled back by transaction
  // management system in e2e testing, for now we will strip out the badges
  // "Previously Viewed"
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
