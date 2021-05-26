const listOfATNames = require('../../tests/mock-data/listOfATs.json');

const ATService = {
    getATs() {
        return listOfATNames.atsDB;
    }
};

module.exports = ATService;
