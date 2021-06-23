export const capitalizeFirstLetterOfWords = (sentence, splitChar = ' ') => {
    const words = sentence.toLowerCase().split(splitChar);
    for (let i = 0; i < words.length; i++)
        words[i] = `${words[i][0].toUpperCase() + words[i].substr(1)}`;

    return words.join(splitChar);
};
