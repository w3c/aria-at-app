const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
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
        ['at', 'version'].forEach(checkPropertyExists(modelInstance));
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
            expect(Model.hasOne).toHaveBeenCalledWith(
                AtModel,
                expect.objectContaining(Model.AT_ASSOCIATION)
            );
        });
    });
});
