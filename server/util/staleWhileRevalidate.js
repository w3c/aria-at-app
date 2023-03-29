const NodeCache = require('node-cache');

const cache = new NodeCache({
    checkperiod: 0, // Caches forever until cleared (or server restarts)
    useClones: false // Does not make copies of data
});

/**
 * A good compromise caching solution which is extremely fast because it
 * immediately serves stale data, but also avoids aggressive caching which is
 * nearly impossible to debug (where you have to wait an hour or longer before
 * seeing the latest data appear).
 *
 * @param {Function} expensiveFunction A function which loads
 * expensive-to-calculate data.
 * @param {*} options
 * @param {Boolean} options.getCacheKeyFromArguments An optional function that
 * receives the arguments passed to the expensiveFunction and returns a string
 * which will be used to correlate equivalent results. If this key matches the
 * key from a previous run, its existing stale data will be returned. If no
 * function is provided, a single key will be used for all results.
 * @param {Boolean} options.millisecondsUntilStale How many milliseconds before
 * data is considered stale. To keep the benefits of stale-while-revalidate
 * caching, it's probably a good idea to keep this value low, no more than 30
 * seconds or a minute. Optional and defaults to 0.
 * @returns {Function} A version of the expensiveFunction which includes
 * stale-while-revalidate caching.
 */
const staleWhileRevalidate = (
    expensiveFunction,
    { getCacheKeyFromArguments, millisecondsUntilStale = 0 } = {}
) => {
    // Allows the same cache key to be reused for different
    // staleWhileRevalidate instances
    const randomString = Math.random().toString().substr(2, 10);

    return async (...args) => {
        let cacheKey = getCacheKeyFromArguments?.(...args) ?? '' + randomString;

        const { existingData, isLoading, loadingPromise, timestamp } =
            cache.get(cacheKey) ?? {};

        if (existingData) {
            // Immediately return the existing data, and then refresh the data
            // in the background. Only make one simultaneous query per cacheKey

            const isStale =
                Number(new Date()) - timestamp > millisecondsUntilStale;

            if (isLoading || !isStale) {
                return existingData;
            }

            const newActivePromise = expensiveFunction(...args);

            cache.set(cacheKey, {
                existingData, // Keep stale data in place
                isLoading: true,
                loadingPromise: newActivePromise,
                timestamp
            });

            // Occurs in background
            newActivePromise.then(data => {
                cache.set(cacheKey, {
                    existingData: data,
                    isLoading: false,
                    loadingPromise: null,
                    timestamp: Number(new Date())
                });
            });

            return existingData;
        }

        if (isLoading) {
            // When no data is ready, but a request is already in progress,
            // prevent multiple requests for the same data
            return loadingPromise;
        }

        // Initial load

        const newActivePromise = expensiveFunction(...args);

        cache.set(cacheKey, {
            existingData: null,
            isLoading: true,
            loadingPromise: newActivePromise,
            timestamp: null
        });

        const data = await newActivePromise;

        cache.set(cacheKey, {
            existingData: data,
            isLoading: false,
            loadingPromise: null,
            timestamp: Number(new Date())
        });

        return data;
    };
};

module.exports = staleWhileRevalidate;
