module.exports = {
    isBrowser: function(a, b) {
        return a === b;
    },
    isInAllBrowsers: function(value, object) {
        return object.allBrowsers.has(value);
    },
    isCandidate: function(value) {
        return value === 'CANDIDATE';
    }
};
