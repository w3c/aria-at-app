import getPage from '../util/getPage';
import { checkConsoleErrors, text } from './util';

describe('Data Management common traits', () => {
  it('renders page h1', async () => {
    await getPage({ role: false, url: '/data-management' }, async page => {
      const h1Element = await text(page, 'h1');
      expect(h1Element).toBe('Data Management');
    });
  });

  it('renders page with introduction', async () => {
    await getPage({ role: false, url: '/data-management' }, async page => {
      const introductionHeadingSelector = 'h2 ::-p-text(Introduction)';
      const errors = await checkConsoleErrors(page, async () => {
        const introductionHeadingText = await text(
          page,
          introductionHeadingSelector
        );
        expect(introductionHeadingText).toBe('Introduction');
      });

      expect(errors).toHaveLength(0);

      const introductionContentSelector =
        '[data-testid="data-management-instructions"]';
      const introductionContentText = await text(
        page,
        introductionContentSelector
      );

      expect(introductionContentText).toMatch(
        /This page provides a view of the latest test plan version information, and where they currently are in the ARIA-AT Community Group’s review process\./
      );
    });
  });

  it('renders page with Test Plan Status Summary heading and table', async () => {
    await getPage({ role: false, url: '/data-management' }, async page => {
      const testPlansStatusSummarySelector = 'h2 ::-p-text(Test Plans Status)';
      const testPlansStatusSummaryText = await text(
        page,
        testPlansStatusSummarySelector
      );

      const testPlansStatusSummaryTableSelector = `table[aria-label="${testPlansStatusSummaryText} Table"]`;
      await page.waitForSelector(testPlansStatusSummarySelector);

      const tableHeadings = await page.$eval(
        testPlansStatusSummaryTableSelector,
        el => {
          const headings = [];
          const headingCells = el.querySelectorAll('thead th');
          headingCells.forEach(cell => headings.push(cell.innerText.trim()));

          return headings;
        }
      );

      const tableRowCount = await page.$eval(
        testPlansStatusSummaryTableSelector,
        el => el.rows.length
      );

      expect(testPlansStatusSummaryText).toBe('Test Plans Status Summary');
      expect(tableHeadings.length).toEqual(7);
      expect(tableHeadings.includes('Test Plan')).toBe(true);
      expect(tableHeadings.includes('Covered AT')).toBe(true);
      expect(tableHeadings.includes('Overall Status')).toBe(true);
      expect(tableHeadings.includes('R&D Version')).toBe(true);
      expect(tableHeadings.includes('Draft Review')).toBe(true);
      expect(tableHeadings.includes('Candidate Review')).toBe(true);
      expect(tableHeadings.includes('Recommended Version')).toBe(true);
      // More than just the header row if populated
      expect(tableRowCount).toBeGreaterThan(1);
    });
  });

  it('renders page with filter options', async () => {
    await getPage({ role: false, url: '/data-management' }, async page => {
      await text(page, 'li ::-p-text(Filter)');
      const allOption = await text(page, 'li button ::-p-text(All Plans)');
      const rdOption = await text(page, 'li button ::-p-text(R&D Complete)');
      const draftOption = await text(
        page,
        'li button ::-p-text(In Draft Review)'
      );
      const candidateOption = await text(
        page,
        'li button ::-p-text(In Candidate Review)'
      );
      const recommendedOption = await text(
        page,
        'li button ::-p-text(Recommended Plans)'
      );

      expect(allOption).toMatch(/All Plans \(\d+\)/);
      expect(rdOption).toMatch(/R&D Complete \(\d+\)/);
      expect(draftOption).toMatch(/In Draft Review \(\d+\)/);
      expect(candidateOption).toMatch(/In Candidate Review \(\d+\)/);
      expect(recommendedOption).toMatch(/Recommended Plans \(\d+\)/);
    });
  });
});
