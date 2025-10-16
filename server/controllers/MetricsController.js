const getGraphQLContext = require('../graphql-context');
const ariaHtmlFeaturesMetricsResolver = require('../resolvers/ariaHtmlFeaturesMetricsResolver');

const escape = value => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
};

const downloadARIAHtmlFeaturesCSV = async (req, res, next) => {
  try {
    const { at, browser, refId } = req.query;

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
    const filteredRows = rows.filter(row => {
      const matchesAt = !at || row.atName === at;
      const matchesBrowser = !browser || row.browserName === browser;
      const matchesRefId = !refId || row.refId === refId;
      return matchesAt && matchesBrowser && matchesRefId;
    });
    if (filteredRows.length === 0) {
      return res.status(404).json({
        error: 'No data found for the specified filter'
      });
    }
    filteredRows.sort((a, b) => {
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

    for (const row of filteredRows) {
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

    const filterParts = [];
    if (at) filterParts.push(at.trim());
    if (browser) filterParts.push(browser.trim());
    if (refId) filterParts.push(`Support-for-${refId.trim()}`);

    const filterString = filterParts.join('+');
    const filename = filterString
      ? `${filterString}-ARIA-AT.csv`
      : 'ARIA-AT.csv';

    res.setHeader('Content-Disposition', `attachment;filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadARIAHtmlFeaturesCSV
};
