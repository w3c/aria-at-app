export const calculateDateInterval = (startDate, endDate) => {
    let intervalUnit = '';
    let intervalNumber = 0;
    const dateDifferenceMilliseconds = endDate - startDate;
    const timeIntervalInHours = Math.floor(
        dateDifferenceMilliseconds / (1000 * 60 * 60)
    );
    const timeIntervalInDays = Math.floor(timeIntervalInHours / 24);

    if (timeIntervalInHours < 24) {
        intervalNumber = timeIntervalInHours;
        intervalUnit = 'hour';
    } else {
        intervalUnit = 'day';
        intervalNumber = timeIntervalInDays;
    }

    if (intervalNumber > 1) {
        intervalUnit = `${intervalUnit}s`;
    }

    if (timeIntervalInDays >= 30) {
        const dateString = `${startDate.toLocaleString('default', {
            month: 'short'
        })} ${startDate.getDate()}, ${startDate.getFullYear()}`;
        return dateString;
    }

    return `${intervalNumber} ${intervalUnit} ago`;
};
