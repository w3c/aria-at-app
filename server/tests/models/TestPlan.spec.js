const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanModel = require('../../models/TestPlan');

describe('TestPlanModel', () => {
    // A1
    const Model = TestPlanModel(sequelize, dataTypes);
    const modelInstance = new Model();

    // A2
    checkModelName(Model)('TestPlan');

    describe('properties', () => {
        // A3
        [
            'title',
            'publishStatus',
            'revision',
            'sourceGitCommit',
            'exampleUrl'
        ].forEach(checkPropertyExists(modelInstance));
    });
});
