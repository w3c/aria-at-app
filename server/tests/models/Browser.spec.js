/* eslint-disable jest/valid-expect */
const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const { expect, match } = require('./_modelsTestHelper');

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
            // Model.associate({ BrowserVersion });
            Model.hasMany(BrowserVersionModel, BROWSER_VERSION_ASSOCIATION);
        });

        it('defined a hasMany association with BrowserVersion', () => {
            // A3
            expect(Model.hasMany).to.have.been.calledWith(
                BrowserVersionModel,
                match(BROWSER_VERSION_ASSOCIATION)
            );
        });
    });
});
