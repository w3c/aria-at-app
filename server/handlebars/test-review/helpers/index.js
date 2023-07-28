module.exports = {
    arrayLength: function (array) {
        if (!array) return 0;
        if (!array.length) return 0;
        return array.length;
    },
    formatArrayJoinSeparator: function(array, separator) {
        if (!array) return '';
        if (!array.length) return '';
        return array.join(separator);
    }
};
