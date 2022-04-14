const findOrCreateAtVersion = require('./findOrCreateAtVersionResolver');
const editAtVersion = require('./editAtVersionResolver');
const deleteAtVersion = require('./deleteAtVersionResolver');

module.exports = {
    findOrCreateAtVersion,
    editAtVersion,
    deleteAtVersion
};
