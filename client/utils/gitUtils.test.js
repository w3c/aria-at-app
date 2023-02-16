import { gitUpdatedDateToString } from './gitUtils';

describe('gitUpdatedDateToString', () => {
    it('returns a formatted string AM', () => {
        const date = '2021-11-30T09:51:28.000Z';
        const formattedDate = gitUpdatedDateToString(date);
        expect(formattedDate).toBe('Nov 30, 2021 at 9:51:28 am UTC');
    });

    it('returns a formatted string PM', () => {
        const date = '2021-11-30T14:51:28.000Z';
        const formattedDate = gitUpdatedDateToString(date);
        expect(formattedDate).toBe('Nov 30, 2021 at 2:51:28 pm UTC');
    });

    it('returns a formatted string when using 24-hour notation in a different locale (Dutch)', () => {
        const date = '2021-11-30T14:51:28.000Z';
        const formattedDate = gitUpdatedDateToString(date, 'nl-NL');
        // Dutch time uses a lowercase month notation
        expect(formattedDate).toBe('nov. 30, 2021 at 14:51:28 UTC');
    });

    it('returns a formatted string when using a different locale (Korean)', () => {
        const date = '2021-11-30T14:51:28.000Z';
        const formattedDate = gitUpdatedDateToString(date, 'ko-KR');
        expect(formattedDate).toBe('11월 30, 2021 at 오후 2:51:28 UTC');
    });
});
