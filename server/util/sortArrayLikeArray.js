/**
 * Returns a sorted shallow copy of array1 which matches the order of array2. Array2 must include all items in array1 or the function will throw.
 * @param {*} array1 - The array to be sorted.
 * @param {*} array2 - The array to use for ordering.
 * @param {*} options
 * @param {function} options.identifyArrayItem - An optional function that takes an array1 or array2 item and returns a string or other value usable for comparing the two arrays.
 * @returns
 */
const sortArrayLikeArray = (
    array1,
    array2,
    { identifyArrayItem = null } = {}
) => {
    const finalArray = [];

    array2.forEach(array2Item => {
        array1.forEach(array1Item => {
            if (
                Object.is(
                    identifyArrayItem?.(array1Item) || array1Item,
                    identifyArrayItem?.(array2Item) || array2Item
                )
            ) {
                finalArray.push(array1Item);
            }
        });
    });

    if (finalArray.length !== array1.length) {
        throw new Error('Item or items in array1 do not exist in array2.');
    }

    return finalArray;
};

module.exports = sortArrayLikeArray;
