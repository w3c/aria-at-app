import { calculateDateInterval } from './dateInterval';

describe('dateInterval', () => {
    it('returns 1 hour', () => {
        const startDate = new Date(2022, 1, 10, 11);
        const endDate = new Date(2022, 1, 10, 12);
        const dateIntervalString = calculateDateInterval(startDate, endDate);
        expect(dateIntervalString).toBe('1 hour ago');
    });

    it('returns more than one hour', () => {
        const startDate = new Date(2022, 1, 10, 11);
        const endDate = new Date(2022, 1, 10, 14);
        const dateIntervalString = calculateDateInterval(startDate, endDate);
        expect(dateIntervalString).toBe('3 hours ago');
    });

    it('returns 1 day', () => {
        const startDate = new Date(2022, 1, 10);
        const endDate = new Date(2022, 1, 11);
        const dateIntervalString = calculateDateInterval(startDate, endDate);
        expect(dateIntervalString).toBe('1 day ago');
    });

    it('returns more than one day', () => {
        const startDate = new Date(2022, 0, 1);
        const endDate = new Date(2022, 0, 4);
        const dateIntervalString = calculateDateInterval(startDate, endDate);
        expect(dateIntervalString).toBe('3 days ago');
    });

    it('returns month, day, and year of start date', () => {
        const startDate = new Date(2022, 0, 1);
        const endDate = new Date(2022, 1, 2);
        const dateIntervalString = calculateDateInterval(startDate, endDate);
        expect(dateIntervalString).toBe('Jan 1, 2022');
    });
});
