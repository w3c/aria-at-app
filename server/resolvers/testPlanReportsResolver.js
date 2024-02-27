const {
    getTestPlanReports
} = require('../models/services.deprecated/TestPlanReportService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES
} = require('../models/services.deprecated/helpers');

const testPlanReportsResolver = async (
    _,
    {
        testPlanVersionPhases = [],
        testPlanVersionId,
        testPlanVersionIds,
        atId,
        isFinal
    },
    context,
    info
) => {
    const { transaction } = context;

    const where = {};
    if (testPlanVersionId) where.testPlanVersionId = testPlanVersionId;
    if (testPlanVersionIds) where.testPlanVersionId = testPlanVersionIds;
    if (atId) where.atId = atId;

    const {
        raw: testPlanReportRawAttributes,
        attributes: testPlanReportAttributes
    } = retrieveAttributes('testPlanReport', TEST_PLAN_REPORT_ATTRIBUTES, info);

    const { attributes: testPlanRunAttributes } = retrieveAttributes(
        'draftTestPlanRuns',
        TEST_PLAN_RUN_ATTRIBUTES,
        info,
        false
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

    if (isFinal === undefined) {
        // Do nothing
    } else testPlanReportAttributes.push('markedFinalAt');

    if (
        testPlanVersionPhases.length &&
        !testPlanVersionAttributes.includes('phase')
    )
        testPlanVersionAttributes.push('phase');

    let testPlanReports = await getTestPlanReports({
        where,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        pagination: { order: [['createdAt', 'desc']] },
        transaction
    });

    if (isFinal === undefined) {
        // Do nothing
    } else if (isFinal)
        testPlanReports = testPlanReports.filter(
            report => !!report.markedFinalAt
        );
    else if (!isFinal)
        testPlanReports = testPlanReports.filter(
            report => !report.markedFinalAt
        );

    if (testPlanVersionPhases.length) {
        return testPlanReports.filter(testPlanReport =>
            testPlanVersionPhases.includes(testPlanReport.testPlanVersion.phase)
        );
    } else return testPlanReports;
};

module.exports = testPlanReportsResolver;
