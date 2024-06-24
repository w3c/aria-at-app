const staleWhileRevalidate = require('./staleWhileRevalidate');

describe('staleWhileRevalidate', () => {
  const timeToCalculate = 80;
  const timeUntilStale = 80;
  const buffer = 40;

  const waitMs = async ms => {
    await new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  const getCounter = () => {
    let count = 0;
    return async () => {
      await waitMs(timeToCalculate);
      count += 1;
      return `count is ${count}`;
    };
  };

  it('immediately serves data and refreshes in the background', async () => {
    const getCount = getCounter();

    const getCountCached = staleWhileRevalidate(getCount, {
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

  it('only loads once even when there are multiple immediate requests', async () => {
    const getCount = getCounter();

    const getCountCached = staleWhileRevalidate(getCount, {
      millisecondsUntilStale: timeUntilStale
    });

    const initial1Promise = getCountCached();
    const initial2Promise = getCountCached();
    const [initial1, initial2] = await Promise.all([
      initial1Promise,
      initial2Promise
    ]);

    const afterInitial = await getCountCached();

    expect(initial1).toBe('count is 1');
    expect(initial2).toBe('count is 1');
    expect(afterInitial).toBe('count is 1');
  });

  it('separates caching for different instances', async () => {
    const getCount1 = getCounter();
    const getCountCached1 = staleWhileRevalidate(getCount1, {
      millisecondsUntilStale: timeUntilStale
    });

    const getCount2 = getCounter();
    const getCountCached2 = staleWhileRevalidate(getCount2, {
      millisecondsUntilStale: timeUntilStale
    });

    await getCountCached1();
    await waitMs(timeUntilStale + buffer);
    await getCountCached1();
    await waitMs(timeUntilStale + buffer);
    const count1 = await getCountCached1();

    await getCountCached2();
    await waitMs(timeUntilStale + buffer);
    await getCountCached2();
    await waitMs(timeUntilStale + buffer);
    const count2 = await getCountCached2();

    expect(count1).toBe('count is 2');
    expect(count2).toBe('count is 2');
  });

  it('supports caching based on function arguments', async () => {
    const getLetterCounter = () => {
      let letterCounts = {};
      return async letter => {
        await waitMs(timeToCalculate);
        if (letterCounts[letter] === undefined) {
          letterCounts[letter] = 0;
        }
        letterCounts[letter] += 1;
        return `${letter} is ${letterCounts[letter]}`;
      };
    };

    const countLetters = getLetterCounter();
    const countLettersCached = staleWhileRevalidate(countLetters, {
      getCacheKeyFromArguments: letter => letter,
      millisecondsUntilStale: timeUntilStale
    });

    await Promise.all([countLettersCached('A'), countLettersCached('B')]);
    await waitMs(timeUntilStale + buffer);
    await countLettersCached('A');
    await waitMs(timeToCalculate + timeUntilStale + buffer);
    await countLettersCached('A');
    await waitMs(timeToCalculate + timeUntilStale + buffer);
    const countA = await countLettersCached('A');
    await countLettersCached('B');
    await waitMs(timeUntilStale + buffer);
    const countB = await countLettersCached('B');

    expect(countA).toBe('A is 3');
    expect(countB).toBe('B is 2');
  });
});
