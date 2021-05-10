const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const { expect, match } = require('./_modelsTestHelper');

const AtModeModel = require('../../models/AtMode');
const AtModel = require('../../models/At');

describe('AtModeModel', () => {
    // A1
    const Model = AtModeModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('AtMode');

    describe('properties', () => {
        // A3
        ['at', 'name'].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const AT_ASSOCIATION = { foreignKey: 'at' };

        // A2
        beforeEach(() => {
            // Model.associate({ AtVersion, AtMode });
            Model.belongsTo(AtModel, AT_ASSOCIATION);
        });

        it('defined a hasOne association with At', () => {
            // A3
            expect(Model.hasOne).to.have.been.calledWith(
                AtModel,
                match(AT_ASSOCIATION)
            );
        });
    });
});
