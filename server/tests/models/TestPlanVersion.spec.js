const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanVersionModel = require('../../models/TestPlanVersion');

describe('TestPlanVersionModel', () => {
    // A1
    const Model = TestPlanVersionModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('TestPlanVersion');

    describe('properties', () => {
        // A3
        [
            'title',
            'status',
            'gitSha',
            'gitMessage',
            'exampleUrl',
            'updatedAt',
            'parsed'
        ].forEach(checkPropertyExists(modelInstance));
    });
});
