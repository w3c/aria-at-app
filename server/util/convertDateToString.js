const moment = require('moment');

const convertDateToString = (date, format = 'DD-MM-YYYY') => {
  if (!date) return '';
  return moment.utc(date).format(format);
};

module.exports = convertDateToString;
