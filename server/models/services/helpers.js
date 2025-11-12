const {
  At,
  Assertion,
  AtVersion,
  Browser,
  BrowserVersion,
  CollectionJob,
  CollectionJobTestStatus,
  NegativeSideEffect,
  ReviewerStatus,
  Role,
  TestPlan,
  TestPlanReport,
  TestPlanRun,
  TestPlanVersion,
  UpdateEvent,
  User,
  UserAts,
  UserRoles,
  Vendor
} = require('../index');

/**
 * Use to retrieve all the attributes defined for a Sequelize model
 * @param {Model} model - Sequelize model
 * @returns {string[]}
 */
const getSequelizeModelAttributes = model => {
  if (!model) throw new Error('Model not defined');

  return Object.keys(model.rawAttributes).map(key => key);
};

module.exports = {
  getSequelizeModelAttributes,
  ASSERTION_ATTRIBUTES: getSequelizeModelAttributes(Assertion),
  AT_ATTRIBUTES: getSequelizeModelAttributes(At),
  AT_VERSION_ATTRIBUTES: getSequelizeModelAttributes(AtVersion),
  EVENT_ATTRIBUTES: getSequelizeModelAttributes(UpdateEvent),
  BROWSER_ATTRIBUTES: getSequelizeModelAttributes(Browser),
  BROWSER_VERSION_ATTRIBUTES: getSequelizeModelAttributes(BrowserVersion),
  COLLECTION_JOB_ATTRIBUTES: getSequelizeModelAttributes(CollectionJob),
  COLLECTION_JOB_TEST_STATUS_ATTRIBUTES: getSequelizeModelAttributes(
    CollectionJobTestStatus
  ),
  NEGATIVE_SIDE_EFFECT_ATTRIBUTES:
    getSequelizeModelAttributes(NegativeSideEffect),
  REVIEWER_STATUS_ATTRIBUTES: getSequelizeModelAttributes(ReviewerStatus),
  ROLE_ATTRIBUTES: getSequelizeModelAttributes(Role),
  TEST_PLAN_ATTRIBUTES: getSequelizeModelAttributes(TestPlan),
  TEST_PLAN_REPORT_ATTRIBUTES: getSequelizeModelAttributes(TestPlanReport),
  TEST_PLAN_RUN_ATTRIBUTES: getSequelizeModelAttributes(TestPlanRun),
  TEST_PLAN_VERSION_ATTRIBUTES: getSequelizeModelAttributes(TestPlanVersion),
  USER_ATTRIBUTES: getSequelizeModelAttributes(User),
  USER_ROLES_ATTRIBUTES: getSequelizeModelAttributes(UserRoles),
  USER_ATS_ATTRIBUTES: getSequelizeModelAttributes(UserAts),
  VENDOR_ATTRIBUTES: getSequelizeModelAttributes(Vendor)
};
