const lc = (pattern, string) => string.replace(pattern, pattern.toLowerCase());
const timeZone = 'UTC';
const options = { month: 'short' };

export const gitUpdatedDateToString = (dateString, locale = 'default') => {
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
