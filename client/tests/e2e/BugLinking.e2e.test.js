import getPage from '../util/getPage';

describe('AT Bug Linking - Basic Functionality', () => {
  it('creates AtBug, links it, and unlinks it', async () => {
    await getPage(
      { role: 'admin', url: '/report/24/targets/4' },
      async page => {
        await page.waitForSelector('h1 ::-p-text(Modal Dialog Example)');

        // Step 1: Open bug linking modal
        const linkBugButtonSelector = 'button ::-p-text(Link NVDA Bug)';
        await page.waitForSelector(linkBugButtonSelector);
        await page.click(linkBugButtonSelector);

        await page.waitForSelector(
          '::-p-text(Link NVDA Bug to Failing Assertion)'
        );
        await page.waitForSelector('::-p-text(NVDA Bug)');
        await page.waitForSelector(
          'input[placeholder="Type to search by title, number, or URL"]'
        );

        // Step 2: Create an AtBug
        const createNewButtonSelector =
          'button ::-p-text(+ Add a New NVDA Bug)';
        await page.waitForSelector(createNewButtonSelector);
        await page.click(createNewButtonSelector);

        await page.waitForSelector('::-p-text(Add New Bug Link)');

        const titleInputSelector = 'input[name="title"]';
        const bugIdInputSelector = 'input[name="bugId"]';
        const urlInputSelector = 'input[name="url"]';

        await page.waitForSelector(titleInputSelector);
        await page.type(titleInputSelector, 'Test Bug Title');

        await page.waitForSelector(bugIdInputSelector);
        await page.type(bugIdInputSelector, '12345');

        await page.waitForSelector(urlInputSelector);
        await page.type(urlInputSelector, 'https://example.com/bug/12345');

        const addButtonSelector = 'button[type="submit"]';
        await page.waitForSelector(addButtonSelector);
        await page.click(addButtonSelector);

        // Wait for the form to be submitted and mode to switch back to select
        await page.waitForSelector(
          'input[placeholder="Type to search by title, number, or URL"]'
        );

        // Step 3: Link the AtBug
        const searchInputSelector =
          'input[placeholder="Type to search by title, number, or URL"]';
        await page.type(searchInputSelector, 'Test Bug');

        const firstOptionSelector = '[role="option"]:first-child';
        await page.waitForSelector(firstOptionSelector);
        await page.click(firstOptionSelector);

        await page.waitForSelector('button ::-p-text(Save)');
        await page.click('button ::-p-text(Save)');

        // Wait for modal to close automatically and verify bug is linked
        await page.waitForSelector('h1 ::-p-text(Modal Dialog Example)');

        // Verify bug is linked by checking for the bug link in the table
        await page.waitForSelector('a[href="https://example.com/bug/12345"]');

        // Wait for the UI to settle after linking
        await page.waitForNetworkIdle();

        // Step 4: Reopen modal and unlink the AtBug
        await page.waitForSelector(linkBugButtonSelector);
        await page.click(linkBugButtonSelector);
        await page.waitForSelector(
          '::-p-text(Link NVDA Bug to Failing Assertion)'
        );

        const unlinkButtonSelector = 'button[aria-label*="Unlink"]';
        await page.waitForSelector(unlinkButtonSelector);
        await page.click(unlinkButtonSelector);

        await page.waitForSelector('button ::-p-text(Save)');
        await page.click('button ::-p-text(Save)');

        // Wait for modal to close automatically
        await page.waitForSelector('h1 ::-p-text(Modal Dialog Example)');

        // Wait for the UI to update after unlinking
        await page.waitForNetworkIdle();

        // Verify bug is unlinked by checking the link is no longer present
        const bugLinks = await page.$$(
          'a[href="https://example.com/bug/12345"]'
        );
        expect(bugLinks).toHaveLength(0);
      }
    );
  });
});
