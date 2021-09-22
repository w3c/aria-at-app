const {
    isPlainObject,
    difference,
    differenceBy,
    intersection,
    intersectionBy
} = require('lodash');

/**
 * Merges the deeply nested properties of two objects and/or arrays. When
 * merging arrays of objects, it will use the "ID" field to identify which items
 * exist in both arrays.
 * @param {*} left
 * @param {*} right
 * @param {*} options
 * @param {function} options.identifyArrayItem - Given an array item, returns a
 * string identifying that array item.
 * @param {boolean} options.removeArrayItems - Whether array items not present
 * in the right object should be removed.
 */
const deepCustomMerge = (
    left,
    right,
    { identifyArrayItem: arrId, removeArrayItems = false } = {}
) => {
    const throwUnmergeable = () => {
        throw new Error(
            'The merge could not be completed because the types of the ' +
                'two arguments do not match'
        );
    };

    const recurse = (leftPart, rightPart) => {
        if (isPlainObject(leftPart)) {
            if (!isPlainObject(rightPart)) {
                throwUnmergeable();
            }
            const combined = {};
            const leftKeys = Object.keys(leftPart);
            const rightKeys = Object.keys(rightPart);
            const leftOnlyKeys = difference(leftKeys, rightKeys);
            const rightOnlyKeys = difference(rightKeys, leftKeys);
            const intersectionKeys = intersection(leftKeys, rightKeys);
            leftOnlyKeys.forEach(key => {
                combined[key] = leftPart[key];
            });
            intersectionKeys.forEach(key => {
                combined[key] = recurse(leftPart[key], rightPart[key]);
            });
            rightOnlyKeys.forEach(key => {
                combined[key] = rightPart[key];
            });
            return combined;
        }
        if (Array.isArray(leftPart)) {
            if (!Array.isArray(rightPart)) {
                throwUnmergeable();
            }
            const leftDifference = differenceBy(leftPart, rightPart, arrId);
            const rightDifference = differenceBy(rightPart, leftPart, arrId);
            const leftIntersection = intersectionBy(leftPart, rightPart, arrId);
            const intersection = leftIntersection.map(leftItem => {
                const rightItem = rightPart.find(
                    each => arrId(each) === arrId(leftItem)
                );
                return recurse(leftItem, rightItem);
            });

            if (removeArrayItems) {
                return [...intersection, ...rightDifference];
            }
            return [...leftDifference, ...intersection, ...rightDifference];
        }
        return rightPart ?? leftPart;
    };

    return recurse(left, right);
};

module.exports = deepCustomMerge;
