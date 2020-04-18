let atsData = require('../../tests/mock-data/listOfATs.json');

const ATModel = {
    ats: atsData.atsDB,
    findAll(filter) {
        let { attributes } = filter;
        return this.ats.map(at => {
            let obj = {};
            attributes.forEach(a => {
                obj[a] = at[a];
            });
            return obj;
        });
    }
};

module.exports = {
    ATModel
};
