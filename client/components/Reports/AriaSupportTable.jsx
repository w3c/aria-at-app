import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '@components/common/ProgressBar';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';

const columnName = ({ atName, browserName }) => `${atName} and ${browserName}`;

const AriaSupportTable = ({ ariaHtmlFeaturesMetrics, headingText }) => {
  const { ariaFeaturesByAtBrowser } = ariaHtmlFeaturesMetrics;

  const supportCombos = [...new Set(ariaFeaturesByAtBrowser.map(columnName))];

  const dataByFeature = {};
  const links = {};
  const atBrowserLinks = {};
  for (const row of ariaFeaturesByAtBrowser) {
    if (!dataByFeature[row.refId]) {
      dataByFeature[row.refId] = {};
      atBrowserLinks[row.refId] = {};
    }
    links[row.refId] = { href: row.value, text: row.linkText };
    dataByFeature[row.refId][columnName(row)] = row;
    atBrowserLinks[row.refId][columnName(row)] = {
      atId: row.atId,
      browserId: row.browserId
    };
  }

  const keys = Object.keys(dataByFeature).sort();

  return (
    <>
      <h2>{headingText || 'ARIA Feature Support Levels'}</h2>
      <p id="aria-feature-support-levels-table-description"></p>
      <Table bordered responsive aria-label="ARIA Feature Support Levels">
        <thead>
          <tr>
            <th>ARIA Feature</th>
            {supportCombos.map(name => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map(key => (
            <tr key={key}>
              <td>
                <a href={links[key].href} rel="noreferrer" target="_blank">
                  {key}
                </a>
              </td>
              {supportCombos.map(col => {
                const row = dataByFeature[key][col];
                const ids = atBrowserLinks[key][col];
                const detailLink = `/aria-html-feature/${ids.atId}/${ids.browserId}/${key}`;
                return (
                  <td key={key + col}>
                    <Link
                      to={detailLink}
                      aria-label={`${row.passedPercentage}%`}
                    >
                      <ProgressBar progress={row.passedPercentage} />
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

AriaSupportTable.propTypes = {
  ariaHtmlFeaturesMetrics: PropTypes.object.isRequired,
  headingText: PropTypes.string
};

export default AriaSupportTable;
