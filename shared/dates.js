// TODO: momentjs is no longer supported. Replace with another date utility/practice. See https://momentjs.com/docs/#/-project-status/.
const moment = require('moment');

const convertDateToString = (date, format = 'DD-MM-YYYY', { locale } = {}) => {
  if (!date) return '';
  if (locale) setLocale(locale);
  return moment.utc(date).format(format);
};

const convertStringToDate = (date, format = 'DD-MM-YYYY', { locale } = {}) => {
  if (locale) setLocale(locale);
  return moment.utc(date, format).toDate();
};

const convertStringFormatToAnotherFormat = (
  date,
  fromFormat = 'DD-MM-YYYY',
  toFormat = 'MM-DD-YYYY',
  { locale } = {}
) => {
  if (locale) setLocale(locale);
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

const setLocale = (locale = 'en') => moment.locale(locale);

module.exports = {
  convertDateToString,
  convertStringToDate,
  convertStringFormatToAnotherFormat,
  isValidDate,
  isAfterYear,
  checkDaysBetweenDates
};
