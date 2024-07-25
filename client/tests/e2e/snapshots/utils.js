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

  // Remove elements with Date or status content that might differ between local and CI
  await page.evaluate(() => {
    function removeElements(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (
          text.includes('Target') ||
          text.includes('Days Past') ||
          text.includes('Review Completed') ||
          text.includes('Target Completion Date') ||
          text.includes('Ready for Review') ||
          text.includes('Review in Progress') ||
          text.match(/\w{3} \d{1,2}, \d{4}/)
        ) {
          el.remove();
        }
      });
    }

    removeElements('span, p.review-text, span.review-complete, div.info-label');
    removeElements('td > i');
    removeElements('.ready-for-review, .in-progress');
  });

  const content = await page.content();

  // Strip out "Previously Viewed" badges and other dynamic content
  let cleanedContent = content.replace(
    /<span[^>]*class="[^"]*viewed-badge[^"]*"[^>]*>Previously Viewed<\/span>/g,
    ''
  );

  // Remove href and version number on data management page
  // Addresses inconsistent links and date -> version number
  cleanedContent = cleanedContent.replace(
    /<span[^>]*class="[^"]*full-width[^"]*"[^>]*>\s*<a href="\/test-review\/\d+">\s*<span>\s*<svg[\s\S]*?<\/svg>\s*<b>V\d+\.\d+\.\d+(?:-\d+)?<\/b>\s*<\/span>\s*<\/a>\s*<\/span>/g,
    '<span class="full-width"><a><span><svg>...</svg><b>VERSION_REMOVED</b></span></a></span>'
  );

  // Strip out randomly generated IDs
  cleanedContent = cleanedContent.replace(
    /id="react-aria\d+-:r[0-9a-z]+:"/g,
    ''
  );

  // Remove review text with dates
  cleanedContent = cleanedContent.replace(
    /<p class="review-text">.*?<\/p>/g,
    ''
  );

  // Remove review completed span
  cleanedContent = cleanedContent.replace(
    /<span[^>]*class="review-complete"[^>]*>.*?<\/span>/g,
    ''
  );

  // Remove target completion date div
  cleanedContent = cleanedContent.replace(
    /<div class="info-label">.*?Target Completion Date:.*?<\/div>/g,
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
