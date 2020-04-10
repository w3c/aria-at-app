const listOfATNames = require('../../tests/mock-data/listOfATs.json');

const ATService = {
    getATNames() {
        return listOfATNames.atNames;
    }
}

module.exports = ATService;