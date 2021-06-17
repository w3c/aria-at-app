const path = require('path');
const fs = require('fs/promises');

const getTesters = async () => {
    const testersPath = path.join(__dirname, '../../testers.txt');
    const testersTxt = await fs.readFile(testersPath, { encoding: 'utf8' });
    const linesRaw = testersTxt.split('\n');
    const noComments = linesRaw.filter(line => line.substr(0, 1) !== '#');
    const noEmpties = noComments.filter(line => line.trim().length > 0);
    const testers = noEmpties.map(line => line.trim());
    return testers;
};

module.exports = getTesters;
