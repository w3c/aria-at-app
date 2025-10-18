import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '@components/common/ProgressBar';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';

const columnName = ({ atName, browserName }) => `${atName} and ${browserName}`;

const AriaSupportTable = ({ ariaHtmlFeaturesMetrics }) => {
  console.log(ariaHtmlFeaturesMetrics);
  const { ariaFeaturesByAtBrowser } = ariaHtmlFeaturesMetrics;
  console.log(ariaFeaturesByAtBrowser);

  const supportCombos = [...new Set(ariaFeaturesByAtBrowser.map(columnName))];

  const dataByFeature = {};
  const links = {};
  for (const row of ariaFeaturesByAtBrowser) {
    if (!dataByFeature[row.refId]) {
      dataByFeature[row.refId] = {};
    }
    links[row.refId] = { href: row.value, text: row.linkText };
    dataByFeature[row.refId][columnName(row)] = row;
  }

  const keys = Object.keys(dataByFeature).sort();

  return (
    <>
      <h2>ARIA Feature Support Levels</h2>
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
                <Link href={links[key].href}>{key}</Link>
              </td>
              {supportCombos.map(col => (
                <td key={key + col}>
                  <ProgressBar
                    progress={dataByFeature[key][col].passedPercentage}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

AriaSupportTable.propTypes = {
  ariaHtmlFeaturesMetrics: PropTypes.object.isRequired
};

export default AriaSupportTable;
