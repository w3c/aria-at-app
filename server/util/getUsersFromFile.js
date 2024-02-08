// const path = require('path');
// const fs = require('fs/promises');

const getUsersFromFile = async file => {
    // const roleGroupPath = path.join(__dirname, file);
    // const roleGroupTxt = await fs.readFile(roleGroupPath, { encoding: 'utf8' });
    const response = await fetch(
        `https://raw.githubusercontent.com/w3c/aria-at-app/modify-tester-vender-access/${file}`
    );
    const roleGroupTxt = await response.text();
    const linesRaw = roleGroupTxt.split('\n');
    const noComments = linesRaw.filter(line => line.substr(0, 1) !== '#');
    const noEmpties = noComments.filter(line => line.trim().length > 0);
    const testers = noEmpties.map(line => line.trim());
    return testers;
};

/* TODO:
    ✅ 1) Make the function accept just "vendors.txt" or "testers.txt" instead of a full path
    
    ✅ 2) Figure out how to test this
        --HINT: Change line 8 to be on a branch that is easier to change

    ✅ 3) Add "admins.txt" file. Account for the fact that everyone is not an admin
       in production -- developers.

    ✅ 4) Test that admins is working by adding my name to the list

    5) Remove all code related to github teams
        -- Look at stuff like this:
                The isMemberOfAdminTeam and all the functions it uses
                that is not being used anywhere else in the codebase
                and githubAccessToken

                //const isAdmin = await GithubService.isMemberOfAdminTeam({
                //     githubAccessToken,
                //     githubUsername
                // });

                Check to see if they are needed anywhere else to make the app work
        -- Remove these variable (dev.env file):
            GITHUB_TEAM_ORGANIZATION=w3c
            GITHUB_TEAM_QUERY="aria-at-app"
            GITHUB_TEAM_ADMIN="aria-at-app-development-admin"
*/
// getUsersFromFile('admins.txt').then(console.log);
module.exports = getUsersFromFile;
