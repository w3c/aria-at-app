let map = {};

module.exports = {
    isBrowser: function (a, b) {
        return a === b;
    },
    isInAllBrowsers: function (value, object) {
        return object.allBrowsers.includes(value);
    },
    isCandidate: function (value) {
        return value === 'CANDIDATE';
    },
    getAtVersion: function (object, key) {
        return object.allAtVersionsByAt[key].name;
    },
    elementExists: function (parentObject, childObject, at, key, last) {
        const atBrowsers = childObject.map(o => o.browser.name);

        if (!map[parentObject.pattern]) {
            map[parentObject.pattern] = {};
        }

        if (!(at in map[parentObject.pattern])) {
            map[parentObject.pattern][at] = {};
        }

        const moreThanOneColumn = Object.values(childObject).length > 1;

        const conditional =
            moreThanOneColumn &&
            (key in map[parentObject.pattern][at] || atBrowsers.includes(key));

        // Cache columns that don't have data
        if (
            !(key in map[parentObject.pattern][at]) &&
            !atBrowsers.includes(key)
        ) {
            map[parentObject.pattern][at][key] = true;
        }

        // Don't write to the Safari column unless it's the last element
        if (!last && key === 'Safari' && !atBrowsers.includes(key)) {
            return true;
        } else if (last && key === 'Safari' && !atBrowsers.includes(key)) {
            return false;
        }

        return conditional;
    },
    resetMap: function () {
        map = {};
        return;
    }
};
