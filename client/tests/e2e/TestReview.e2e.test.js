import getPage from '../util/getPage';
import { text } from './util';

describe('Test Review page', () => {
  it('renders page for review page before test format v2', async () => {
    await getPage({ role: false, url: '/test-review/1' }, async page => {
      await text(
        page,
        'h1 ::-p-text(Alert Example Test Plan V22.04.14 (Deprecated))'
      );
    });
  });

  it('renders page for review page after test format v2', async () => {
    await getPage({ role: false, url: '/test-review/65' }, async page => {
      await text(
        page,
        'h1 ::-p-text(Alert Example Test Plan V23.12.06 (Deprecated))'
      );
    });
  });

  it.skip('opens latest review page for pattern', async () => {
    // TODO: Navigate to latest Alert Example from Data Management page and
    //  confirm it renders correctly and has expected properties
  });
});
