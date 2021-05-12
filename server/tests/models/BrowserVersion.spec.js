const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const BrowserVersionModel = require('../../models/BrowserVersion');
const BrowserModel = require('../../models/Browser');

describe('BrowserVersionModel', () => {
    // A1
    const Model = BrowserVersionModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('BrowserVersion');

    describe('properties', () => {
        // A3
        ['browser', 'version'].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const BROWSER_ASSOCIATION = { foreignKey: 'browser' };

        // A2
        beforeEach(() => {
            Model.belongsTo(BrowserModel, BROWSER_ASSOCIATION);
        });

        it('defined a belongsTo association with At', () => {
            // A3
            expect(Model.belongsTo).toHaveBeenCalledWith(
                BrowserModel,
                expect.objectContaining(Model.BROWSER_ASSOCIATION)
            );
        });
    });
});
