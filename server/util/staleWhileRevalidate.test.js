const staleWhileRevalidate = require('./staleWhileRevalidate');

const waitMs = async ms => {
    await new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

describe('staleWhileRevalidate', () => {
    it('immediately serves data and refreshes in the background', async () => {
        const timeToCalculate = 20;
        const timeUntilStale = 20;
        const buffer = 10;

        const getCounter = () => {
            let count = 0;
            return async () => {
                await waitMs(timeToCalculate);
                count += 1;
                return `count is ${count}`;
            };
        };

        const getCount = getCounter();

        const getCountCached = staleWhileRevalidate({
            expensiveFunction: getCount,
            millisecondsUntilStale: timeUntilStale
        });

        const initialCall = await getCountCached();

        const staleCall = await getCountCached();

        await waitMs(timeUntilStale + buffer);

        const refreshTriggeringCall = await getCountCached();
        await waitMs(timeToCalculate + buffer);
        const refreshShowingCall = await getCountCached();

        await waitMs(timeUntilStale + buffer);

        const simultaneous1Promise = getCountCached();
        const simultaneous2Promise = getCountCached();
        const [simultaneous1, simultaneous2] = await Promise.all([
            simultaneous1Promise,
            simultaneous2Promise
        ]);
        await waitMs(timeUntilStale + buffer);
        const simultaneousAfter = await getCountCached();

        expect(initialCall).toBe('count is 1');
        expect(staleCall).toBe('count is 1');
        expect(refreshTriggeringCall).toBe('count is 1');
        expect(refreshShowingCall).toBe('count is 2');
        expect(simultaneous1).toBe('count is 2');
        expect(simultaneous2).toBe('count is 2');
        expect(simultaneousAfter).toBe('count is 3');
    });

    // TODO: finish testing this
});
