const getGraphQLContext = require('../graphql-context');
const ariaHtmlFeaturesMetricsResolver = require('../resolvers/ariaHtmlFeaturesMetricsResolver');

const escape = value => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
};

const downloadARIAHtmlFeaturesCSV = async (req, res, next) => {
  try {
    const context = getGraphQLContext({ req });
    const metrics = await ariaHtmlFeaturesMetricsResolver(null, null, context);

    const headers = [
      'referenceId',
      'type',
      'linkText',
      'total',
      'passed',
      'failed',
      'untestable',
      'passedPercentage',
      'at',
      'browser'
    ];
    const rows =
      [
        ...metrics.ariaFeaturesByAtBrowser,
        ...metrics.htmlFeaturesByAtBrowser
      ] || [];
    rows.sort((a, b) => {
      const aRef = a.refId ?? '';
      const bRef = b.refId ?? '';
      if (String(aRef) !== String(bRef))
        return String(aRef).localeCompare(bRef);

      const aAt = a.atName ?? '';
      const bAt = b.atName ?? '';
      if (String(aAt) !== String(bAt)) return String(aAt).localeCompare(bAt);

      const aBrowser = a.browserName ?? '';
      const bBrowser = b.browserName ?? '';
      return String(aBrowser).localeCompare(bBrowser);
    });
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      csvLines.push(
        [
          escape(row.refId),
          escape(row.type),
          escape(row.linkText),
          escape(row.total),
          escape(row.passed),
          escape(row.failed),
          escape(row.untestable),
          escape(row.passedPercentage),
          escape(row.atName),
          escape(row.browserName)
        ].join(',')
      );
    }
    const csv = csvLines.join('\n');

    res.setHeader(
      'Content-Disposition',
      'attachment;filename="aria-html-features.csv"'
    );
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadARIAHtmlFeaturesCSV
};
