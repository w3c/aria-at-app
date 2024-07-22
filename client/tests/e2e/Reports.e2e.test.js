import getPage from '../util/getPage';
import { text } from './util';

describe('Report page for recommended report', () => {
  it('renders page h1', async () => {
    await getPage({ role: false, url: '/report/67' }, async page => {
      await text(page, 'h1 ::-p-text(Checkbox Example (Mixed-State))');
    });
  });

  // TODO: Additional tests
});

describe('Report page for candidate report', () => {
  it('renders page h1', async () => {
    await getPage({ role: false, url: '/report/24' }, async page => {
      await text(page, 'h1 ::-p-text(Modal Dialog Example)');
    });
  });

  // TODO: Additional tests
});
