module.exports = {
    dataEmpty: function (object) {
        return object.length === 0;
    },

    isCandidate: function (value) {
        return value === 'CANDIDATE';
    },
    getMustSupportData: function (object) {
        return Math.trunc(
            (object.metrics.mustAssertionsPassedCount /
                object.metrics.mustAssertionsCount) *
                100
        );
    },
    isMustAssertionPriority: function (object) {
        return object.metrics.mustAssertionsCount > 0;
    },
    isShouldAssertionPriority: function (object) {
        return object.metrics.shouldAssertionsCount > 0;
    },
    getShouldSupportData: function (object) {
        return Math.trunc(
            (object.metrics.shouldAssertionsPassedCount /
                object.metrics.shouldAssertionsCount) *
                100
        );
    }
};
