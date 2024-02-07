// const path = require('path');
// const fs = require('fs/promises');

const getUsersFromFile = async file => {
    // const roleGroupPath = path.join(__dirname, file);
    // const roleGroupTxt = await fs.readFile(roleGroupPath, { encoding: 'utf8' });
    const response = await fetch(
        `https://raw.githubusercontent.com/w3c/aria-at-app/main/${file}`
    );
    const roleGroupTxt = await response.text();
    const linesRaw = roleGroupTxt.split('\n');
    const noComments = linesRaw.filter(line => line.substr(0, 1) !== '#');
    const noEmpties = noComments.filter(line => line.trim().length > 0);
    const testers = noEmpties.map(line => line.trim());
    return testers;
};

/* TODO:
    ✅1) Make the function accept just "vendors.txt" or "testers.txt" instead of a full path
    
    2) Figure out how to test this
        --HINT: Change line 8 to be on a branch that is easier to change

    3) Add "admins.txt" file. Account for the fact that everyone is not an admin
     in production -- developers.

    4) Remove all code related to github teams 
*/
getUsersFromFile('vendors').then(console.log);
module.exports = getUsersFromFile;
