const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const AtModel = require('../../models/At');
const AtVersionModel = require('../../models/AtVersion');
const AtModeModel = require('../../models/AtMode');
const BrowserModel = require('../../models/Browser');

describe('AtModel', () => {
    // A1
    const Model = AtModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('At');

    describe('properties', () => {
        // A3
        ['name'].forEach(checkPropertyExists(modelInstance));
    });

    describe('associations', () => {
        // A1
        const AT_VERSION_ASSOCIATION = { as: 'atVersions' };
        const AT_MODE_ASSOCIATION = { as: 'modes' };
        const BROWSER_ASSOCIATION = { through: 'AtBrowsers', as: 'browsers' };

        // A2
        beforeAll(() => {
            Model.hasMany(AtVersionModel, AT_VERSION_ASSOCIATION);
            Model.hasMany(AtModeModel, AT_MODE_ASSOCIATION);
            Model.hasMany(BrowserModel, BROWSER_ASSOCIATION);
        });

        it('defined a hasMany association with AtVersion', () => {
            // A3
            expect(Model.hasMany).toHaveBeenCalledWith(
                AtVersionModel,
                expect.objectContaining(Model.AT_VERSION_ASSOCIATION)
            );
        });

        it('defined a hasMany association with AtMode', () => {
            // A3
            expect(Model.hasMany).toHaveBeenCalledWith(
                AtModeModel,
                expect.objectContaining(Model.AT_MODE_ASSOCIATION)
            );
        });
    });
});
