const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const BrowserModel = require('../../models/Browser');
const BrowserVersionModel = require('../../models/BrowserVersion');

describe('BrowserModel', () => {
    // A1
    const Model = BrowserModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('Browser');

    describe('properties', () => {
        // A3
        ['name'].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const BROWSER_VERSION_ASSOCIATION = { as: 'versions' };

        // A2
        beforeEach(() => {
            Model.hasMany(BrowserVersionModel, BROWSER_VERSION_ASSOCIATION);
        });

        it('defined a hasMany association with BrowserVersion', () => {
            // A3
            expect(Model.hasMany).toHaveBeenCalledWith(
                BrowserVersionModel,
                expect.objectContaining(Model.BROWSER_VERSION_ASSOCIATION)
            );
        });
    });
});
