const getUsersFromFile = async file => {
    const response = await fetch(
        // This needs to be switched back the commented out path.
        // `https://raw.githubusercontent.com/w3c/aria-at-app/main/${file}`
        `https://raw.githubusercontent.com/w3c/aria-at-app/modify-tester-vender-access/${file}`
    );
    const roleGroupTxt = await response.text();
    const linesRaw = roleGroupTxt.split('\n');
    const noComments = linesRaw.filter(line => line.substr(0, 1) !== '#');
    const noEmpties = noComments.filter(line => line.trim().length > 0);
    const testers = noEmpties.map(line => line.trim());
    return testers;
};

module.exports = getUsersFromFile;
