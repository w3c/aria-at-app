export const gitUpdatedDateToString = dateString => {
    const date = new Date(dateString);
    let formattedDateString = `${date.toLocaleString('default', {
        month: 'short'
    })} ${date.getDate()}, ${date.getFullYear()} at ${date.toLocaleTimeString(
        'default',
        { timeZone: 'UTC' }
    )}`;

    if (formattedDateString.includes('PM')) {
        return formattedDateString.replace('PM', 'pm');
    }

    if (formattedDateString.includes('AM')) {
        return formattedDateString.replace('AM', 'am');
    }
};
