const chai = require('chai');
const sinonChai = require('sinon-chai');
const { match, stub, resetHistory } = require('sinon');

chai.use(sinonChai); // required for sinon's spies to be used when checking Sequelize Model Associations

module.exports = { match, stub, resetHistory, expect: chai.expect };
