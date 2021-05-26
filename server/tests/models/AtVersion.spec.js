const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists,
} = require('sequelize-test-helpers');

const AtVersionModel = require('../../models/AtVersion');
const AtModel = require('../../models/At');

describe('AtVersionModel', () => {
    // A1
    const Model = AtVersionModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('AtVersion');

    describe('properties', () => {
        // A3
        ['atId', 'version'].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const AT_ASSOCIATION = { foreignKey: 'atId' };

        // A2
        beforeAll(() => {
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
