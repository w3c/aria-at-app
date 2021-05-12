const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

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
            Model.belongsTo(AtModel, AT_ASSOCIATION);
        });

        it('defined a belongsTo association with At', () => {
            // A3
            expect(Model.belongsTo).toHaveBeenCalledWith(
                AtModel,
                expect.objectContaining(Model.AT_ASSOCIATION)
            );
        });
    });
});
