const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query } = require('../util/graphql-test-utilities');
const db = require('../../models');

jest.setTimeout(20000);

afterAll(async () => {
  await db.sequelize.close();
}, 20000);

/**
 * This test suite tests the structure of data returned
 * by the ariaHtmlFeaturesMetrics and ariaHtmlFeatureDetailReport queries.
 * It does not test the data itself so as to not tie to
 * any one iteration of aria-at too tightly.
 *
 */

const ariaHtmlFeaturesMetricsQuery = ({ transaction }) => {
  return query(
    gql`
      query {
        ariaHtmlFeaturesMetrics {
          ariaFeaturesPassedCount
          ariaFeaturesCount
          ariaFeaturesFailedCount
          ariaFeaturesUntestableCount
          htmlFeaturesPassedCount
          htmlFeaturesCount
          htmlFeaturesFailedCount
          htmlFeaturesUntestableCount
          ariaFeatures {
            refId
            type
            linkText
            value
            total
            passed
            failed
            untestable
            passedPercentage
          }
          ariaFeaturesByAtBrowser {
            refId
            atName
            browserName
            atId
            browserId
            total
            passed
            failed
            untestable
            passedPercentage
          }
          htmlFeatures {
            refId
            type
            linkText
            value
            total
            passed
            failed
            untestable
            passedPercentage
          }
          htmlFeaturesByAtBrowser {
            refId
            atName
            browserName
            atId
            browserId
            total
            passed
            failed
            untestable
            passedPercentage
          }
        }
      }
    `,
    { transaction }
  );
};

const ariaHtmlFeatureDetailReportQuery = (
  refId,
  atId,
  browserId,
  { transaction }
) => {
  return query(
    gql`
      query {
        ariaHtmlFeatureDetailReport(
          refId: "${refId}"
          atId: ${atId}
          browserId: ${browserId}
        ) {
          feature {
            refId
            type
            linkText
            value
            total
            passed
            failed
            untestable
            passedPercentage
          }
          at {
            id
            name
            key
          }
          browser {
            id
            name
            key
          }
          assertionStatistics {
            label
            passingCount
            passingTotal
            failingCount
            failingTotal
            untestableCount
            untestableTotal
            passingPercentage
            failingPercentage
            untestablePercentage
          }
          rows {
            testPlanName
            testPlanVersion
            testPlanVersionId
            testPlanReportId
            testTitle
            testId
            testResultId
            commandSequence
            assertionPriority
            assertionPhrase
            result
            testedOn
            atVersion
            browserVersion
            severeSideEffectsCount
            moderateSideEffectsCount
          }
        }
      }
    `,
    { transaction }
  );
};

describe('ARIA/HTML feature reports', () => {
  it('returns ARIA and HTML features metrics', async () => {
    await dbCleaner(async transaction => {
      const result = await ariaHtmlFeaturesMetricsQuery({ transaction });

      expect(result.ariaHtmlFeaturesMetrics).toBeDefined();
      expect(
        result.ariaHtmlFeaturesMetrics.ariaFeaturesCount
      ).toBeGreaterThanOrEqual(0);
      expect(
        result.ariaHtmlFeaturesMetrics.htmlFeaturesCount
      ).toBeGreaterThanOrEqual(0);
      expect(result.ariaHtmlFeaturesMetrics.ariaFeatures).toBeDefined();
      expect(result.ariaHtmlFeaturesMetrics.htmlFeatures).toBeDefined();
      expect(
        result.ariaHtmlFeaturesMetrics.ariaFeaturesByAtBrowser
      ).toBeDefined();
      expect(
        result.ariaHtmlFeaturesMetrics.htmlFeaturesByAtBrowser
      ).toBeDefined();
    });
  });

  it('returns ARIA features with valid structure', async () => {
    await dbCleaner(async transaction => {
      const result = await ariaHtmlFeaturesMetricsQuery({ transaction });

      const ariaFeatures = result.ariaHtmlFeaturesMetrics.ariaFeatures;
      expect(ariaFeatures.length).toBeGreaterThan(0);

      const ariFeature = ariaFeatures[0];
      expect(ariFeature.refId).toBeDefined();
      expect(ariFeature.type).toBeDefined();
      expect(ariFeature.total).toBeGreaterThanOrEqual(0);
      expect(ariFeature.passedPercentage).toBeGreaterThanOrEqual(0);
    });
  });

  it('returns ARIA features by AT/Browser with required fields', async () => {
    await dbCleaner(async transaction => {
      const result = await ariaHtmlFeaturesMetricsQuery({ transaction });

      const ariaByAtBrowser =
        result.ariaHtmlFeaturesMetrics.ariaFeaturesByAtBrowser;
      expect(ariaByAtBrowser.length).toBeGreaterThan(0);

      const feature = ariaByAtBrowser[0];
      expect(feature.refId).toBeDefined();
      expect(feature.atName).toBeDefined();
      expect(feature.browserName).toBeDefined();
      expect(feature.atId).toBeDefined();
      expect(feature.browserId).toBeDefined();
    });
  });

  it('returns detail report for ARIA/HTML feature with valid data', async () => {
    await dbCleaner(async transaction => {
      const metricsResult = await ariaHtmlFeaturesMetricsQuery({
        transaction
      });

      const ariaFeaturesByAtBrowser =
        metricsResult.ariaHtmlFeaturesMetrics.ariaFeaturesByAtBrowser;

      expect(ariaFeaturesByAtBrowser.length).toBeGreaterThan(0);

      const firstFeature = ariaFeaturesByAtBrowser[0];

      const detailResult = await ariaHtmlFeatureDetailReportQuery(
        firstFeature.refId,
        firstFeature.atId,
        firstFeature.browserId,
        { transaction }
      );

      expect(detailResult.ariaHtmlFeatureDetailReport).toBeDefined();
      expect(detailResult.ariaHtmlFeatureDetailReport.feature.refId).toBe(
        firstFeature.refId
      );
      expect(detailResult.ariaHtmlFeatureDetailReport.at.id).toBe(
        firstFeature.atId
      );
      expect(detailResult.ariaHtmlFeatureDetailReport.browser.id).toBe(
        firstFeature.browserId
      );

      expect(
        detailResult.ariaHtmlFeatureDetailReport.assertionStatistics
      ).toBeDefined();
      expect(
        detailResult.ariaHtmlFeatureDetailReport.assertionStatistics.length
      ).toBeGreaterThan(0);

      expect(detailResult.ariaHtmlFeatureDetailReport.rows).toBeDefined();
    });
  });

  it('returns assertion statistics with correct calculations', async () => {
    await dbCleaner(async transaction => {
      const metricsResult = await ariaHtmlFeaturesMetricsQuery({
        transaction
      });

      const ariaFeaturesByAtBrowser =
        metricsResult.ariaHtmlFeaturesMetrics.ariaFeaturesByAtBrowser;

      expect(ariaFeaturesByAtBrowser.length).toBeGreaterThan(0);

      const firstFeature = ariaFeaturesByAtBrowser[0];

      const detailResult = await ariaHtmlFeatureDetailReportQuery(
        firstFeature.refId,
        firstFeature.atId,
        firstFeature.browserId,
        { transaction }
      );

      const stats =
        detailResult.ariaHtmlFeatureDetailReport.assertionStatistics;

      expect(stats.length).toBeGreaterThan(0);

      const statsWithData = stats.filter(
        stat =>
          (stat.passingTotal || 0) +
            (stat.failingTotal || 0) +
            (stat.untestableTotal || 0) >
          0
      );

      expect(statsWithData.length).toBeGreaterThan(0);

      statsWithData.forEach(stat => {
        const passingPercentage = stat.passingPercentage || 0;
        const failingPercentage = stat.failingPercentage || 0;
        const untestablePercentage = stat.untestablePercentage || 0;

        expect(passingPercentage).toBeGreaterThanOrEqual(0);
        expect(failingPercentage).toBeGreaterThanOrEqual(0);
        expect(untestablePercentage).toBeGreaterThanOrEqual(0);

        const percentageTotal =
          passingPercentage + failingPercentage + untestablePercentage;

        expect(percentageTotal).toBe(100);
      });
    });
  });

  it('returns empty detail report for non-existent ARIA/HTML feature combination', async () => {
    await dbCleaner(async transaction => {
      const atsResult = await query(
        gql`
          query {
            ats {
              id
            }
          }
        `,
        { transaction }
      );

      const browsersResult = await query(
        gql`
          query {
            browsers {
              id
            }
          }
        `,
        { transaction }
      );

      const atId = atsResult.ats[0]?.id || 1;
      const browserId = browsersResult.browsers[0]?.id || 1;

      const detailResult = await ariaHtmlFeatureDetailReportQuery(
        'non-existent-feature',
        atId,
        browserId,
        { transaction }
      );

      expect(detailResult.ariaHtmlFeatureDetailReport).toBeDefined();
      expect(detailResult.ariaHtmlFeatureDetailReport.rows).toEqual([]);
      expect(
        detailResult.ariaHtmlFeatureDetailReport.assertionStatistics
      ).toBeDefined();
    });
  });

  it('returns rows with all required fields for detail report', async () => {
    await dbCleaner(async transaction => {
      const metricsResult = await ariaHtmlFeaturesMetricsQuery({
        transaction
      });

      const ariaFeaturesByAtBrowser =
        metricsResult.ariaHtmlFeaturesMetrics.ariaFeaturesByAtBrowser;

      expect(ariaFeaturesByAtBrowser.length).toBeGreaterThan(0);

      const firstFeature = ariaFeaturesByAtBrowser[0];

      const detailResult = await ariaHtmlFeatureDetailReportQuery(
        firstFeature.refId,
        firstFeature.atId,
        firstFeature.browserId,
        { transaction }
      );

      const rows = detailResult.ariaHtmlFeatureDetailReport.rows;
      expect(rows.length).toBeGreaterThan(0);

      const firstRow = rows[0];

      expect(firstRow.testPlanName).toBeDefined();
      expect(firstRow.testPlanVersion).toBeDefined();
      expect(firstRow.testPlanVersionId).toBeDefined();
      expect(firstRow.testPlanReportId).toBeDefined();
      expect(firstRow.testTitle).toBeDefined();
      expect(firstRow.testId).toBeDefined();
      expect(firstRow.testResultId).toBeDefined();
      expect(firstRow.commandSequence).toBeDefined();
      expect(firstRow.assertionPriority).toBeDefined();
      expect(firstRow.assertionPhrase).toBeDefined();
      expect(firstRow.result).toBeDefined();
      expect(['Passed', 'Failed', 'Untestable']).toContain(firstRow.result);
      expect(firstRow.testedOn).toBeDefined();
      expect(firstRow.atVersion).toBeDefined();
      expect(firstRow.browserVersion).toBeDefined();
      expect(typeof firstRow.severeSideEffectsCount).toBe('number');
      expect(typeof firstRow.moderateSideEffectsCount).toBe('number');
    });
  });
});
