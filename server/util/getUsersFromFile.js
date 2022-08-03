const path = require('path');
const fs = require('fs/promises');

const getUsersFromFile = async file => {
    const roleGroupPath = path.join(__dirname, file);
    const roleGroupTxt = await fs.readFile(roleGroupPath, { encoding: 'utf8' });
    const linesRaw = roleGroupTxt.split('\n');
    const noComments = linesRaw.filter(line => line.substr(0, 1) !== '#');
    const noEmpties = noComments.filter(line => line.trim().length > 0);
    const testers = noEmpties.map(line => line.trim());
    return testers;
};

module.exports = getUsersFromFile;
