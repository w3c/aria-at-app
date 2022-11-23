const {
    getTestPlanReports
} = require('../models/services/TestPlanReportService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES
} = require('../models/services/helpers');

const testPlanReportsResolver = async (
    _,
    { statuses, testPlanVersionId, atId },
    context,
    info
) => {
    const where = {};
    if (statuses) where.status = statuses;
    if (testPlanVersionId) where.testPlanVersionId = testPlanVersionId;
    if (atId) where.atId = atId;

    const {
        raw: testPlanReportRawAttributes,
        attributes: testPlanReportAttributes
    } = retrieveAttributes('testPlanReport', TEST_PLAN_REPORT_ATTRIBUTES, info);

    const { attributes: testPlanRunAttributes } = retrieveAttributes(
        'draftTestPlanRuns',
        TEST_PLAN_RUN_ATTRIBUTES,
        info,
        true
    );

    const { attributes: testPlanVersionAttributes } = retrieveAttributes(
        'testPlanVersion',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info,
        true
    );

    if (testPlanReportRawAttributes.includes('runnableTests'))
        testPlanVersionAttributes.push('tests');

    if (testPlanReportRawAttributes.includes('conflictsLength'))
        testPlanReportAttributes.push('metrics');

    return getTestPlanReports(
        null,
        where,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        null,
        null,
        null,
        null,
        null,
        { order: [['createdAt', 'desc']] }
    );
};

module.exports = testPlanReportsResolver;
