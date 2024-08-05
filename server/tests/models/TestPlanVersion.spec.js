const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanVersionModel = require('../../models/TestPlanVersion');
const TestPlanReportModel = require('../../models/TestPlanReport');

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
      'phase',
      'directory',
      'gitSha',
      'gitMessage',
      'testPageUrl',
      'updatedAt',
      'versionString',
      'metadata',
      'tests'
    ].forEach(checkPropertyExists(modelInstance));
  });

  describe('associations', () => {
    // A1
    const TEST_PLAN_REPORT_ASSOCIATION = { as: 'testPlanReports' };

    beforeAll(() => {
      Model.hasMany(TestPlanReportModel, TEST_PLAN_REPORT_ASSOCIATION);
    });

    it('defined a hasMany association with TestPlanReport', () => {
      expect(Model.hasMany).toHaveBeenCalledWith(
        TestPlanReportModel,
        expect.objectContaining(Model.TEST_PLAN_REPORT_ASSOCIATION)
      );
    });
  });
});
