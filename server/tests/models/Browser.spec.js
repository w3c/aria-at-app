const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const BrowserModel = require('../../models/Browser');
const BrowserVersionModel = require('../../models/BrowserVersion');
const AtModel = require('../../models/At');

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
        const BROWSER_VERSION_ASSOCIATION = { as: 'browserVersions' };
        const AT_ASSOCIATION = {
            through: 'AtBrowsers',
            as: 'ats'
        };

        // A2
        beforeAll(() => {
            Model.hasMany(BrowserVersionModel, BROWSER_VERSION_ASSOCIATION);
            Model.hasMany(AtModel, AT_ASSOCIATION);
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
