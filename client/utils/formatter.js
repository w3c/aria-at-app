import dayjs from 'dayjs';

/**
 * Transforms the provided string by capitalizing the first letter of each word.
 *
 * @example 'hello world' -> 'Hello World'
 *
 * @param {string} sentence - string to be transformed
 * @param {object} options - additional options for transforming the string
 * @param {string} [options.splitChar=] - string to split the provided string against if required
 * @param {string} [options.joinChar=] - string to rejoin the capitalized words into a string with
 * @returns {string} - transformed string
 */
export const capitalizeEachWord = (
    sentence,
    { splitChar = ' ', joinChar = ' ' }
) => {
    const words = sentence.toLowerCase().split(splitChar);
    for (let i = 0; i < words.length; i++)
        words[i] = `${words[i][0].toUpperCase() + words[i].substr(1)}`;

    return words.join(joinChar);
};

export const convertDateToString = (date, format = 'DD-MM-YYYY') => {
    if (!date) return '';
    return dayjs(date).format(format);
};

export const convertStringToDate = (date, format = 'DD-MM-YYYY') => {
    return dayjs(date, format).toDate();
};

export const convertStringFormatToAnotherFormat = (
    date,
    fromFormat = 'DD-MM-YYYY',
    toFormat = 'MM-DD-YYYY'
) => {
    return dayjs(date, fromFormat).format(toFormat);
};

export const isValidDate = (date, format = 'DD-MM-YYYY') => {
    return dayjs(date, format).isValid();
};
