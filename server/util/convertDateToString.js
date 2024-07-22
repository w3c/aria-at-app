const moment = require('moment');

const convertDateToString = (date, format = 'DD-MM-YYYY') => {
  if (!date) return '';
  return moment(date).format(format);
};

module.exports = convertDateToString;
