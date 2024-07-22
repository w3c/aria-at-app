const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers');

const TestPlanModel = require('../../models/TestPlan');
const TestPlanVersionModel = require('../../models/TestPlanVersion');
const TestPlanReportModel = require('../../models/TestPlanReport');

describe('TestPlanVersionModel', () => {
  // A1
  const Model = TestPlanModel(sequelize, dataTypes);
  const modelInstance = new Model();

  // A2
  checkModelName(Model)('TestPlan');

  describe('properties', () => {
    // A3
    ['title', 'directory'].forEach(checkPropertyExists(modelInstance));
  });

  describe('associations', () => {
    // A1
    const TEST_PLAN_VERSION_ASSOCIATION = { as: 'testPlanVersions' };
    const TEST_PLAN_REPORT_ASSOCIATION = { as: 'testPlanReports' };

    beforeAll(() => {
      Model.hasMany(TestPlanVersionModel, TEST_PLAN_VERSION_ASSOCIATION);
      Model.hasMany(TestPlanReportModel, TEST_PLAN_REPORT_ASSOCIATION);
    });

    it('defined a hasMany association with TestPlanVersion', () => {
      expect(Model.hasMany).toHaveBeenCalledWith(
        TestPlanVersionModel,
        expect.objectContaining(Model.TEST_PLAN_VERSION_ASSOCIATION)
      );
    });

    it('defined a hasMany association with TestPlanReport', () => {
      expect(Model.hasMany).toHaveBeenCalledWith(
        TestPlanReportModel,
        expect.objectContaining(Model.TEST_PLAN_REPORT_ASSOCIATION)
      );
    });
  });
});
