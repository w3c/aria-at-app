import getPage from '../util/getPage';
import { checkConsoleErrors, text } from './util';

describe('Versions page for pattern with highest report being recommended', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/checkbox-tri-state' },
      async page => {
        const errors = await checkConsoleErrors(page, async () => {
          await text(
            page,
            'h1 ::-p-text(Checkbox Example (Tri State) Test Plan Versions)'
          );
        });

        expect(errors).toHaveLength(0);
      }
    );
  });
});

describe('Versions page for pattern with highest report being candidate', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/modal-dialog' },
      async page => {
        await text(
          page,
          'h1 ::-p-text(Modal Dialog Example Test Plan Versions)'
        );
      }
    );
  });
});

describe('Versions page for pattern with highest report being draft', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/alert' },
      async page => {
        await text(page, 'h1 ::-p-text(Alert Example Test Plan Versions)');
      }
    );
  });
});

describe('Versions page for pattern with highest report being R&D', () => {
  it('renders page h1', async () => {
    await getPage(
      { role: false, url: '/data-management/banner' },
      async page => {
        await text(page, 'h1 ::-p-text(Banner Landmark Test Plan Versions)');
      }
    );
  });
});
