let atsData = require('../../tests/mock-data/listOfATs.json');

const ATModel = {
    ats: atsData.atsDB,
    findAll() {
        return this.ats;
    }
};

module.exports = {
    ATModel
};
