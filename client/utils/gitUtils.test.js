import { gitUpdatedDateToString } from './gitUtils';

describe('gitUpdatedDateToString', () => {
    it('returns a formatted string AM', () => {
        const date = '2021-11-30T09:51:28.000Z';
        const formattedDate = gitUpdatedDateToString(date);
        expect(formattedDate).toBe('Nov 30, 2021 at 9:51:28 am');
    });

    it('returns a formatted string PM', () => {
        const date = '2021-11-30T14:51:28.000Z';
        const formattedDate = gitUpdatedDateToString(date);
        expect(formattedDate).toBe('Nov 30, 2021 at 2:51:28 pm');
    });
});
