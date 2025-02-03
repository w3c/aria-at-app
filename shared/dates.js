const moment = require('moment');

const convertDateToString = (date, format = 'DD-MM-YYYY') => {
  if (!date) return '';
  return moment.utc(date).format(format);
};

const convertStringToDate = (date, format = 'DD-MM-YYYY') => {
  return moment.utc(date, format).toDate();
};

const convertStringFormatToAnotherFormat = (
  date,
  fromFormat = 'DD-MM-YYYY',
  toFormat = 'MM-DD-YYYY'
) => {
  return moment.utc(date, fromFormat).format(toFormat);
};

const isValidDate = (date, format = 'DD-MM-YYYY') => {
  return moment.utc(date, format).isValid();
};

const isAfterYear = (date, year, format = 'DD-MM-YYYY') => {
  return moment.utc(date, format).isAfter(moment.utc(`${year}-12-31`));
};

const checkDaysBetweenDates = (date, otherDate) => {
  const _date = moment.utc(date);
  const _otherDate = moment.utc(otherDate);
  const hours = _date.diff(_otherDate, 'hours');
  return Math.ceil(hours / 24);
};

const gitUpdatedDateToString = (dateString, locale = 'default') => {
  const lc = (pattern, string) =>
    string.replace(pattern, pattern.toLowerCase());
  const timeZone = 'UTC';
  const options = { month: 'short' };

  const date = new Date(dateString);
  const month = date.toLocaleString(locale, options);
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date
    .toLocaleTimeString(locale, { timeZone: timeZone })
    .replace(/\s/g, ' ');

  const timeStamp = `${month} ${day}, ${year} at ${time} ${timeZone}`;

  return lc('PM', lc('AM', timeStamp));
};

module.exports = {
  convertDateToString,
  convertStringToDate,
  convertStringFormatToAnotherFormat,
  isValidDate,
  isAfterYear,
  checkDaysBetweenDates,
  gitUpdatedDateToString
};
