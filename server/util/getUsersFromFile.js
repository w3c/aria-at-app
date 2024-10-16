const path = require('path');
const fs = require('fs/promises');

const getUsersFromFile = async file => {
  const isDeployed =
    process.env.ENVIRONMENT === 'sandbox' ||
    process.env.ENVIRONMENT === 'staging' ||
    process.env.ENVIRONMENT === 'production';

  let roleGroupTxt;
  if (isDeployed) {
    const response = await fetch(
      `https://raw.githubusercontent.com/w3c/aria-at-app/development/${file}`
    );
    roleGroupTxt = await response.text();
  } else {
    const filePath = path.join(__dirname, `../../${file}`);
    roleGroupTxt = await fs.readFile(filePath, { encoding: 'utf8' });
  }
  const linesRaw = roleGroupTxt.split('\n');
  const noComments = linesRaw.filter(line => line.substr(0, 1) !== '#');
  const noEmpties = noComments.filter(line => line.trim().length > 0);
  const testers = noEmpties.map(line => line.trim());
  return testers;
};

module.exports = getUsersFromFile;
